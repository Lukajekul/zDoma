import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Names of the people who made log entries for the patient: family ("Ana (hčerka)")
 * and staff on a home visit ("Mojca (patronažna sestra)", T-57).
 */
export async function getMarkerNames(patientId: string, logs: { entered_by: string }[]) {
  const ids = [...new Set(logs.map((l) => l.entered_by).filter((id) => id !== patientId))];
  if (!ids.length) return {} as Record<string, string>;

  const supabase = await createClient();
  const [people, access] = await Promise.all([
    supabase.from("profiles").select("id, first_name, is_staff").in("id", ids),
    supabase.from("family_access").select("requester_id, relation").eq("patient_id", patientId).in("requester_id", ids),
  ]);
  const names: Record<string, string> = {};
  for (const p of people.data ?? []) {
    const relation = access.data?.find((a) => a.requester_id === p.id)?.relation;
    names[p.id] = p.is_staff ? `${p.first_name} (patronažna sestra)` : relation ? `${p.first_name} (${relation})` : p.first_name;
  }

  // Patients and family can't read staff profiles (RLS), but they should see which
  // nurse marked something with the patient: look those names up on the server.
  const missing = ids.filter((id) => !names[id]);
  if (missing.length) {
    const { data: staff } = await createAdminClient().from("profiles").select("id, first_name").in("id", missing).eq("is_staff", true);
    for (const p of staff ?? []) names[p.id] = `${p.first_name} (patronažna sestra)`;
  }
  return names;
}
