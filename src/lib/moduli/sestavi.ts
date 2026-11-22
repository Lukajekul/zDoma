// composePlan: discharge facts → one merged, de-duplicated list, waiting for a
// clinician to review and approve it. Pure, no I/O, no condition-specific code.
import { razlikaDni } from "@/lib/triage/datumi";
import { NAJVEC_DNEVNIH_VPRASANJ } from "@/lib/templates";
import type { IsoDateTime } from "@/lib/types";
import { strozje } from "./strozje";
import type { Banka, DejstvaPacienta, Modul, Pogostost, Postavka, PraviloModula } from "./types";

export interface VnosNacrta {
  /** Snapshot of the kept item (from the highest-priority module listing its concept). */
  postavka: Postavka;
  /** Snapshot of its follow-up, if any. */
  nadaljnje?: Postavka;
  /** Module whose item is kept, and every module that listed the concept. */
  modul: string;
  moduli: string[];
  prednost: number;
  pogostost: Pogostost;
  aktivniDnevi?: [number, number];
  bistveno: boolean;
}

export interface PraviloNacrta {
  pravilo: PraviloModula;
  /** Module whose threshold won (the dashboard shows it), and every module that had the rule. */
  modul: string;
  moduli: string[];
}

export interface Nacrt {
  verzija: number;
  dejstva: DejstvaPacienta;
  moduli: string[];
  vnosi: VnosNacrta[];
  pravila: PraviloNacrta[];
  /** Notes for the reviewing clinician (over budget, rules that could not be carried over). */
  opozorila: string[];
  status: "caka-pregled" | "odobren";
  odstranjeno: string[];
  odobril?: string;
  odobreno?: IsoDateTime;
}

const POGOSTOST_RANG: Record<Pogostost, number> = { dnevno: 0, vsak2dan: 1, tedensko: 2 };
const imaPredpono = (kode: string[], predpone: string[] = []) =>
  kode.some((k) => predpone.some((p) => k.toUpperCase().startsWith(p.toUpperCase())));

export function jeAktiven(m: Modul, d: DejstvaPacienta): boolean {
  const a = m.aktivacija;
  return (
    !!a.vedno ||
    imaPredpono(d.mkb10, a.mkb10) ||
    d.posegi.some((p) => a.posegi?.includes(p)) ||
    imaPredpono(d.zdravila.map((z) => z.atc), a.atc)
  );
}

/** Last recovery day a medicine module applies, or undefined when any matching medicine has no end. */
function konecZdravila(m: Modul, d: DejstvaPacienta): number | undefined {
  if (m.vrsta !== "zdravilo") return undefined;
  const ujemajo = d.zdravila.filter((z) => imaPredpono([z.atc], m.aktivacija.atc));
  if (ujemajo.length === 0 || ujemajo.some((z) => !z.konec)) return undefined;
  return Math.max(...ujemajo.map((z) => razlikaDni(d.odpust, z.konec!)));
}

