// T-39: which daily check-in reminders are due now. Pure: no I/O, no clock.
// "The app chases the patient": first reminder at the patient's time, a second
// one later, then the zadolženec. Staff see "Brez pregleda danes" (T-08).

export type ReminderKind = "prvi" | "drugi" | "zadolzenec";

export interface ReminderSettings {
  /** Minutes after the patient's time. */
  drugiPo: number;
  zadolzenecPo: number;
  /** No reminders after this local time ("HH:MM"). */
  tiho: string;
}

export const REMINDER_SETTINGS: ReminderSettings = { drugiPo: 120, zadolzenecPo: 240, tiho: "21:00" };

export interface ReminderRehab {
  rehabId: string;
  patientId: string;
  firstName: string;
  /** "08:00" or "08:00:00", Europe/Ljubljana. */
  checkinTime: string;
  /** Today's check-in is done: no reminders at all. */
  doneToday: boolean;
  /** Kinds already sent today. */
  sent: ReminderKind[];
}

export interface PlannedReminder {
  rehabId: string;
  kind: ReminderKind;
  /** Kinds to record as sent, never one already sent (a late "drugi" also covers "prvi"). */
  marks: ReminderKind[];
  title: string;
  body: string;
}

/** Minutes since midnight from "HH:MM[:SS]". */
export function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Reminders due at local time `now` ("HH:MM"). At most one patient reminder per
 * run (the latest step due), plus the zadolženec step. No diagnosis or
 * medicine names in the text (AGENTS.md §5a).
 */
export function planReminders(
  rehabs: ReminderRehab[],
  now: string,
  s: ReminderSettings = REMINDER_SETTINGS,
): PlannedReminder[] {
  const t = minutes(now);
  if (t >= minutes(s.tiho)) return [];
  const out: PlannedReminder[] = [];
  for (const r of rehabs) {
    if (r.doneToday) continue;
    const start = minutes(r.checkinTime);
    if (t < start) continue;
    const sent = new Set(r.sent);

    if (t >= start + s.drugiPo && !sent.has("drugi")) {
      out.push({
        rehabId: r.rehabId, kind: "drugi", marks: sent.has("prvi") ? ["drugi"] : ["prvi", "drugi"], title: "zDoma",
        body: `${r.firstName}, današnji pregled še čaka. Traja 30 sekund.`,
      });
    } else if (!sent.has("prvi") && !sent.has("drugi")) {
      out.push({
        rehabId: r.rehabId, kind: "prvi", marks: ["prvi"], title: "zDoma",
        body: `${pozdrav(t)}, ${r.firstName}. Čas je za današnji pregled. Traja 30 sekund.`,
      });
    }
    if (t >= start + s.zadolzenecPo && !sent.has("zadolzenec")) {
      out.push({
        rehabId: r.rehabId, kind: "zadolzenec", marks: ["zadolzenec"], title: "zDoma",
        body: `${r.firstName}: današnji pregled še ni opravljen. Odprite zDoma.`,
      });
    }
  }
  return out;
}

function pozdrav(t: number): string {
  if (t < 10 * 60) return "Dobro jutro";
  if (t < 18 * 60) return "Dober dan";
  return "Dober večer";
}
