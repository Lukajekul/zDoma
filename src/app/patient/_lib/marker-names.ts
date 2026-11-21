import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Names of family members who made log entries, e.g. { <id>: "Ana (hčerka)" }. */
export async function getMarkerNames(patientId: string, logs: { entered_by: string }[]) {
  const ids = [...new Set(logs.map((l) => l.entered_by).filter((id) => id !== patientId))];
  if (!ids.length) return {} as Record<string, string>;

  const supabase = await createClient();
  const [people, access] = await Promise.all([
    supabase.from("profiles").select("id, first_name").in("id", ids),
    supabase.from("family_access").select("requester_id, relation").eq("patient_id", patientId).in("requester_id", ids),
  ]);
  const names: Record<string, string> = {};
  for (const p of people.data ?? []) {
    const relation = access.data?.find((a) => a.requester_id === p.id)?.relation;
    names[p.id] = relation ? `${p.first_name} (${relation})` : p.first_name;
  }
  return names;
}
