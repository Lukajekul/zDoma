// Check-in answers the pill list already gives (T-70). Pure, generic: reads
// only the template's `izZdravil` data, never condition-specific ids.
import { atcZaUcinkovino } from "@/app/nurse/odpust/_lib/dejstva";
import { banka, type Nacrt } from "@/lib/moduli";
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

const norm = (s: string | null | undefined) => (s ?? "").trim().toLocaleLowerCase("sl-SI");

/** ATC code of a medicine: from the plan's discharge facts by name, else the known active substances. */
function atcOf(nacrt: Nacrt, m: Medication): string | undefined {
  const names = [norm(m.name), norm(m.active_substance)].filter(Boolean);
  const fact = nacrt.dejstva.zdravila.find((z) => z.ime && names.includes(norm(z.ime)));
  return fact?.atc ?? atcZaUcinkovino(m.active_substance, m.name);
}

/**
 * The same for an approved plan (T-84): an item with `izZdravilModula` is
 * answered when its module's medicines (by ATC) had at least one dose that day
 * and every one is logged "vzeto". Plans approved before the field existed read
 * it from the bank item with the same versioned id.
 */
export function answersFromPillsNacrt(
  nacrt: Nacrt,
  questionIds: string[],
  meds: Medication[],
  logs: DoseLog[],
  today: IsoDate,
): CheckinAnswers {
  const out: CheckinAnswers = {};
  for (const id of questionIds) {
    const vn = nacrt.vnosi.find((v) => v.postavka.id === id);
    const iz = vn && (vn.postavka.izZdravilModula ?? banka.postavke.find((p) => p.id === id)?.izZdravilModula);
    if (!vn || !iz) continue;
    const prefixes = banka.moduli.filter((m) => vn.moduli.includes(m.id)).flatMap((m) => m.aktivacija.atc ?? []);
    const doses = dosesOn(meds, logs, addDays(today, -iz.dniNazaj))
      .flatMap((g) => g.doses)
      .filter((d) => {
        const atc = atcOf(nacrt, d.medication)?.toUpperCase();
        return !!atc && prefixes.some((p) => atc.startsWith(p.toUpperCase()));
      });
    if (doses.length && doses.every((d) => d.log?.status === "vzeto")) out[id] = iz.vzeto;
  }
  return out;
}
