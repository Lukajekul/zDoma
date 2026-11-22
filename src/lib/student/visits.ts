// Študent pomočnik: when the student visits and which reminders are due.
// Pure: no I/O, no clock. Visit times come from the patient's own schedule set
// at discharge: the morning visit is the patient's check-in time, the other
// slots follow the medicine times of day.
import { minutes } from "@/lib/reminders/plan";
import type { TimeOfDay } from "@/lib/types";

export interface VisitSettings {
  /** Reminder to the student this many minutes before the visit. */
  prejMin: number;
  /** Nothing marked this many minutes after the visit time → student and nurse are told. */
  zamudaMin: number;
  /** A late visit is no longer reported this many minutes after its time. */
  zamudaDo: number;
}

export const VISIT_SETTINGS: VisitSettings = { prejMin: 30, zamudaMin: 30, zamudaDo: 240 };

/** Fixed visit times for the slots after the morning one ("HH:MM", Europe/Ljubljana). Product setting. */
const SLOT_TIME: Record<Exclude<TimeOfDay, "zjutraj">, string> = { opoldne: "12:00", zvecer: "18:00", ponoci: "21:00" };

/** Visit time of a slot in minutes after midnight. Morning = the patient's check-in time. */
export function visitMinutes(slot: TimeOfDay, checkinTime: string): number {
  return minutes(slot === "zjutraj" ? checkinTime : SLOT_TIME[slot]);
}

/** "8:00" from minutes after midnight. */
export function clock(m: number): string {
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

export type VisitReminderKind = "prej" | "zamuda";

export interface VisitSlot {
  slot: TimeOfDay;
  /** Every task of this slot is marked (pills, and the check-in for the morning). */
  done: boolean;
}

export interface StudentVisit {
  assignmentId: string;
  checkinTime: string;
  slots: VisitSlot[];
  /** Already sent today, as "<slot>:<kind>". */
  sent: string[];
}

export interface PlannedVisitReminder {
  assignmentId: string;
  slot: TimeOfDay;
  kind: VisitReminderKind;
  at: number;
}

/** Visit reminders due at local time `now` ("HH:MM"). */
export function planVisitReminders(
  visits: StudentVisit[],
  now: string,
  s: VisitSettings = VISIT_SETTINGS,
): PlannedVisitReminder[] {
  const t = minutes(now);
  const out: PlannedVisitReminder[] = [];
  for (const v of visits) {
    const sent = new Set(v.sent);
    for (const { slot, done } of v.slots) {
      if (done) continue;
      const at = visitMinutes(slot, v.checkinTime);
      if (t >= at - s.prejMin && t < at && !sent.has(`${slot}:prej`)) {
        out.push({ assignmentId: v.assignmentId, slot, kind: "prej", at });
      }
      if (t >= at + s.zamudaMin && t < at + s.zamudaDo && !sent.has(`${slot}:zamuda`)) {
        out.push({ assignmentId: v.assignmentId, slot, kind: "zamuda", at });
      }
    }
  }
  return out;
}

const ORDER: TimeOfDay[] = ["zjutraj", "opoldne", "zvecer", "ponoci"];

/**
 * Today's visit slots: one per time of day with pills, plus the morning visit
 * for the daily check-in. A slot is done when every pill in it is marked
 * (taken or not) and, in the morning, the check-in is answered.
 */
export function visitSlots(pillSlots: { slot: TimeOfDay; allMarked: boolean }[], checkinDone: boolean): VisitSlot[] {
  const bySlot = new Map(pillSlots.map((p) => [p.slot, p.allMarked]));
  return ORDER.filter((slot) => bySlot.has(slot) || slot === "zjutraj").map((slot) => ({
    slot,
    done: (bySlot.get(slot) ?? true) && (slot !== "zjutraj" || checkinDone),
  }));
}
