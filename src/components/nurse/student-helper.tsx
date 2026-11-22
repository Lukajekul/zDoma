import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";
import { StudentHelperForm } from "./student-helper-form";

/**
 * Študent pomočnik on the patient detail: who is assigned (waiting for the
 * patient or approved), or a list of students on an active internship to assign.
 * Optional: most patients never get one.
 */
export async function StudentHelper({ rehabId, patientId, active }: { rehabId: string; patientId: string; active: boolean }) {
  const supabase = await createClient();
  const today = todayLjubljana();
  const [{ data: current }, { data: students }] = await Promise.all([
    supabase
      .from("student_assignments")
      .select("id, status, student:profiles!student_assignments_student_id_fkey(first_name, last_name, student_until)")
      .eq("patient_id", patientId)
      .neq("status", "rejected")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, student_until")
      .eq("is_staff", false)
      .gte("student_until", today)
      .order("last_name"),
  ]);
  const { data: rejected } = current
    ? { data: null }
    : await supabase
        .from("student_assignments")
        .select("id")
        .eq("patient_id", patientId)
        .eq("status", "rejected")
        .order("decided_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const assigned = current?.student
    ? {
        id: current.id,
        name: `${current.student.first_name} ${current.student.last_name}`.trim(),
        approved: current.status === "approved",
        until: current.student.student_until,
      }
    : null;

  return (
    <section aria-labelledby="student-pomocnik" className="space-y-3 rounded-3xl bg-card shadow-soft p-4">
      <h2 className="text-xl font-bold" id="student-pomocnik">Študent pomočnik</h2>
      <p className="text-muted-foreground">
        Ni obvezno. Študent medicine na praksi pomaga pri preprostih opravilih: opomni na tablete, izmeri tlak in težo,
        pogleda vaje. Pacient mora pomoč potrditi v aplikaciji.
      </p>
      <StudentHelperForm
        rehabId={rehabId}
        active={active}
        assigned={assigned}
        lastRejected={!!rejected}
        students={(students ?? []).map((s) => ({ id: s.id, name: `${s.first_name} ${s.last_name}`.trim(), until: s.student_until ?? "" }))}
      />
    </section>
  );
}
