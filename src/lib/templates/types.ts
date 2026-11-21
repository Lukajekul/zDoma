// Template format (AGENTS.md §5a). A template is data, not code: screens and
// the triage engine read whatever a template lists. UI text is Slovenian.

import type { TemplateId } from "@/lib/types";

/** Template ids are defined once in the shared data model (`TEMPLATE_IDS`). */
export type PredlogaId = TemplateId;

/** Source of a question, rule or value. `potrjeno: false` = ⚠️ in docs/checkin-questions.md, still to confirm (T-42). */
export interface Vir {
  opis: string;
  potrjeno: boolean;
}

/**
 * A per-patient value the bolničar fills in at discharge (T-21). Question and
 * option texts refer to it as `{kljuc}`, e.g. "Pod {ciljniTlak}".
 */
export interface VrednostPacienta {
  kljuc: string;
  oznaka: string;
  tip: "stevilo" | "tlak" | "zdravilo" | "telefon";
  enota?: string;
  privzeto?: string | number;
}

export interface Odgovor {
  id: string;
  besedilo: string;
  /** false = saving this answer does not count as done (red part of the day's ring slice), e.g. "Nimam ga". */
  steje?: boolean;
}

interface VprasanjeOsnova {
  id: string;
  besedilo: string;
  /** Always asked, never filled by "Enako kot včeraj". */
  vednoVprasaj: boolean;
  /** Pre-ticked at discharge. The bolničar can untick any question. */
  privzetoIzbrano: boolean;
  pogostost: "dnevno" | "tedensko";
  /** Asks for a wound photo with the answer (Supabase Storage). */
  fotografija?: boolean;
  /** Short note for the bolničar at discharge, e.g. "Samo po operaciji". */
  opomba?: string;
  vir: Vir;
}

/** One tap on one of the listed answers, in order (the order is also the severity order for "narascaVDneh"). */
export interface VprasanjeIzbira extends VprasanjeOsnova {
  tip: "izbira";
  odgovori: Odgovor[];
}

/** Weight as a row of buttons around the last weight, plus "Drugo" for a number field. */
export interface VprasanjeTeza extends VprasanjeOsnova {
  tip: "teza";
  /** Step between buttons in kg. */
  korak: number;
}

export type Vprasanje = VprasanjeIzbira | VprasanjeTeza;

/**
 * - opomba: shown to the nurse, does not change status ("Brez merilnika tlaka").
 * - opozorilo: a nurse should look; T-04 decides yellow or red.
 * - klic112: full-screen "Pokličite 112" before anything is saved or sent.
 * - klicOddelek: full-screen "Takoj pokličite oddelek: {telefonOddelka}".
 */
export type Stopnja = "opomba" | "opozorilo" | "klic112" | "klicOddelek";

interface PraviloOsnova {
  id: string;
  vprasanje: string;
  stopnja: Stopnja;
  /** Slovenian reason a nurse can read. May use `{razlika}` and `{dni}` (filled by T-04). */
  razlog: string;
  vir: Vir;
}

/** Today's answer is one of `odgovori`. */
export interface PraviloOdgovor extends PraviloOsnova {
  tip: "odgovor";
  odgovori: string[];
}

/** Number rose by more than `vecKot` over the last `dni` days (weight +2 kg in 3 days). */
export interface PraviloPorast extends PraviloOsnova {
  tip: "porastVDneh";
  vecKot: number;
  dni: number;
}

/** Number is more than `vecKot` above the patient's own value, e.g. above dry weight. */
export interface PraviloNadVrednostjo extends PraviloOsnova {
  tip: "nadVrednostjo";
  vrednost: string;
  vecKot: number;
}

/** One of `odgovori` on `dni` days in a row (cough for 2+ days). */
export interface PraviloZaporedno extends PraviloOsnova {
  tip: "zaporedniDnevi";
  odgovori: string[];
  dni: number;
}

/** Answer moved further down the option list on each of `dni` days in a row (pain rising). */
export interface PraviloNarasca extends PraviloOsnova {
  tip: "narascaVDneh";
  dni: number;
}

export type Pravilo =
  | PraviloOdgovor
  | PraviloPorast
  | PraviloNadVrednostjo
  | PraviloZaporedno
  | PraviloNarasca;

export type CasDneva = "zjutraj" | "opoldne" | "zvecer" | "pred spanjem";

/** Recommended medicine, staff-only suggestion (T-21). Content from docs/medicines.md (T-37). */
export interface Zdravilo {
  ime: string;
  ucinkovina: string;
  /** 2–4 usual dose options, e.g. ["20 mg", "40 mg", "80 mg"]. */
  odmerki: string[];
  casi: CasDneva[];
  /** Plain-language "what it's for", e.g. "odvaja odvečno vodo". */
  zaKaj: string;
  vir: Vir;
}

/** Rehab exercise. Content from docs/rehab-content.md (T-17). */
export interface Vaja {
  id: string;
  naslov: string;
  koraki: string[];
  ponovitve: string;
  slika?: string;
  video?: string;
  vir: Vir;
}

export interface Predloga {
  id: PredlogaId;
  ime: string;
  opis: string;
  privzetoTrajanjeDni: number;
  trajanjeVir: Vir;
  vrednostiPacienta: VrednostPacienta[];
  vprasanja: Vprasanje[];
  pravila: Pravilo[];
  zdravila: Zdravilo[];
  vaje: Vaja[];
}

/** At most this many daily questions (AGENTS.md §5a). */
export const NAJVEC_DNEVNIH_VPRASANJ = 6;
