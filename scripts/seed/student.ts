// Študent pomočnik demo (T-84): one medical student on an internship, approved
// by Marija Kos and waiting for Stanko Zupančič to approve. Used by the full
// seed (index.mts) and on its own by student-only.mts.
import { createAccount, ok, type Admin, type Person } from "./db";
import { addDays } from "./generate";

export const DEMO_STUDENT = { first: "Luka", last: "Kranjc", email: "luka.kranjc@zdoma.demo", internshipDays: 60 };

export async function addDemoStudent(
  admin: Admin,
  o: { davcna: string; password: string; today: string; assignedBy: string; approvedPatient: string; pendingPatient: string },
): Promise<{ id: string; person: Person; until: string }> {
  const person: Person = { davcna: o.davcna, first: DEMO_STUDENT.first, last: DEMO_STUDENT.last };
  const id = await createAccount(admin, person, { password: o.password, email: DEMO_STUDENT.email });
  const until = addDays(o.today, DEMO_STUDENT.internshipDays);
  ok(await admin.from("profiles").update({ student_until: until }).eq("id", id), "student_until");
  ok(
    await admin.from("student_assignments").insert([
      { student_id: id, patient_id: o.approvedPatient, assigned_by: o.assignedBy, status: "approved", decided_at: new Date().toISOString() },
      { student_id: id, patient_id: o.pendingPatient, assigned_by: o.assignedBy, status: "pending" },
    ]),
    "student_assignments",
  );
  return { id, person, until };
}
