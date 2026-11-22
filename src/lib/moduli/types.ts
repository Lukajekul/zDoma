// Modular questionnaire (T-76): a shared, clinician-approved item bank grouped
// into small modules. A patient's check-in is composed from the modules their
// discharge facts switch on. Nothing is generated: every item is written once
// by hand and carries its source. Design: docs/modular-questionnaire.md.

import type { Pravilo, Vir, VprasanjeIzbira, VprasanjeTeza } from "@/lib/templates";
import type { IsoDate } from "@/lib/types";

/**
 * 0 red flags (always first, never trimmed, never "Enako kot včeraj"),
 * 1 core trend (daily while active, removed only by a clinician),
 * 2 phase items (rotated when over budget),
 * 3 follow-ups (only when triggered, outside the budget),
 * 4 periodic outcomes (weekly; moved to the next day when today is full).
 */
export type Raven = 0 | 1 | 2 | 3 | 4;

/** `zdoma` = our own wording of a guideline, not validated; `validiran` = an official instrument used unchanged. */
export type StatusPostavke = "zdoma" | "validiran";

interface PostavkaDodatno {
  /** Versioned id, e.g. "sp.teza.v1". Answers are stored against it so trends stay comparable. */
  id: string;
  /** Dedupe key: "dusenje" is asked once even when two modules list it. */
  koncept: string;
  raven: Raven;
  status: StatusPostavke;
  /** Clinician sign-off. Missing = not reviewed yet. */
  pregledal?: string;
  /** For `validiran`: false until the licence is in place; the item is then never asked. */
  licencaUrejena?: boolean;
  /**
   * One follow-up, one level deep (like FHIR `enableWhen`): asked right after
   * this item when the answer is one of `ko`. The follow-up must be raven 3.
   */
  nadaljnje?: { ko: string[]; postavka: string };
  /**
   * Answered from the pill list (T-84): when the medicines of the item's module
   * (matched by ATC) had doses `dniNazaj` days ago and every one is logged
   * "vzeto", the answer is `vzeto` and the item isn't asked.
   */
  izZdravilModula?: { dniNazaj: number; vzeto: string };
}

type BrezPredloge<T> = Omit<T, "id" | "pogostost" | "privzetoIzbrano">;

export type Postavka =
  | (BrezPredloge<VprasanjeIzbira> & PostavkaDodatno)
  | (BrezPredloge<VprasanjeTeza> & PostavkaDodatno);

export type Pogostost = "dnevno" | "vsak2dan" | "tedensko";

export interface PostavkaModula {
  postavka: string;
  pogostost: Pogostost;
  /** Recovery days (0 = discharge day), both ends included. Omit = whole rehabilitacija. */
  aktivniDnevi?: [number, number];
  /** Missing it could delay spotting a complication the discharge team named: never trimmed. */
  bistveno?: boolean;
}

/** An answer to `vprasanje` that is still there after the expected recovery day (fever on day 9 after pneumonia). */
export interface PraviloPoDnevu {
  id: string;
  tip: "poDnevu";
  vprasanje: string;
  odgovori: string[];
  /** Fires on recovery days after this one. */
  poDnevu: number;
  stopnja: Pravilo["stopnja"];
  /** May use `{dan}`. */
  razlog: string;
  vir: Vir;
}

export type PraviloModula = Pravilo | PraviloPoDnevu;

export type VrstaModula = "jedro" | "stanje" | "poseg" | "zdravilo";

export interface Modul {
  /** "stanje:srcno-popuscanje", "zdravilo:antikoagulant" … */
  id: string;
  vrsta: VrstaModula;
  ime: string;
  /** Any match switches the module on. `vedno` is for the core module. */
  aktivacija: {
    vedno?: true;
    /** ICD-10 prefixes, e.g. "I50", "J18". */
    mkb10?: string[];
    /** Procedure keys entered at discharge, e.g. "endoproteza-kolena". */
    posegi?: string[];
    /** ATC prefixes, e.g. "B01A" (antithrombotics), "C03" (diuretics). */
    atc?: string[];
  };
  postavke: PostavkaModula[];
  pravila: PraviloModula[];
  /** Lower = more important when filling the daily budget (clinician-set). */
  prednost: number;
}

export interface Banka {
  postavke: Postavka[];
  moduli: Modul[];
}

/** What staff enter at enrolment. */
export interface DejstvaPacienta {
  odpust: IsoDate;
  mkb10: string[];
  posegi: string[];
  /** Medicines by ATC code; `konec` = last day of a finite course (antibiotics). */
  zdravila: { atc: string; ime?: string; konec?: IsoDate }[];
}
