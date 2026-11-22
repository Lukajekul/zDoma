// T-69: the doctor's own questions and exercises at discharge. Pure, no I/O.
import type { LastnaVaja, LastnoVprasanje, Predloga } from "@/lib/templates";
import { ocistiVajo, ocistiVprasanje, preveriLastnoVajo, preveriLastnoVprasanje, zLastnimi } from "@/lib/templates/lastno";

const NAJVEC_LASTNIH = 10;

/**
 * Checks the items added for this patient and merges them into the template
 * (which may already hold the template's own items). Returns the chosen custom
 * items to store on the rehabilitacija: template-level and per-patient alike.
 */
export function lastniZaRehab(
  osnova: Predloga,
  vprasanja: LastnoVprasanje[] = [],
  vaje: LastnaVaja[] = [],
  izbranaVprasanja: string[],
  izbraneVaje: string[],
): { error: string } | { predloga: Predloga; vprasanja: LastnoVprasanje[]; vaje: LastnaVaja[] } {
  if (vprasanja.length > NAJVEC_LASTNIH || vaje.length > NAJVEC_LASTNIH) return { error: "Preveč lastnih vprašanj ali vaj." };
  for (const q of vprasanja) {
    const n = preveriLastnoVprasanje(q);
    if (n.length) return { error: `Lastno vprašanje: ${n[0]}` };
  }
  for (const v of vaje) {
    const n = preveriLastnoVajo(v);
    if (n.length) return { error: `Lastna vaja: ${n[0]}` };
  }
  const predloga = zLastnimi(osnova, vprasanja.map(ocistiVprasanje), vaje.map(ocistiVajo));
  return {
    predloga,
    vprasanja: (predloga.lastnaVprasanja ?? []).filter((q) => izbranaVprasanja.includes(q.id)),
    vaje: (predloga.lastneVaje ?? []).filter((v) => izbraneVaje.includes(v.id)),
  };
}
