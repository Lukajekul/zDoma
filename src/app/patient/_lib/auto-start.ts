// T-61: where a patient lands when they open zDoma, so today's work opens by itself.
import { cookies } from "next/headers";
import type { DoseLog, IsoDate, Medication, TimeOfDay, Uuid } from "@/lib/types";
import { groupChanges, seenCookie } from "./changes";
import { loadCheckinContext } from "./checkins";
import { SLOT_START, nowMinutesLjubljana } from "./danes";
import { getMedsAndLogs } from "./doses";
import { dosesOn } from "./schedule";

/** The time-of-day slot whose pills are due now and not all marked yet, or null. */
export function slotDueNow(meds: Medication[], logs: DoseLog[], today: IsoDate): TimeOfDay | null {
  const now = nowMinutesLjubljana();
  const due = dosesOn(meds, logs, today).find((g) => SLOT_START[g.time] <= now && g.doses.some((d) => !d.log));
  return due?.time ?? null;
}

/** Today's pills, scrolled to the slot that is due. */
export const pillsHref = (rehabId: string, time: TimeOfDay) => `/patient/${rehabId}/zdravila#${time}`;

/**
 * Unfinished check-in → check-in; pills due now → pills; otherwise "Danes".
 * Unseen medicine changes keep the patient on "Danes", which shows them first (T-35).
 */
export async function autoStartPath(patientId: Uuid, rehabId: string): Promise<string> {
  const base = `/patient/${rehabId}`;
  const ctx = await loadCheckinContext(patientId, rehabId);
  if (!ctx?.active) return base;
  if (!ctx.todayCheckin && ctx.questions.length > 0) return `${base}/pregled`;

  const { meds, logs } = await getMedsAndLogs(rehabId);
  if (groupChanges(meds).any && !(await cookies()).get(seenCookie(rehabId))) return base;

  const time = slotDueNow(meds, logs, ctx.today);
  return time ? pillsHref(rehabId, time) : base;
}
