import { describe, expect, it } from "vitest";
import type { CheckinAnswers } from "@/lib/types";
import {
  banka, izberiDanes, nadaljnjeZa, oceniNacrt, odobriNacrt, preveriBanko, sestaviNacrt, zamujeniPregledi,
  type Banka, type DanZgodovine, type DejstvaPacienta, type Nacrt,
} from ".";

const dejstva = (d: Partial<DejstvaPacienta>): DejstvaPacienta => ({ odpust: "2026-11-20", mkb10: [], posegi: [], zdravila: [], ...d });
const ids = (n: Nacrt) => n.vnosi.map((v) => v.postavka.id);
const danes = (n: Nacrt, dan: number, z: DanZgodovine[] = [], nast = {}) => izberiDanes(n, dan, z, nast);
const vsiDnevi = (n: Nacrt, do_: number, odgovori: CheckinAnswers = {}): DanZgodovine[] =>
  Array.from({ length: do_ }, (_, dan) => ({ dan, oznacene: [], odgovori: Object.fromEntries(ids(n).map((id) => [id, odgovori[id] ?? "x"])) }));

const koleno = dejstva({ posegi: ["endoproteza-kolena"], zdravila: [{ atc: "B01AF01", ime: "Xarelto" }] });
const srce = dejstva({ mkb10: ["I50.1"], zdravila: [{ atc: "C03CA01", ime: "Lasix" }] });
const pljuca = dejstva({ mkb10: ["J18.9"], zdravila: [{ atc: "J01CA04", konec: "2026-11-27" }] });

describe("item bank", () => {
  it("is valid", () => expect(preveriBanko(banka)).toEqual([]));

  it("catches a nested follow-up and a rule on an unknown answer", () => {
    const pokvarjena: Banka = {
      postavke: banka.postavke.map((p) => (p.id === "sp.dusenje-lezanje.v1" ? { ...p, nadaljnje: { ko: ["da"], postavka: "sp.dusenje.v1" } } : p)),
      moduli: banka.moduli.map((m) => (m.id === "jedro" ? { ...m, pravila: [{ ...m.pravila[0], odgovori: ["mogoce"] }] } : m)),
    };
    const napake = preveriBanko(pokvarjena);
    expect(napake.some((n) => n.includes("one level deep"))).toBe(true);
    expect(napake.some((n) => n.includes("unknown answer mogoce"))).toBe(true);
  });
});

describe("patient A: knee replacement on an anticoagulant, day 4", () => {
  const n = sestaviNacrt(koleno, banka);

  it("switches on core, anticoagulant and knee modules", () => {
    expect(n.moduli).toEqual(["jedro", "zdravilo:antikoagulant", "poseg:endoproteza-kolena"]);
    expect(n.status).toBe("caka-pregled");
  });

  it("asks red flags first, keeps essential items, defers exercises over budget", () => {
    const i = danes(n, 4, vsiDnevi(n, 4));
    expect(i.vprasanja.map((v) => v.postavka.id)).toEqual([
      "jedro.nujno.v1", "ak.vzeto.v1", "ak.krvavitev.v1", "ko.bolecina.v1", "ko.rana.v1", "ko.meca.v1",
    ]);
    expect(i.odlozeno).toEqual(["ko.vaje.v1"]);
  });

  it("drops wound questions after day 14 and never asks the unlicensed EQ-5D-5L", () => {
    const i = danes(n, 15, vsiDnevi(n, 15)).vprasanja.map((v) => v.postavka.id);
    expect(i).not.toContain("ko.rana.v1");
    expect(i).toContain("ko.meca.v1");
    expect(i).not.toContain("jedro.eq5d5l.v1");
  });

  it("wound redness → follow-up; spreading → red with the source", () => {
    const rana = n.vnosi.find((v) => v.postavka.id === "ko.rana.v1")!;
    expect(nadaljnjeZa(rana, "v-redu")).toBeUndefined();
    expect(nadaljnjeZa(rana, "rdeca")?.id).toBe("ko.rana-siri.v1");
    const o = oceniNacrt({ nacrt: n, vrednosti: {}, dan: 4, prejsnji: [],
      danes: { datum: "2026-11-24", odgovori: { "ko.rana.v1": "rdeca", "ko.rana-siri.v1": "da" } } });
    expect(o.status).toBe("rdece");
    expect(o.oznake[0].vir.opis).toContain("ECDC");
    expect(o.oznake[0].modul).toBe("poseg:endoproteza-kolena");
  });
});

