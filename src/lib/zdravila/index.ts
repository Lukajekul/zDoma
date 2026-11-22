// Medicine list for "Dodaj zdravilo" (T-74). A static snapshot of EMA's public
// Article 57 database (medicines authorised in Slovenia or EU-wide), built by
// scripts/ema-zdravila.py. Names and active substances only: usual doses come
// from the templates, never from this list. Pure, no I/O.
import type { Zdravilo } from "@/lib/templates";
import ema from "./ema.json";

export type RegistrskoZdravilo = {
  ime: string;
  /** Slovenian for template substances, otherwise the English INN from EMA. */
  ucinkovina: string;
  /** The active substance is one a template lists (same text as `Zdravilo.ucinkovina`). */
  predloga?: boolean;
};

export const REGISTER = ema as RegistrskoZdravilo[];
export const REGISTER_VIR = "Seznam zdravil: Evropska agencija za zdravila (EMA), stanje 11/2026";

export type Zadetki = {
  /** Template medicines with their usual doses. */
  priporocena: Zdravilo[];
  /** Other brands of a template medicine: they get that template medicine's dose buttons. */
  isteUcinkovine: { ime: string; zdravilo: Zdravilo }[];
  /** Any other medicine in the list: dose and times entered by hand. */
  ostala: RegistrskoZdravilo[];
  /** Typed text to add as a new medicine, null when it matches an existing name. */
  novo: string | null;
};

const LIMIT = 5;
/** Lower case without diacritics, so "furosemid" finds "Furosemide". */
const key = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function isciZdravila(query: string, catalogue: Zdravilo[], taken: string[]): Zadetki {
  const q = key(query);
  if (!q) return { priporocena: [], isteUcinkovine: [], ostala: [], novo: null };
  const used = new Set(taken.map(key));
  const known = new Set(catalogue.map((z) => key(z.ime)));
  const bySubstance = new Map(catalogue.map((z) => [z.ucinkovina, z]));
  const hit = (...s: string[]) => s.some((x) => key(x).includes(q));

  const priporocena = catalogue.filter((z) => !used.has(key(z.ime)) && hit(z.ime, z.ucinkovina)).slice(0, LIMIT);
  const fresh = REGISTER.filter((m) => !used.has(key(m.ime)) && !known.has(key(m.ime)));
  const isteUcinkovine = fresh
    .filter((m) => m.predloga && bySubstance.has(m.ucinkovina) && hit(m.ime, m.ucinkovina))
    .slice(0, LIMIT)
    .map((m) => ({ ime: m.ime, zdravilo: bySubstance.get(m.ucinkovina)! }));
  const ostala = fresh.filter((m) => !(m.predloga && bySubstance.has(m.ucinkovina)) && hit(m.ime, m.ucinkovina)).slice(0, LIMIT);
  const exact = used.has(q) || known.has(q) || REGISTER.some((m) => key(m.ime) === q);
  return { priporocena, isteUcinkovine, ostala, novo: exact ? null : query.trim() };
}
