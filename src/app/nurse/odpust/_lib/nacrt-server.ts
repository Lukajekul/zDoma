import "server-only";

import { banka, odobriNacrt, sestaviNacrt } from "@/lib/moduli";
import { saveApprovedPlan, savePatientFacts } from "@/lib/plans-server";
import type { Profile } from "@/lib/types";
import { preveriDejstva, type OdobritevVnos } from "./dejstva";

/** Validate the facts (without saving). Used before the rehabilitacija is created. */
export function preveriOdobritev(v: OdobritevVnos): string | undefined {
  const r = preveriDejstva(v.dejstva);
  return "error" in r ? r.error : undefined;
}

/**
 * Recompose the plan from the approved facts (never trust a client snapshot),
 * apply the removals, freeze it and save facts + plan (new version, audit log).
 */
export async function shraniNacrt(
  rehabId: string,
  v: OdobritevVnos,
  staff: Pick<Profile, "id" | "first_name" | "last_name">,
): Promise<{ error: string } | { version: number }> {
  const r = preveriDejstva(v.dejstva);
  if ("error" in r) return r;
  const sestavljen = sestaviNacrt(r.dejstva, banka);
  const odstrani = [...new Set(v.odstrani)].filter((id) => sestavljen.vnosi.some((x) => x.postavka.id === id));
  const { nacrt, napake } = odobriNacrt(sestavljen, {
    odstrani,
    pregledal: `${staff.first_name} ${staff.last_name}`.trim(),
    cas: new Date().toISOString(),
  });
  if (!nacrt) return { error: napake.join(" ") };
  try {
    await savePatientFacts(rehabId, r.dejstva);
    return { version: await saveApprovedPlan(rehabId, nacrt, staff.id) };
  } catch {
    return { error: "Načrta ni bilo mogoče shraniti. Poskusite znova." };
  }
}