describe("patient B: heart failure on a diuretic", () => {
  it("adding the diuretic adds its two items", () => {
    const brez = sestaviNacrt({ ...srce, zdravila: [] }, banka);
    const z = sestaviNacrt(srce, banka);
    expect(ids(z).filter((id) => !ids(brez).includes(id))).toEqual(["di.vzeto.v1", "di.omotica.v1"]);
    expect(danes(z, 1).vprasanja).toHaveLength(6);
  });

  it("breathlessness worse → yellow; follow-up 'more pillows' → red", () => {
    const n = sestaviNacrt(srce, banka);
    const oceni = (odgovori: CheckinAnswers) =>
      oceniNacrt({ nacrt: n, vrednosti: { suhaTeza: 72 }, dan: 3, prejsnji: [], danes: { datum: "2026-11-23", odgovori } });
    const rumeno = oceni({ "sp.dusenje.v1": "slabse", "sp.dusenje-lezanje.v1": "ne" });
    expect(rumeno.status).toBe("rumeno");
    expect(rumeno.oznake[0]).toMatchObject({ besedilo: "Težja sapa kot običajno", modul: "stanje:srcno-popuscanje" });
    expect(oceni({ "sp.dusenje.v1": "slabse", "sp.dusenje-lezanje.v1": "da" }).status).toBe("rdece");
  });

  it("weight against own trend: +2,5 kg in 3 days", () => {
    const n = sestaviNacrt(srce, banka);
    const o = oceniNacrt({ nacrt: n, vrednosti: { suhaTeza: 75 }, dan: 3,
      danes: { datum: "2026-11-23", odgovori: { "sp.teza.v1": 74.5 } },
      prejsnji: [{ datum: "2026-11-20", odgovori: { "sp.teza.v1": 72 } }] });
    expect(o.oznake.map((x) => x.besedilo)).toEqual(["Teža +2,5 kg v 3 dneh"]);
    expect(o.oznacene).toEqual(["sp.teza.v1"]);
  });

  it("an abnormal answer keeps the follow-up on for the next 3 days", () => {
    const n = sestaviNacrt(srce, banka);
    const z = vsiDnevi(n, 5);
    z[3].oznacene = ["sp.dusenje.v1"];
    expect(danes(n, 5, z).nadaljnjeVedno).toEqual(["sp.dusenje.v1"]);
    expect(danes(n, 7, vsiDnevi(n, 7).map((d) => (d.dan === 3 ? { ...d, oznacene: ["sp.dusenje.v1"] } : d))).nadaljnjeVedno).toEqual([]);
  });
});

describe("patient C: pneumonia on a 7-day antibiotic", () => {
  const n = sestaviNacrt(pljuca, banka);

  it("asks the antibiotic only until the course ends", () => {
    const dan = (d: number) => danes(n, d, vsiDnevi(n, d)).vprasanja.map((v) => v.postavka.id);
    expect(dan(2)).toEqual(["jedro.nujno.v1", "pl.vrocina.v1", "pl.dusenje.v1", "ab.vzeto.v1"]);
    expect(dan(8)).not.toContain("ab.vzeto.v1");
    expect(dan(11)).not.toContain("pl.vrocina.v1");
  });

  it("fever is expected on day 5, a flag on day 9", () => {
    const oceni = (dan: number) => oceniNacrt({ nacrt: n, vrednosti: {}, dan, prejsnji: [],
      danes: { datum: "2026-11-29", odgovori: { "pl.vrocina.v1": "da" } } });
    expect(oceni(5).status).toBe("zeleno");
    expect(oceni(9).oznake[0]).toMatchObject({ besedilo: "Vročina še 9. dan po odpustu", praviloId: "vrocina-po-7-dnevu" });
  });

  it("rotates phase items over budget: the one asked longest ago wins", () => {
    const z: DanZgodovine[] = [
      { dan: 0, oznacene: [], odgovori: { "pl.vrocina.v1": "ne", "pl.kaselj.v1": "enako" } },
      { dan: 1, oznacene: [], odgovori: { "pl.vrocina.v1": "ne" } },
    ];
    const i = danes(n, 2, z, { proracun: 4 });
    expect(i.vprasanja.map((v) => v.postavka.id)).toContain("pl.kaselj.v1");
    expect(i.odlozeno).toEqual(["pl.vrocina.v1"]);
  });
});

