import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Names of the people who made log entries for the patient: family ("Ana (hčerka)")
 * staff on a home visit ("Mojca (patronažna sestra)", T-57) and the študent
 * pomočnik ("Luka (študent)"), so it is always clear a student did the work.
 */
export async function getMarkerNames(patientId: string, logs: { entered_by: string }[]) {
  const ids = [...new Set(logs.map((l) => l.entered_by).filter((id) => id !== patientId))];
  if (!ids.length) return {} as Record<string, string>;

  const supabase = await createClient();
  const [people, access] = await Promise.all([
    supabase.from("profiles").select("id, first_name, is_staff, student_until").in("id", ids),
    supabase.from("family_access").select("requester_id, relation").eq("patient_id", patientId).in("requester_id", ids),
  ]);
  const names: Record<string, string> = {};
  for (const p of people.data ?? []) {
    const relation = access.data?.find((a) => a.requester_id === p.id)?.relation;
    names[p.id] = p.is_staff
      ? `${p.first_name} (patronažna sestra)`
      : p.student_until
        ? `${p.first_name} (študent)`
        : relation
          ? `${p.first_name} (${relation})`
          : p.first_name;
  }

  // Patients and family can't read staff or student profiles (RLS), but they should
  // see which nurse or student marked something: look those names up on the server.
  const missing = ids.filter((id) => !names[id]);
  if (missing.length) {
    const { data: helpers } = await createAdminClient()
      .from("profiles")
      .select("id, first_name, is_staff, student_until")
      .in("id", missing)
      .or("is_staff.eq.true,student_until.not.is.null");
    for (const p of helpers ?? []) names[p.id] = `${p.first_name} (${p.is_staff ? "patronažna sestra" : "študent"})`;
  }
  return names;
}
