// Discharge facts for the modular questionnaire (T-79): pre-fill from what the
// wizard already knows, so staff only confirm. Pure, no I/O.
import { banka, type DejstvaPacienta, type Nacrt, type VnosNacrta } from "@/lib/moduli";
import type { IsoDate } from "@/lib/types";

/** What staff approve: the facts and the item ids they removed. The server recomposes the plan from these. */
export type OdobritevVnos = { dejstva: DejstvaPacienta; odstrani: string[] };

/**
 * WHO ATC codes (whocc.no) for the active substances in the templates and a few
 * common discharge medicines. Lookup only; the modules decide what a code means.
 */
const ATC: Record<string, string> = {
  "acetilsalicilna kislina": "B01AC06",
  apiksaban: "B01AF02",
  aprepitant: "A04AD12",
  atorvastatin: "C10AA05",
  "beklometazondipropionat + formoterol + glikopironij": "R03AL09",
  bisoprolol: "C07AB07",
  dapagliflozin: "A10BK01",
  deksametazon: "H02AB02",
  furosemid: "C03CA01",
  klopidogrel: "B01AC04",
  "natrijev enoksaparin": "B01AB05",
  enoksaparin: "B01AB05",
  ondansetron: "A04AA01",
  paracetamol: "N02BE01",
  prednizolon: "H02AB06",
  ramipril: "C09AA05",
  rivaroksaban: "B01AF01",
  "sakubitril + valsartan": "C09DX04",
  salbutamol: "R03AC02",
  spironolakton: "C03DA01",
  tikagrelor: "B01AC24",
  "umeklidinij + vilanterol": "R03AL03",
  varfarin: "B01AA03",
  dabigatran: "B01AE07",
  edoksaban: "B01AF03",
  torasemid: "C03CA04",
  hidroklorotiazid: "C03AA03",
  amoksicilin: "J01CA04",
  "amoksicilin + klavulanska kislina": "J01CR02",
  azitromicin: "J01FA10",
  klaritromicin: "J01FA09",
  cefuroksim: "J01DC02",
  doksiciklin: "J01AA02",
  levofloksacin: "J01MA12",
};

const norm = (s: string) => s.trim().toLocaleLowerCase("sl-SI").replace(/\s+/g, " ");

/** ATC code for an active substance (or a name that contains one), if known. */
export function atcZaUcinkovino(...imena: (string | null | undefined)[]): string | undefined {
  for (const ime of imena) {
    if (!ime) continue;
    const n = norm(ime);
    if (ATC[n]) return ATC[n];
  }
  // Longest key first, so "amoksicilin + klavulanska kislina" wins over "amoksicilin".
  const kljuci = Object.keys(ATC).sort((a, b) => b.length - a.length);
  for (const ime of imena) {
    if (!ime) continue;
    const n = norm(ime);
    const k = kljuci.find((x) => n.includes(x));
    if (k) return ATC[k];
  }
  return undefined;
}

/** Typical ICD-10 category per template, pre-ticked at discharge. Staff can change it. */
const MKB10_PREDLOGE: Record<string, string[]> = {
  "srcno-popuscanje": ["I50"],
  "srce-po-infarktu": ["I21"],
  kopb: ["J44"],
  "mozganska-kap": ["I63"],
};

/** Diagnosis chips: one per condition module in the bank (its most general ICD-10 category). */
export const DIAGNOZE = banka.moduli
  .filter((m) => m.vrsta === "stanje" && m.aktivacija.mkb10?.length)
  .map((m) => ({ koda: m.aktivacija.mkb10!.at(-1)!, ime: m.ime }));

/** Procedure chips: one per procedure module in the bank. */
export const POSEGI = banka.moduli
  .filter((m) => m.vrsta === "poseg" && m.aktivacija.posegi?.length)
  .map((m) => ({ kljuc: m.aktivacija.posegi![0], ime: m.ime }));

export const IME_MODULA = new Map(banka.moduli.map((m) => [m.id, m.ime]));

export const jeAntibiotik = (atc: string) => atc.toUpperCase().startsWith("J01");

/** Facts pre-filled from the template and the chosen medicines. Medicines without a known ATC go to `brezAtc`. */
export function zacetnaDejstva(
  templateId: string,
  zdravila: { name: string; activeSubstance: string | null }[],
  odpust: IsoDate,
): { dejstva: DejstvaPacienta; brezAtc: string[] } {
  const brezAtc: string[] = [];
  const z: DejstvaPacienta["zdravila"] = [];
  for (const m of zdravila) {
    const atc = atcZaUcinkovino(m.activeSubstance, m.name);
    if (!atc) brezAtc.push(m.name);
    else if (!z.some((x) => x.atc === atc)) z.push({ atc, ime: m.name });
  }
  return { dejstva: { odpust, mkb10: MKB10_PREDLOGE[templateId] ?? [], posegi: [], zdravila: z }, brezAtc };
}

const MKB10_RE = /^[A-Z]\d{2}(\.\d{1,4})?$/;
const ATC_RE = /^[A-Z](\d{2}([A-Z]([A-Z](\d{2})?)?)?)?$/;
const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;

export const normKoda = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");
export const veljavnaMkb10 = (s: string) => MKB10_RE.test(normKoda(s));
export const veljavenAtc = (s: string) => ATC_RE.test(normKoda(s));

/** Cleans up the facts and returns a Slovenian error a nurse can act on, or the clean facts. */
export function preveriDejstva(d: DejstvaPacienta): { error: string } | { dejstva: DejstvaPacienta } {
  if (!DATUM_RE.test(d.odpust)) return { error: "Manjka datum odpusta." };
  const mkb10 = [...new Set(d.mkb10.map(normKoda))];
  const slaba = mkb10.find((k) => !MKB10_RE.test(k));
  if (slaba) return { error: `Koda MKB-10 »${slaba}« ni pravilna (npr. I50 ali J18.9).` };
  const posegi = [...new Set(d.posegi.filter((p) => POSEGI.some((x) => x.kljuc === p)))];
  const zdravila: DejstvaPacienta["zdravila"] = [];
  for (const z of d.zdravila) {
    const atc = normKoda(z.atc);
    if (!ATC_RE.test(atc)) return { error: `Koda ATC »${z.atc}« ni pravilna (npr. C03CA01).` };
    if (z.konec && (!DATUM_RE.test(z.konec) || z.konec < d.odpust)) {
      return { error: `${z.ime ?? atc}: zadnji dan jemanja mora biti po odpustu.` };
    }
    if (zdravila.some((x) => x.atc === atc)) continue;
    zdravila.push({ atc, ...(z.ime ? { ime: z.ime } : {}), ...(z.konec ? { konec: z.konec } : {}) });
  }
  return { dejstva: { odpust: d.odpust, mkb10, posegi, zdravila } };
}

/** Why an item is not clinically confirmed yet (T-77), or an empty list. */
export function nepotrjeno(vn: VnosNacrta, nacrt: Nacrt): string[] {
  const razlogi: string[] = [];
  if (!vn.postavka.vir.potrjeno) razlogi.push("besedilo vprašanja");
  const ids = new Set([vn.postavka.id, vn.nadaljnje?.id]);
  if (vn.nadaljnje && !vn.nadaljnje.vir.potrjeno) razlogi.push("dodatno vprašanje");
  if (nacrt.pravila.some((p) => ids.has(p.pravilo.vprasanje) && !p.pravilo.vir.potrjeno)) razlogi.push("prag za opozorilo");
  return razlogi;
}
