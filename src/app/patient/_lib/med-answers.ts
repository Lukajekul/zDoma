// Check-in answers the pill list already gives (T-70). Pure, generic: reads
// only the template's `izZdravil` data, never condition-specific ids.
import { polniVrednost, type Predloga, type Vprasanje } from "@/lib/templates";
import type { CheckinAnswers, DoseLog, IsoDate, Medication } from "@/lib/types";
import { addDays, dosesOn } from "./schedule";

/**
 * For each question with `izZdravil`: when the matching medicines had at least
 * one scheduled dose that day and every one is logged "vzeto", the answer is
 * known and the patient isn't asked. Anything missing or skipped is still asked.
 */
export function answersFromPills(
  predloga: Predloga,
  questions: Vprasanje[],
  meds: Medication[],
  logs: DoseLog[],
  today: IsoDate,
): CheckinAnswers {
  const out: CheckinAnswers = {};
  for (const q of questions) {
    if (q.tip !== "izbira" || !q.izZdravil) continue;
    const { vrednost, dniNazaj, vzeto } = q.izZdravil;
    const day = addDays(today, -dniNazaj);
    const doses = dosesOn(meds, logs, day)
      .flatMap((g) => g.doses)
      .filter((d) => polniVrednost(predloga, vrednost, d.medication));
    if (doses.length && doses.every((d) => d.log?.status === "vzeto")) out[q.id] = vzeto;
  }
  return out;
}
