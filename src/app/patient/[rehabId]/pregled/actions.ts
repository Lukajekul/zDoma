"use server";

import { refresh } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { insertCheckin } from "../../_lib/checkin-save";
import { loadCheckinContext } from "../../_lib/checkins";

export type CheckinInput = {
  answers: Record<string, string | number>;
  /** Up to two uploaded wound photos (T-72). */
  photoPaths?: string[];
  /** T-94: questions the patient skipped ("Preskoči"), flagged for the nurse. */
  skipped?: string[];
  /** T-94: "Sporoči drugo težavo" – the patient asks the nurse to call. */
  otherProblem?: boolean;
};

/** Saves today's check-in, runs triage and raises alerts. One per rehabilitacija per day. */
export async function saveCheckin(rehabId: string, input: CheckinInput): Promise<{ error?: string }> {
  const profile = await requireProfile();
  const ctx = await loadCheckinContext(profile.id, rehabId);
  if (!ctx || !ctx.active) return { error: "To okrevanje je zaključeno. Dnevnih pregledov ne pošiljate več." };
  if (!ctx.todayCheckin) {
    const res = await insertCheckin(ctx, input);
    if (res.error) return res;
  }
  refresh();
  return {};
}
