import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Rehabilitacija } from "@/lib/types";

export interface NurseContact {
  name: string;
  phone: string | null;
}

/**
 * Who the student calls when something is wrong: the patient's patronažna
 * sestra, or else the staff member who assigned the student. Students can't
 * read staff profiles (RLS), so this looks the name and phone up on the server.
 */
export async function getNurseContact(
  rehab: Pick<Rehabilitacija, "assigned_nurse_id" | "patient_id">,
  studentId: string,
): Promise<NurseContact | null> {
  const admin = createAdminClient();
  let nurseId = rehab.assigned_nurse_id;
  if (!nurseId) {
    const { data } = await admin
      .from("student_assignments")
      .select("assigned_by")
      .eq("patient_id", rehab.patient_id)
      .eq("student_id", studentId)
      .eq("status", "approved")
      .maybeSingle();
    nurseId = data?.assigned_by ?? null;
  }
  if (!nurseId) return null;
  const { data: p } = await admin
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", nurseId)
    .eq("is_staff", true)
    .maybeSingle();
  return p ? { name: `${p.first_name} ${p.last_name}`.trim(), phone: p.phone } : null;
}