describe("multimorbid patient", () => {
  it("heart failure + pneumonia asks breathlessness once, both modules credited", () => {
    const n = sestaviNacrt(dejstva({ mkb10: ["I50.9", "J18.1"] }), banka);
    const dusenje = n.vnosi.filter((v) => v.postavka.koncept === "dusenje");
    expect(dusenje).toHaveLength(1);
    expect(dusenje[0]).toMatchObject({ modul: "stanje:srcno-popuscanje", moduli: ["stanje:srcno-popuscanje", "stanje:pljucnica"] });
    const pravilo = n.pravila.find((p) => p.pravilo.id === "dusenje-slabse")!;
    expect(pravilo.pravilo.vprasanje).toBe("sp.dusenje.v1");
    expect(pravilo.moduli).toHaveLength(2);
  });

  it("heart failure + knee + both medicines warns the reviewer and never trims red flags or core items", () => {
    const n = sestaviNacrt(dejstva({ mkb10: ["I50"], posegi: ["endoproteza-kolena"], zdravila: [...koleno.zdravila, ...srce.zdravila] }), banka);
    expect(n.opozorila.some((o) => o.includes("obveznih vprašanj"))).toBe(true);
    const i = danes(n, 4, vsiDnevi(n, 4));
    expect(i.vprasanja[0].postavka.id).toBe("jedro.nujno.v1");
    expect(i.vprasanja.length).toBeGreaterThan(6);
    expect(i.odlozeno).toEqual(expect.arrayContaining(["ko.vaje.v1", "di.omotica.v1"]));
  });

  it("the stricter threshold wins and records its module", () => {
    const strozja: Banka = {
      ...banka,
      moduli: [...banka.moduli, { id: "stanje:test", vrsta: "stanje", ime: "Test", aktivacija: { mkb10: ["X99"] }, prednost: 50,
        postavke: [{ postavka: "sp.teza.v1", pogostost: "dnevno" }],
        pravila: [{ ...banka.moduli[1].pravila[0], vecKot: 1.5 } as never] }],
    };
    const n = sestaviNacrt(dejstva({ mkb10: ["I50", "X99"] }), strozja);
    const p = n.pravila.find((x) => x.pravilo.id === "teza-3-dni")!;
    expect(p).toMatchObject({ modul: "stanje:test", pravilo: { vecKot: 1.5 } });
  });
});

describe("clinician review and timing", () => {
  it("can remove items with their rules, not red flags", () => {
    const n = sestaviNacrt(koleno, banka);
    expect(odobriNacrt(n, { odstrani: ["jedro.nujno.v1"], pregledal: "dr. Kos", cas: "2026-11-20T10:00:00Z" }).napake).toHaveLength(1);
    const { nacrt } = odobriNacrt(n, { odstrani: ["ko.meca.v1"], pregledal: "dr. Kos", cas: "2026-11-20T10:00:00Z" });
    expect(nacrt).toMatchObject({ status: "odobren", odobril: "dr. Kos", odstranjeno: ["ko.meca.v1"] });
    expect(nacrt!.pravila.some((p) => p.pravilo.id === "meca")).toBe(false);
  });

  it("stable phase item steps down to every other day", () => {
    const n = sestaviNacrt(dejstva({ posegi: ["endoproteza-kolena"] }), banka);
    expect(danes(n, 5, vsiDnevi(n, 5)).vprasanja.map((v) => v.postavka.id)).not.toContain("ko.vaje.v1");
    expect(danes(n, 3, vsiDnevi(n, 3)).vprasanja.map((v) => v.postavka.id)).toContain("ko.vaje.v1");
  });

  it("weekly licensed instrument: day 0, then a week later", () => {
    const n = sestaviNacrt(srce, {
      ...banka,
      postavke: banka.postavke.map((p) => (p.id === "jedro.eq5d5l.v1" ? { ...p, licencaUrejena: true } : p)),
    });
    const ima = (dan: number, z: DanZgodovine[]) =>
      danes(n, dan, z, { proracun: 10 }).vprasanja.some((v) => v.postavka.id === "jedro.eq5d5l.v1");
    const z = [{ dan: 0, oznacene: [], odgovori: { "jedro.eq5d5l.v1": "izpolnjeno" } }];
    expect([ima(0, []), ima(3, z), ima(7, z)]).toEqual([true, false, true]);
  });

  it("missed check-ins escalate: patient, then zadolženec, then staff", () => {
    expect(zamujeniPregledi(3, [{ dan: 0 }, { dan: 1 }, { dan: 2 }])).toBeUndefined();
    expect(zamujeniPregledi(3, [{ dan: 0 }, { dan: 1 }])?.korak).toBe("opomnik");
    expect(zamujeniPregledi(3, [{ dan: 0 }])).toMatchObject({ dni: 2, korak: "zadolzenec" });
    expect(zamujeniPregledi(4, [])).toMatchObject({ dni: 4, korak: "osebje", besedilo: "Brez dnevnega pregleda 4 dni zapored" });
  });
});
