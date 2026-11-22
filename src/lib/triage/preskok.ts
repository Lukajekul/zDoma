// T-94: what the patient left out or flagged on the daily check-in.
// A skipped question is never "all fine": it is one warning for the nurse.
// "Sporoči drugo težavo" (no free text) is one more warning asking for a call.
import type { TriageStatus } from "@/lib/types";

export const DRUGA_TEZAVA_BESEDILO = "Sporočena druga težava – prosi za klic sestre";

/** Reason text for the skipped questions, e.g. "Preskočeno vprašanje: Ali vas boli …". */
export function preskokRazlog(besedila: string[]): string | undefined {
  if (!besedila.length) return undefined;
  if (besedila.length === 1) return `Preskočeno vprašanje: ${besedila[0]}`;
  return `Preskočena vprašanja (${besedila.length}): ${besedila.join("; ")}`;
}

const VISJE: Record<TriageStatus, TriageStatus> = { zeleno: "rumeno", rumeno: "rdece", rdece: "rdece" };

/**
 * Adds the skip and "druga težava" warnings to a triaged check-in. Each one is
 * one more alert, following the same counting as the rules (1 = rumeno, 2+ = rdece).
 */
export function dodajPacientoveOznake(vhod: {
  status: TriageStatus;
  razlogi: string[];
  preskocena: string[];
  drugaTezava: boolean;
}): { status: TriageStatus; razlogi: string[] } {
  const dodatni = [preskokRazlog(vhod.preskocena), vhod.drugaTezava ? DRUGA_TEZAVA_BESEDILO : undefined].filter(
    (r): r is string => !!r,
  );
  const status = dodatni.reduce<TriageStatus>((s) => VISJE[s], vhod.status);
  return { status, razlogi: [...vhod.razlogi, ...dodatni] };
}
