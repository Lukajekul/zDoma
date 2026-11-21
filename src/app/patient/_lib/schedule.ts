// Pure dose-schedule helpers (no I/O). Dates are "YYYY-MM-DD" in Europe/Ljubljana.
import type { DoseLog, IsoDate, Medication, TimeOfDay } from "@/lib/types";

export const TIME_ORDER: TimeOfDay[] = ["zjutraj", "opoldne", "zvecer", "ponoci"];

export const TIME_LABEL: Record<TimeOfDay, string> = {
  zjutraj: "Zjutraj",
  opoldne: "Opoldne",
  zvecer: "Zvečer",
  ponoci: "Ponoči",
};

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Medication is to be taken on this date (not stopped, within its dates). */
export function isScheduledOn(med: Pick<Medication, "change" | "start_date" | "end_date">, date: IsoDate) {
  return med.change !== "ukinjeno" && med.start_date <= date && (!med.end_date || date <= med.end_date);
}

export type Dose = { medication: Medication; time: TimeOfDay; log: DoseLog | undefined };

/** One date's doses grouped by time of day, in TIME_ORDER; empty slots are left out. */
export function dosesOn(meds: Medication[], logs: DoseLog[], date: IsoDate) {
  const groups: { time: TimeOfDay; doses: Dose[] }[] = [];
  for (const time of TIME_ORDER) {
    const doses = meds
      .filter((m) => isScheduledOn(m, date) && m.times.includes(time))
      .map((m) => ({
        medication: m,
        time,
        log: logs.find((l) => l.medication_id === m.id && l.scheduled_date === date && l.time_of_day === time),
      }));
    if (doses.length) groups.push({ time, doses });
  }
  return groups;
}

/**
 * Scheduled doses with no log between `from` and `to` (inclusive): these get
 * logged as "izpusceno". Never pass today as `to`: today can still be taken.
 */
export function unloggedDoses(meds: Medication[], logs: DoseLog[], from: IsoDate, to: IsoDate) {
  const missed: { medication_id: string; scheduled_date: IsoDate; time_of_day: TimeOfDay }[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    for (const { doses } of dosesOn(meds, logs, date)) {
      for (const d of doses) {
        if (!d.log) missed.push({ medication_id: d.medication.id, scheduled_date: date, time_of_day: d.time });
      }
    }
  }
  return missed;
}
