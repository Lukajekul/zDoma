// Medicine changes at discharge (T-35): grouped by medications.change. Pure.
import type { Medication } from "@/lib/types";

export function groupChanges(meds: Medication[]) {
  const by = (c: Medication["change"]) => meds.filter((m) => m.change === c);
  const novo = by("novo");
  const spremenjeno = by("spremenjeno");
  const ukinjeno = by("ukinjeno");
  return { novo, spremenjeno, ukinjeno, enako: by("nespremenjeno"), any: novo.length + spremenjeno.length + ukinjeno.length > 0 };
}

/** Cookie set by "Razumem": the patient has seen this rehabilitacija's changes on this phone. */
export const seenCookie = (rehabId: string) => `zdoma_spremembe_${rehabId}`;
