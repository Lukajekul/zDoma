// T-73: severity of a zadolženec's observation. Only the chosen chips (through
// the template rules they point to) and the zadolženec's own "Ali vas to skrbi?"
// decide it. Free text never does: it can't be read reliably without a person.
import type { Predloga } from "@/lib/templates";
import type { TriageStatus } from "@/lib/types";
import { statusIzRazlogov, type Razlog } from "./ocena";

export interface OcenaOpazanja {
  status: TriageStatus;
  /** One alert reason per line for staff, e.g. "Svojec opazil: Bolj otekli gležnji ali noge". */
  razlogi: string[];
  /** First emergency chip: "Pokličite 112" or the ward phone, before anything is saved. */
  nujno?: Razlog;
}

/** Rule-backed chips among `izbrani`, as triage reasons (unknown ids and plain notes are skipped). */
function razlogiCipov(predloga: Predloga, izbrani: string[]): Razlog[] {
  return predloga.opazanja.flatMap((o) => {
    if (!izbrani.includes(o.id) || !o.pravilo) return [];
    const p = predloga.pravila.find((r) => r.id === o.pravilo);
    return p ? [{ praviloId: p.id, vprasanjeId: p.vprasanje, stopnja: p.stopnja, besedilo: p.razlog }] : [];
  });
}

/** Ask "Ali vas to skrbi?" only when no chosen chip already raises an alert by itself. */
export function vprasajSkrb(predloga: Predloga, izbrani: string[]): boolean {
  return !razlogiCipov(predloga, izbrani).some((r) => r.stopnja !== "opomba");
}

/**
 * @param skrbi the zadolženec answered "Da, prosim, naj sestra pogleda"
 * @param kdo name and relation for the reason text, e.g. "Ana (hčerka)"
 */
export function oceniOpazanje(predloga: Predloga, izbrani: string[], skrbi: boolean, kdo: string): OcenaOpazanja {
  const razlogi = razlogiCipov(predloga, izbrani).filter((r) => r.stopnja !== "opomba");
  const nujno = razlogi.find((r) => r.stopnja === "klic112" || r.stopnja === "klicOddelek");
  let status = statusIzRazlogov(razlogi);
  const besedila = razlogi
    .sort((a, b) => (a === nujno ? -1 : b === nujno ? 1 : 0))
    .map((r) => `Svojec opazil: ${r.besedilo}`);
  if (status === "zeleno" && skrbi) {
    status = "rumeno";
    besedila.push(`Svojec prosi za pregled: ${kdo}`);
  }
  return { status, razlogi: besedila, nujno };
}
