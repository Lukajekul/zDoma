"use server";

// T-98: assign students from "Razporedi študente". Uses the same request flow
// as the patient detail (T-86: the patient approves, audit_log), plus the
// limit of patients per student.
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MAX_PATIENTS_PER_STUDENT } from "@/lib/student/razporedi";
import { assignStudent } from "../[rehabId]/student-actions";

type Result = { error?: string };

async function hasRoom(studentId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("student_assignments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .neq("status", "rejected");
  return (count ?? 0) < MAX_PATIENTS_PER_STUDENT;
}

export async function dodeliStudenta(rehabId: string, studentId: string): Promise<Result> {
  await requireStaff();
  if (!(await hasRoom(studentId))) {
    return { error: `Ta študent že ima ${MAX_PATIENTS_PER_STUDENT} paciente. Izberite drugega.` };
  }
  return assignStudent(rehabId, studentId);
}

/** "Potrdi vse": every proposal in turn; returns how many went through. */
export async function dodeliVse(pairs: { rehabId: string; studentId: string }[]): Promise<{ done: number; failed: number }> {
  await requireStaff();
  let done = 0;
  for (const p of pairs.slice(0, 100)) {
    const r = await dodeliStudenta(p.rehabId, p.studentId);
    if (!r.error) done++;
  }
  return { done, failed: Math.min(pairs.length, 100) - done };
}