function zdruziOkno(a?: [number, number], b?: [number, number]): [number, number] | undefined {
  if (!a || !b) return undefined;
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

function odgovoriPravila(p: PraviloModula): string[] {
  return p.tip === "odgovor" || p.tip === "zaporedniDnevi" || p.tip === "poDnevu" ? p.odgovori : [];
}

export function sestaviNacrt(dejstva: DejstvaPacienta, banka: Banka): Nacrt {
  const postavka = new Map(banka.postavke.map((p) => [p.id, p]));
  const aktivni = banka.moduli.filter((m) => jeAktiven(m, dejstva)).sort((a, b) => a.prednost - b.prednost);
  const poKonceptu = new Map<string, VnosNacrta>();
  const opozorila: string[] = [];

  for (const m of aktivni) {
    const konec = konecZdravila(m, dejstva);
    for (const pm of m.postavke) {
      const p = postavka.get(pm.postavka)!;
      let okno = pm.aktivniDnevi;
      if (konec !== undefined) okno = [okno?.[0] ?? 0, Math.min(okno?.[1] ?? konec, konec)];
      const obstojec = poKonceptu.get(p.koncept);
      if (!obstojec) {
        const nadaljnje = p.nadaljnje && postavka.get(p.nadaljnje.postavka);
        poKonceptu.set(p.koncept, {
          postavka: p, nadaljnje, modul: m.id, moduli: [m.id], prednost: m.prednost,
          pogostost: pm.pogostost, aktivniDnevi: okno, bistveno: !!pm.bistveno,
        });
        continue;
      }
      obstojec.moduli.push(m.id);
      obstojec.aktivniDnevi = zdruziOkno(obstojec.aktivniDnevi, okno);
      obstojec.bistveno ||= !!pm.bistveno;
      if (POGOSTOST_RANG[pm.pogostost] < POGOSTOST_RANG[obstojec.pogostost]) obstojec.pogostost = pm.pogostost;
    }
  }

  const vnosi = [...poKonceptu.values()];
  // Every item id a module listed → the item kept for its concept (same for follow-ups).
  const kam = new Map<string, Postavka>();
  for (const vn of vnosi) {
    if (vn.nadaljnje) kam.set(vn.nadaljnje.id, vn.nadaljnje);
    for (const m of aktivni) for (const pm of m.postavke) {
      const p = postavka.get(pm.postavka)!;
      if (p.koncept === vn.postavka.koncept) kam.set(p.id, vn.postavka);
    }
  }

  const poId = new Map<string, PraviloNacrta>();
  for (const m of aktivni) {
    for (const pr of m.pravila) {
      const cilj = kam.get(pr.vprasanje);
      const ids = cilj?.tip === "izbira" ? new Set(cilj.odgovori.map((o) => o.id)) : undefined;
      if (!cilj || (ids && odgovoriPravila(pr).some((o) => !ids.has(o)))) {
        opozorila.push(`Pravilo »${pr.id}« (${m.id}) ni preneseno: vprasanje ${pr.vprasanje} ni v načrtu ali nima teh odgovorov.`);
        continue;
      }
      const pravilo = { ...pr, vprasanje: cilj.id };
      const prej = poId.get(pr.id);
      if (!prej) poId.set(pr.id, { pravilo, modul: m.id, moduli: [m.id] });
      else {
        prej.moduli.push(m.id);
        if (strozje(pravilo, prej.pravilo) === pravilo) Object.assign(prej, { pravilo, modul: m.id });
      }
    }
  }

  const obvezna = vnosi.filter((vn) => vn.pogostost === "dnevno" && (vn.postavka.raven <= 1 || vn.bistveno)).length;
  if (obvezna > NAJVEC_DNEVNIH_VPRASANJ)
    opozorila.push(`Na dan bo ${obvezna} obveznih vprašanj, več kot ${NAJVEC_DNEVNIH_VPRASANJ}. Odstranite katero ali potrdite.`);

  return {
    verzija: 1,
    dejstva,
    moduli: aktivni.map((m) => m.id),
    vnosi,
    pravila: [...poId.values()],
    opozorila,
    status: "caka-pregled",
    odstranjeno: [],
  };
}

export interface Odobritev {
  /** Item ids the clinician removes. Red flags (raven 0) can't be removed. */
  odstrani: string[];
  pregledal: string;
  cas: IsoDateTime;
}

/** Clinician review: remove items (and their rules), then freeze the plan as the approved snapshot. */
export function odobriNacrt(nacrt: Nacrt, o: Odobritev): { nacrt?: Nacrt; napake: string[] } {
  const napake: string[] = [];
  for (const id of o.odstrani) {
    const vn = nacrt.vnosi.find((x) => x.postavka.id === id);
    if (!vn) napake.push(`Vprašanja ${id} ni v načrtu.`);
    else if (vn.postavka.raven === 0) napake.push(`Nujnih znakov (${id}) ni mogoče odstraniti.`);
  }
  if (napake.length) return { napake };
  const ven = new Set(o.odstrani);
  const ostanejo = nacrt.vnosi.filter((vn) => !ven.has(vn.postavka.id));
  const vprasanja = new Set(ostanejo.flatMap((vn) => [vn.postavka.id, vn.nadaljnje?.id]));
  return {
    napake,
    nacrt: {
      ...nacrt,
      vnosi: ostanejo,
      pravila: nacrt.pravila.filter((p) => vprasanja.has(p.pravilo.vprasanje)),
      status: "odobren",
      odstranjeno: [...nacrt.odstranjeno, ...o.odstrani],
      odobril: o.pregledal,
      odobreno: o.cas,
    },
  };
}
