// Template format (AGENTS.md §5a). A template is data, not code: screens and
// the triage engine read whatever a template lists. UI text is Slovenian.

import type { TemplateId, TimeOfDay } from "@/lib/types";

/** Template ids are defined once in the shared data model (`TEMPLATE_IDS`). */
export type PredlogaId = TemplateId;

/** Source of a question, rule or value. `potrjeno: false` = ⚠️ in docs/checkin-questions.md, still to confirm (T-42). */
export interface Vir {
  opis: string;
  potrjeno: boolean;
  /** Link to the guideline, SmPC or leaflet, when the source doc gives one. */
  url?: string;
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
  /**
   * For `tip: "zdravilo"`: template medicines (by `ime`) that fill this value.
   * The name comes from the rehabilitacija's own medicines (matched by name or
   * active substance), so staff never type it; `privzeto` is the fallback text.
   */
  zdravila?: string[];
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
  /**
   * Answered from the pill list instead of asking: when every scheduled dose of
   * the medicines filling `vrednost`, `dniNazaj` days ago, is logged as taken,
   * the answer is `vzeto` and the question is skipped. Otherwise it is asked.
   */
  izZdravil?: { vrednost: string; dniNazaj: number; vzeto: string };
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

/** On `dni` days in a row (today included), each answer is further down the option list than the day before (pain rising). */
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

/** Same values as `medications.times` (`TimeOfDay` in the data model). */
export type CasDneva = TimeOfDay;

/**
 * Recommended medicine: a suggestion for staff only (T-21); the patient never
 * sees dose options. Content from docs/medicines.md (T-37).
 */
export interface Zdravilo {
  /** Brand name as in docs/medicines.md, e.g. "Lasix". */
  ime: string;
  ucinkovina: string;
  /** 1–4 usual dose options per intake, e.g. ["40 mg", "80 mg"]. A fixed dose has one. */
  odmerki: string[];
  /** Route, e.g. "skozi usta", "pod kožo". */
  nacin: string;
  /** Suggested times of day for the pill schedule. Empty only when `poPotrebi`. */
  casi: CasDneva[];
  /** Schedule as written in the source, e.g. "Zjutraj, na tešče". */
  urnik: string;
  /** Taken as needed, not on a schedule (the prescription sets the limit). */
  poPotrebi?: boolean;
  /** Plain-language "what it's for", e.g. "Odvaja odvečno vodo in zmanjša otekanje." */
  zaKaj: string;
  /** "Kdaj pride v poštev": when it applies and its limits. Staff only. */
  kdaj: string;
  vir: Vir;
}

/** Rehab exercise. Content from docs/rehab-content.md (T-17). */
export interface Vaja {
  id: string;
  naslov: string;
  koraki: string[];
  ponovitve: string;
  /** Public path, e.g. "/vaje/hoja.svg" (files in public/vaje/). */
  slika?: string;
  /** Alt text for the picture. */
  slikaOpis?: string;
  video?: string;
  /** Pre-ticked at discharge (default true). Staff can change it in the template editor (T-24). */
  privzetoIzbrano?: boolean;
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
  /** Staff note for the medicine step: scope and what to confirm clinically. */
  zdravilaOpomba?: string;
  vaje: Vaja[];
  /** Staff note for the exercise step. */
  vajeOpomba?: string;
}

/** At most this many daily questions (AGENTS.md §5a). */
export const NAJVEC_DNEVNIH_VPRASANJ = 6;
