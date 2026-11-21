// Triage of one check-in: template rules → status + Slovenian reasons.
import type { Stopnja } from "@/lib/templates";
import type { TriageStatus } from "@/lib/types";
import { oceniPravilo, type Kontekst } from "./pravila";

export interface Razlog {
  praviloId: string;
  vprasanjeId: string;
  stopnja: Stopnja;
  besedilo: string;
}

export interface OcenaPregleda {
  status: TriageStatus;
  /** Reasons behind the status, emergencies first. Save these in `checkins.reasons` / `alerts.reason`. */
  razlogi: Razlog[];
  /** Notes for the nurse that do not change the status, e.g. "Brez merilnika tlaka". */
  opombe: Razlog[];
  /** First emergency rule hit, if any: "Pokličite 112" or the ward phone screen. */
  nujno?: Razlog;
}

export interface OcenaVhod extends Kontekst {
  /** Question ids chosen for this patient (`rehabilitacije.questions`). Rules on other questions are skipped. Omit = all. */
  izbranaVprasanja?: string[];
}

const jeNujno = (s: Stopnja) => s === "klic112" || s === "klicOddelek";

/**
 * Status, following the UKONS triage logic (docs/checkin-questions.md §6):
 * no alert = zeleno, 1 alert = rumeno, 2 or more = rdece; any emergency = rdece.
 * Alerts are counted per question, so weight +2 kg and weight above dry weight count once.
 */
export function statusIzRazlogov(razlogi: Pick<Razlog, "stopnja" | "vprasanjeId">[]): TriageStatus {
  if (razlogi.some((r) => jeNujno(r.stopnja))) return "rdece";
  const vprasanja = new Set(razlogi.filter((r) => r.stopnja === "opozorilo").map((r) => r.vprasanjeId));
  if (vprasanja.size >= 2) return "rdece";
  if (vprasanja.size === 1) return "rumeno";
  return "zeleno";
}

export function oceniPregled(vhod: OcenaVhod): OcenaPregleda {
  const izbrana = vhod.izbranaVprasanja ? new Set(vhod.izbranaVprasanja) : undefined;
  const vsi: Razlog[] = [];
  for (const p of vhod.predloga.pravila) {
    if (izbrana && !izbrana.has(p.vprasanje)) continue;
    const besedilo = oceniPravilo(p, vhod);
    if (besedilo) vsi.push({ praviloId: p.id, vprasanjeId: p.vprasanje, stopnja: p.stopnja, besedilo });
  }
  const razlogi = vsi
    .filter((r) => r.stopnja !== "opomba")
    .sort((a, b) => Number(jeNujno(b.stopnja)) - Number(jeNujno(a.stopnja)));

  return {
    status: statusIzRazlogov(razlogi),
    razlogi,
    opombe: vsi.filter((r) => r.stopnja === "opomba"),
    nujno: razlogi.find((r) => jeNujno(r.stopnja)),
  };
}
