import { decideStudent } from "@/app/patient/dostop/actions";
import { BigButton } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";

/**
 * Patient: the študent pomočnik a nurse assigned. Waiting → "Dovoli" / "Zavrni".
 * Approved → who it is. Only staff remove a student, so the patient is told to
 * call the nurse if they no longer want one.
 */
export async function StudentAccess({ patientId }: { patientId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_assignments")
    .select("id, status, student:profiles!student_assignments_student_id_fkey(first_name, last_name)")
    .eq("patient_id", patientId)
    .neq("status", "rejected")
    .maybeSingle();
  if (!data) return null;
  const name = data.student ? `${data.student.first_name} ${data.student.last_name}`.trim() : "Študent";

  if (data.status === "pending") {
    return (
      <section className="flex flex-col gap-3 rounded-3xl bg-card shadow-lift p-4">
        <p className="text-xl">
          Sestra predlaga, da vam pomaga študent medicine: <strong>{name}</strong>.
        </p>
        <p className="text-lg text-muted-foreground">
          Študent vas bo obiskoval, vas opomnil na tablete, vam izmeril tlak in težo ter pogledal vaje. Vse, kar vpiše,
          vidi tudi vaša sestra. Študent zdravil ne spreminja.
        </p>
        <form action={decideStudent} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={data.id} />
          <BigButton type="submit" name="decision" value="approved" variant="success">
            Dovoli
          </BigButton>
          <BigButton type="submit" name="decision" value="rejected" variant="secondary">
            Zavrni
          </BigButton>
        </form>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-3xl bg-card shadow-soft p-4">
      <h2 className="text-2xl font-bold">Vaš študent pomočnik</h2>
      <p className="text-xl font-semibold">{name} (študent)</p>
      <p className="text-lg text-muted-foreground">Če študenta ne želite več, pokličite svojo patronažno sestro.</p>
    </section>
  );
}
