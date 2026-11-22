// T-98 "Razporedi študente": which patients need a študent pomočnik most and
// which students fit them. Pure functions, no I/O, no condition-specific code.
//
// A student does what family would do (pill reminders, weight, blood pressure,
// watching exercises), never nursing work. So need here means need for help
// with following the plan, not clinical severity: a red patient goes to the
// nurse first and is never proposed automatically.
import type { TriageStatus } from "@/lib/types";

/** Most patients one student follows at a time. */
export const MAX_PATIENTS_PER_STUDENT = 3;

export type RazporediPatient = {
  rehabId: string;
  name: string;
  obcina: string | null;
  naselje: string | null;
  status: TriageStatus;
  missedCheckin: boolean;
  medicineUncollected: boolean;
  /** At least one approved zadolženec. */
  hasCarer: boolean;
  daysSinceDischarge: number;
  endDate: string;
  /** Current student, waiting for the patient or approved. */
  student: { id: string; name: string; approved: boolean } | null;
};

export type RazporediStudent = {
  id: string;
  name: string;
  /** Last day of the internship. */
  until: string;
  obcine: string[];
  /** Patients assigned now (waiting or approved). */
  load: number;
};

export type Need = { score: number; reasons: string[]; nurseFirst: boolean };

/** Why this patient needs a student, in words (§7: never colour alone). */
export function needOf(p: RazporediPatient): Need {
  const reasons: string[] = [];
  let score = 0;
  if (p.missedCheckin) { score += 3; reasons.push("Brez pregleda"); }
  if (p.medicineUncollected) { score += 3; reasons.push("Zdravila niso prevzeta"); }
  if (!p.hasCarer) { score += 2; reasons.push("Nima svojcev v aplikaciji"); }
  if (p.status === "rumeno") { score += 1; reasons.push("Rumeno"); }
  if (p.daysSinceDischarge < 7) { score += 1; reasons.push("Prvi teden doma"); }
  return { score, reasons, nurseFirst: p.status === "rdece" };
}

export function sortByNeed(patients: RazporediPatient[]): (RazporediPatient & { need: Need })[] {
  return patients
    .map((p) => ({ ...p, need: needOf(p) }))
    .sort((a, b) => b.need.score - a.need.score || a.name.localeCompare(b.name, "sl"));
}

export type Suggestion = {
  student: RazporediStudent;
  /** The student covers the patient's občina. */
  sameArea: boolean;
  /** The internship ends before the rehabilitacija. */
  endsEarly: boolean;
};

/** Best students for one patient: same občina, fewest patients, longest internship. Full students are left out. */
export function suggestStudents(p: RazporediPatient, students: RazporediStudent[], limit = 3): Suggestion[] {
  return students
    .filter((s) => s.load < MAX_PATIENTS_PER_STUDENT)
    .map((s) => ({ student: s, sameArea: !!p.obcina && s.obcine.includes(p.obcina), endsEarly: s.until < p.endDate }))
    .sort((a, b) =>
      Number(b.sameArea) - Number(a.sameArea)
      || a.student.load - b.student.load
      || Number(a.endsEarly) - Number(b.endsEarly)
      || b.student.until.localeCompare(a.student.until)
      || a.student.name.localeCompare(b.student.name, "sl"))
    .slice(0, limit);
}

export type Proposal = { rehabId: string; studentId: string };

/**
 * "Predlagaj razporeditev": neediest patients first, each to the best student in
 * the same občina who still has room. Red patients, patients who already have
 * a student and patients with no need are skipped; the nurse confirms all.
 */
export function proposeAll(patients: RazporediPatient[], students: RazporediStudent[]): Proposal[] {
  const load = new Map(students.map((s) => [s.id, s.load]));
  const out: Proposal[] = [];
  for (const p of sortByNeed(patients)) {
    if (p.student || p.need.nurseFirst || p.need.score === 0) continue;
    const pick = suggestStudents(p, students.map((s) => ({ ...s, load: load.get(s.id)! })), 1)[0];
    if (!pick?.sameArea) continue;
    out.push({ rehabId: p.rehabId, studentId: pick.student.id });
    load.set(pick.student.id, load.get(pick.student.id)! + 1);
  }
  return out;
}
