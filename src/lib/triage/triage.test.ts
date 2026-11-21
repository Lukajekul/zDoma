import { describe, expect, it } from "vitest";
import { predloge } from "@/lib/templates";
import { laceScore, laceTveganje, oceniPregled, tedenskiPovzetek, type DanOdgovori } from ".";

const hf = predloge["srcno-popuscanje"];
const vrednosti = { suhaTeza: 72, ciljniTlak: "130/80", zdraviloZaVodo: "Furosemid" };
const dobro = { teza: 72, dusenje: "ne", otekline: "ne", diuretik: "da", "prsi-omedlevica": "ne", tlak: "pod-ciljem" };
const dan = (datum: string, odgovori: DanOdgovori["odgovori"]): DanOdgovori => ({ datum, odgovori });

describe("LACE", () => {
  it("scores a normal case", () => {
    expect(laceScore({ l: 5, a: true, c: 2, e: 1 })).toEqual({ l: 4, a: 3, c: 2, e: 1, skupaj: 10 });
    expect(laceTveganje(10)).toBe("visoko");
  });

  it("caps each part at its maximum", () => {
    expect(laceScore({ l: 30, a: true, c: 9, e: 12 }).skupaj).toBe(19);
    expect(laceScore({ l: 0, a: false, c: 0, e: 0 }).skupaj).toBe(0);
    expect(laceTveganje(4)).toBe("nizko");
  });
});

describe("check-in triage", () => {
  it("normal day is green", () => {
    const o = oceniPregled({ predloga: hf, vrednosti, danes: dan("2026-11-21", dobro), prejsnji: [] });
    expect(o.status).toBe("zeleno");
    expect(o.razlogi).toEqual([]);
  });

  it("demo patient: +2,5 kg in 3 days, swollen ankles, missed diuretic → red with reasons", () => {
    const o = oceniPregled({
      predloga: hf,
      vrednosti,
      danes: dan("2026-11-21", { ...dobro, teza: 74.5, otekline: "da", diuretik: "ne" }),
      prejsnji: [dan("2026-11-18", dobro), dan("2026-11-19", { ...dobro, teza: 73 })],
    });
    expect(o.status).toBe("rdece");
    expect(o.razlogi.map((r) => r.besedilo)).toEqual([
      "Teža +2,5 kg v 3 dneh",
      "Teža 2,5 kg nad suho težo",
      "Bolj otekli gležnji ali noge",
      "Izpuščen diuretik",
    ]);
    expect(o.nujno).toBeUndefined();
  });

  it("chest pain → 112 first; two weight rules on one question count as one alert", () => {
    const o = oceniPregled({
      predloga: hf,
      vrednosti,
      danes: dan("2026-11-21", { ...dobro, teza: 72.5, "prsi-omedlevica": "da" }),
      prejsnji: [],
    });
    expect(o.nujno?.stopnja).toBe("klic112");
    expect(o.razlogi[0].stopnja).toBe("klic112");

    const samoTeza = oceniPregled({
      predloga: hf,
      vrednosti,
      danes: dan("2026-11-21", { ...dobro, teza: 74.5 }),
      prejsnji: [dan("2026-11-20", dobro)],
    });
    expect(samoTeza.razlogi).toHaveLength(2);
    expect(samoTeza.status).toBe("rumeno");
  });

  it("edge: unticked questions, gaps in history, 'Nimam ga' is only a note", () => {
    const o = oceniPregled({
      predloga: hf,
      vrednosti,
      izbranaVprasanja: ["teza", "tlak"],
      danes: dan("2026-11-21", { ...dobro, otekline: "da", tlak: "nimam" }),
      prejsnji: [],
    });
    expect(o.status).toBe("zeleno");
    expect(o.opombe.map((r) => r.besedilo)).toEqual(["Brez merilnika tlaka"]);

    const kopb = predloge.kopb;
    const kasel = (datum: string) => dan(datum, { kasel: "da" });
    const zVrzeljo = oceniPregled({ predloga: kopb, vrednosti: {}, danes: kasel("2026-11-21"), prejsnji: [kasel("2026-11-19")] });
    expect(zVrzeljo.status).toBe("zeleno");
    const zapored = oceniPregled({ predloga: kopb, vrednosti: {}, danes: kasel("2026-11-21"), prejsnji: [kasel("2026-11-20")] });
    expect(zapored.razlogi.map((r) => r.besedilo)).toEqual(["Več kašlja 2 dni zapored"]);
  });

  it("pain rising 3 days in a row on hip/knee", () => {
    const kk = predloge["kolk-koleno"];
    const b = (datum: string, bolecina: string) => dan(datum, { bolecina });
    const o = oceniPregled({
      predloga: kk,
      vrednosti: {},
      danes: b("2026-11-21", "6-8"),
      prejsnji: [b("2026-11-19", "0-2"), b("2026-11-20", "3-5")],
    });
    expect(o.razlogi.map((r) => r.besedilo)).toEqual(["Bolečina narašča 3 dni zapored"]);
  });
});

describe("weekly summary", () => {
  it("counts check-ins, statuses, weight and reasons", () => {
    const p = tedenskiPovzetek({
      predloga: hf,
      vrednosti,
      doDne: "2026-11-21",
      pregledi: [
        dan("2026-11-13", dobro), // outside the 7 days
        dan("2026-11-18", dobro),
        dan("2026-11-20", { ...dobro, otekline: "da" }),
        dan("2026-11-21", { ...dobro, teza: 73, otekline: "da" }),
      ],
    });
    expect(p.opravljenih).toBe(3);
    expect(p.statusi).toEqual({ zeleno: 1, rumeno: 1, rdece: 1 });
    expect(p.vrstice).toContain("Pregled opravljen 3 od 7 dni");
    expect(p.vrstice).toContain("Teža: 72,0 → 73,0 kg (+1,0 kg)");
    expect(p.vrstice).toContain("Bolj otekli gležnji ali noge – 2 dneva");
  });
});
