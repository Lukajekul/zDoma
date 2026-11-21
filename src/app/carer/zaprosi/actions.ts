"use server";

import { requireProfile } from "@/lib/auth";
import { isValidDavcna, normalizeDavcna } from "@/lib/davcna";
import { isRelation } from "@/lib/family-access";
import { createClient } from "@/lib/supabase/server";

export type RequestState = { sent?: boolean; error?: string; davcna?: string };

/**
 * "Zaprosi za dostop". Always answers "Prošnja poslana", whether the number
 * belongs to a zDoma patient or not, so nobody can find out who uses zDoma.
 */
export async function requestAccess(_prev: RequestState, formData: FormData): Promise<RequestState> {
  await requireProfile();
  const davcna = normalizeDavcna(String(formData.get("davcna") ?? ""));
  const relation = String(formData.get("relation") ?? "");

  if (!isValidDavcna(davcna)) {
    return { error: "Davčna številka ni pravilna. Preverite, da ste vpisali vseh 8 številk.", davcna };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_family_access", {
    p_davcna: davcna,
    p_relation: isRelation(relation) ? relation : undefined,
  });
  if (error) {
    return { error: "Prošnje ni bilo mogoče poslati. Poskusite znova čez nekaj minut.", davcna };
  }
  return { sent: true };
}
