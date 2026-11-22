import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getStaffKind } from "@/lib/staff";
import type { RazporediPatient, RazporediStudent } from "@/lib/student/razporedi";
import { getCoveredNurseIds } from "../../_patronaza/visits";

const dayMs = 86_400_000;
const fullName = (p: { first_name: string; last_name: string }) => `${p.first_name} ${p.last_name}`.trim();

/**
 * Patients and students for "Razporedi študente" (T-98). A patronažna sestra
 * sees her own patients and those she substitutes for; hospital staff see all.
 */
export async function getRazporedi(staffId: string, today: string) {
  const supabase = await createClient();
  const { kind } = await getStaffKind(staffId);
  const nurseIds = kind === "patronaza" ? [staffId, ...(await getCoveredNurseIds(staffId, today))] : null;

  let query = supabase
    .from("rehabilitacije")
    .select(`
      id, patient_id, current_status, start_date, end_date,
      patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name, obcina, naselje),
      alerts(source)
    `)
    .eq("status", "aktivna")
    .lte("start_date", today)
    .gte("end_date", today)
    .eq("alerts.state", "odprto");
  if (nurseIds) query = query.in("assigned_nurse_id", nurseIds);

  const [rehabs, assignments, students, carers] = await Promise.all([
    query,
    supabase
      .from("student_assignments")
      .select("patient_id, student_id, status, student:profiles!student_assignments_student_id_fkey(first_name, last_name)")
      .neq("status", "rejected"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, student_until, student_obcine")
      .eq("is_staff", false)
      .gte("student_until", today)
      .order("last_name"),
    supabase.from("family_access").select("patient_id").eq("status", "approved"),
  ]);
  if (rehabs.error || assignments.error || students.error) return null;

  const withCarer = new Set((carers.data ?? []).map((c) => c.patient_id));
  const byPatient = new Map(assignments.data.map((a) => [a.patient_id, a]));
  const load = new Map<string, number>();
  for (const a of assignments.data) load.set(a.student_id, (load.get(a.student_id) ?? 0) + 1);

  const all: (RazporediPatient & { patientId: string })[] = rehabs.data
    .filter((r) => r.patient)
    .map((r) => {
      const a = byPatient.get(r.patient_id);
      return {
        rehabId: r.id,
        patientId: r.patient_id,
        name: fullName(r.patient!),
        obcina: r.patient!.obcina,
        naselje: r.patient!.naselje,
        status: r.current_status,
        missedCheckin: r.alerts.some((x) => x.source === "brez_pregleda"),
        medicineUncollected: r.alerts.some((x) => x.source === "zdravila"),
        hasCarer: withCarer.has(r.patient_id),
        daysSinceDischarge: (Date.parse(today) - Date.parse(r.start_date)) / dayMs,
        endDate: r.end_date,
        student: a?.student ? { id: a.student_id, name: fullName(a.student), approved: a.status === "approved" } : null,
      };
    });

  // A student helps a person, not one rehabilitacija: one row per patient,
  // the most urgent rehabilitacija first, needs from all of them together.
  const rank = { rdece: 0, rumeno: 1, zeleno: 2 } as const;
  const perPatient = new Map<string, (typeof all)[number]>();
  for (const p of [...all].sort((a, b) => rank[a.status] - rank[b.status])) {
    const seen = perPatient.get(p.patientId);
    if (!seen) { perPatient.set(p.patientId, p); continue; }
    seen.missedCheckin ||= p.missedCheckin;
    seen.medicineUncollected ||= p.medicineUncollected;
    seen.daysSinceDischarge = Math.min(seen.daysSinceDischarge, p.daysSinceDischarge);
    if (p.endDate > seen.endDate) seen.endDate = p.endDate;
  }
  const patients = [...perPatient.values()];

  const studentList: RazporediStudent[] = students.data.map((s) => ({
    id: s.id,
    name: fullName(s),
    until: s.student_until!,
    obcine: s.student_obcine ?? [],
    load: load.get(s.id) ?? 0,
  }));

  return { patients, students: studentList };
}
