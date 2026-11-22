"use server";

// Študent pomočnik: staff assign one student to a patient (the patient then
// approves in the app) or remove them. Both are written to audit_log.
import { refresh } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isActiveStudent, todayLjubljana } from "@/lib/types";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
type Result = { error?: string };
const TRY_AGAIN = "Ni uspelo. Preverite povezavo in poskusite znova.";

async function patientOf(rehabId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("rehabilitacije").select("patient_id").eq("id", rehabId).maybeSingle();
  return data?.patient_id ?? null;
}

export async function assignStudent(rehabId: string, studentId: string): Promise<Result> {
  const staff = await requireStaff();
  if (!uuid.test(rehabId) || !uuid.test(studentId)) return { error: "Izberite študenta s seznama." };
  const patientId = await patientOf(rehabId);
  if (!patientId) return { error: "Pacient ni najden." };

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("profiles")
    .select("id, is_staff, student_until")
    .eq("id", studentId)
    .maybeSingle();
  if (!student || !isActiveStudent(student, todayLjubljana())) {
    return { error: "Ta študent nima več aktivne prakse. Izberite drugega." };
  }

  const { data, error } = await supabase
    .from("student_assignments")
    .insert({ student_id: studentId, patient_id: patientId, assigned_by: staff.id })
    .select("id")
    .single();
  if (error?.code === "23505") return { error: "Ta pacient že ima študenta. Najprej ga odstranite." };
  if (error || !data) return { error: TRY_AGAIN };

  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: "student_dodeljen",
    entity: "student_assignments",
    entity_id: data.id,
    details: { rehab_id: rehabId, patient_id: patientId, student_id: studentId },
  });
  refresh();
  return {};
}

export async function removeStudent(rehabId: string, assignmentId: string): Promise<Result> {
  const staff = await requireStaff();
  if (!uuid.test(rehabId) || !uuid.test(assignmentId)) return { error: TRY_AGAIN };
  const patientId = await patientOf(rehabId);
  if (!patientId) return { error: "Pacient ni najden." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("patient_id", patientId)
    .select("student_id")
    .maybeSingle();
  if (error) return { error: TRY_AGAIN };
  if (data) {
    await supabase.from("audit_log").insert({
      actor_id: staff.id,
      action: "student_odstranjen",
      entity: "student_assignments",
      entity_id: assignmentId,
      details: { rehab_id: rehabId, patient_id: patientId, student_id: data.student_id },
    });
  }
  refresh();
  return {};
}
