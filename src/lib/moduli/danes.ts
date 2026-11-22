// selectToday: what an approved plan asks on one recovery day. Pure, no I/O.
import { NAJVEC_DNEVNIH_VPRASANJ } from "@/lib/templates";
import type { CheckinAnswer, CheckinAnswers } from "@/lib/types";
import type { Nacrt, VnosNacrta } from "./sestavi";
import type { Postavka } from "./types";

export interface DanZgodovine {
  /** Recovery day (0 = discharge day). */
  dan: number;
  odgovori: CheckinAnswers;
  /** Item ids an alert fired on that day (from `oceniNacrt`). */
  oznacene: string[];
}

export interface NastavitveIzbora {
  /** Screens per day, follow-ups not counted. */
  proracun: number;
  /** Stable days after which a raven-2 daily item drops to every other day (clinician-set). */
  stabilnihDni: number;
  /** After an abnormal answer the item stays daily, with its follow-up, for this many days. */
  korakNavzgorDni: number;
}

export const PRIVZETE_NASTAVITVE: NastavitveIzbora = {
  proracun: NAJVEC_DNEVNIH_VPRASANJ,
  stabilnihDni: 5,
  korakNavzgorDni: 3,
};

export interface IzborDneva {
  /** In display order: red flags first. */
  vprasanja: VnosNacrta[];
  /** Item ids whose follow-up is asked whatever today's answer (step-up after an abnormal answer). */
  nadaljnjeVedno: string[];
  /** Due today but left out to keep within the budget (they come first next time). */
  odlozeno: string[];
}

const vOknu = (vn: VnosNacrta, dan: number) =>
  !vn.aktivniDnevi || (dan >= vn.aktivniDnevi[0] && dan <= vn.aktivniDnevi[1]);

const jeObvezno = (vn: VnosNacrta) => vn.postavka.raven <= 1 || vn.bistveno;

export function izberiDanes(
  nacrt: Nacrt,
  dan: number,
  zgodovina: DanZgodovine[],
  nastavitve: Partial<NastavitveIzbora> = {},
): IzborDneva {
  const n = { ...PRIVZETE_NASTAVITVE, ...nastavitve };
  const prej = zgodovina.filter((z) => z.dan < dan);
  const dniOdZadnjega = (id: string) => {
    const dnevi = prej.filter((z) => z.odgovori[id] !== undefined).map((z) => z.dan);
    return dnevi.length ? dan - Math.max(...dnevi) : Infinity;
  };
  const korakNavzgor = (id: string) =>
    prej.some((z) => z.dan >= dan - n.korakNavzgorDni && z.oznacene.includes(id));
  const stabilno = (id: string) => {
    for (let d = dan - n.stabilnihDni; d < dan; d++) {
      const z = prej.find((x) => x.dan === d);
      if (!z || z.odgovori[id] === undefined || z.oznacene.includes(id)) return false;
    }
    return true;
  };

  const nadaljnjeVedno: string[] = [];
  const navzgor = new Set<string>();
  const dospela: VnosNacrta[] = [];
  for (const vn of nacrt.vnosi) {
    const p = vn.postavka;
    if (!vOknu(vn, dan)) continue;
    if (p.status === "validiran" && p.licencaUrejena !== true) continue;
    const gor = korakNavzgor(p.id);
    if (gor) navzgor.add(p.id);
    if (gor && vn.nadaljnje) nadaljnjeVedno.push(p.id);
    const od = dniOdZadnjega(p.id);
    let zdaj: boolean;
    if (gor) zdaj = true;
    else if (vn.pogostost === "tedensko") zdaj = od >= 7;
    else if (vn.pogostost === "vsak2dan") zdaj = od >= 2;
    // Step-down: a stable phase item (raven 2, not essential) moves to every other day.
    else zdaj = p.raven === 2 && !vn.bistveno && stabilno(p.id) ? od >= 2 : true;
    if (zdaj) dospela.push(vn);
  }

  // Red flags, core trend, essential and stepped-up items are never trimmed.
  const obvezno = (vn: VnosNacrta) => jeObvezno(vn) || navzgor.has(vn.postavka.id);
  const obvezna = dospela.filter(obvezno);
  const ostala = dospela
    .filter((vn) => !obvezno(vn))
    .map((vn, i) => ({ vn, i, od: dniOdZadnjega(vn.postavka.id) }))
    .sort((a, b) => a.vn.postavka.raven - b.vn.postavka.raven || a.vn.prednost - b.vn.prednost || b.od - a.od || a.i - b.i)
    .map((x) => x.vn);
  const prostor = Math.max(0, n.proracun - obvezna.length);
  const izbrana = new Set([...obvezna, ...ostala.slice(0, prostor)]);

  return {
    vprasanja: nacrt.vnosi.filter((vn) => izbrana.has(vn)).sort((a, b) => Number(a.postavka.raven !== 0) - Number(b.postavka.raven !== 0)),
    nadaljnjeVedno: nadaljnjeVedno.filter((id) => [...izbrana].some((vn) => vn.postavka.id === id)),
    odlozeno: ostala.slice(prostor).map((vn) => vn.postavka.id),
  };
}

/** The follow-up to ask right after this item, given its answer (one level, outside the budget). */
export function nadaljnjeZa(vn: VnosNacrta, odgovor: CheckinAnswer | undefined, vedno = false): Postavka | undefined {
  const pogoj = vn.postavka.nadaljnje;
  if (!pogoj || !vn.nadaljnje) return undefined;
  return vedno || (odgovor !== undefined && pogoj.ko.includes(String(odgovor))) ? vn.nadaljnje : undefined;
}

export type Zamujeno = { dni: number; korak: "opomnik" | "zadolzenec" | "osebje"; besedilo: string };

/**
 * A missed check-in is a signal itself: consecutive days before today without one.
 * 1 day → reminder to the patient, 2 → the zadolženec, 3 or more → staff (AGENTS.md §5a).
 */
export function zamujeniPregledi(dan: number, zgodovina: Pick<DanZgodovine, "dan">[]): Zamujeno | undefined {
  const opravljeni = new Set(zgodovina.map((z) => z.dan));
  let dni = 0;
  for (let d = dan - 1; d >= 0 && !opravljeni.has(d); d--) dni++;
  if (dni === 0) return undefined;
  const korak = dni === 1 ? "opomnik" : dni === 2 ? "zadolzenec" : "osebje";
  return { dni, korak, besedilo: dni === 1 ? "Včeraj brez dnevnega pregleda" : `Brez dnevnega pregleda ${dni} dni zapored` };
}
