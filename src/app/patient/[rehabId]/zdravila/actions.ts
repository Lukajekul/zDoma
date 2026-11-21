"use server";

import { refresh } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Medication, type TimeOfDay } from "@/lib/types";
import { getMyRehab } from "../../_lib/rehabs";
import { isScheduledOn, TIME_ORDER } from "../../_lib/schedule";

export type DoseActionState = { error?: string };

const TRY_AGAIN = "Ni uspelo. Preverite internetno povezavo in poskusite znova.";

/** "Vzeto": log today's dose of one medication at one time of day. */
export async function markTaken(
  rehabId: string,
  medicationId: string,
  time: TimeOfDay,
): Promise<DoseActionState> {
  const profile = await requireProfile();
  const today = todayLjubljana();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab || !isRehabActive(rehab, today) || !TIME_ORDER.includes(time)) {
    return { error: "To okrevanje je zaključeno. Tablet tukaj ne označujete več." };
  }

  const supabase = await createClient();
  const { data: med } = await supabase
    .from("medications")
    .select("*")
    .eq("id", medicationId)
    .eq("rehab_id", rehab.id)
    .maybeSingle();
  const m = med as Medication | null;
  if (!m || !isScheduledOn(m, today) || !m.times.includes(time)) {
    return { error: "Tega zdravila danes ob tem času ne jemljete." };
  }

  const { error } = await supabase.from("dose_logs").upsert(
    { medication_id: m.id, rehab_id: rehab.id, scheduled_date: today, time_of_day: time, status: "vzeto" },
    { onConflict: "medication_id,scheduled_date,time_of_day", ignoreDuplicates: true },
  );
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** "Razveljavi": remove a "Vzeto" the user entered today (RLS: own rows only). */
export async function undoTaken(rehabId: string, logId: string): Promise<DoseActionState> {
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) return { error: TRY_AGAIN };

  const supabase = await createClient();
  const { error } = await supabase
    .from("dose_logs")
    .delete()
    .eq("id", logId)
    .eq("rehab_id", rehab.id)
    .eq("scheduled_date", todayLjubljana())
    .eq("status", "vzeto")
    .eq("entered_by", profile.id);
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** "Da, vzeto" on "Danes": log every open dose of one time of day today. */
export async function markSlotTaken(rehabId: string, time: TimeOfDay): Promise<DoseActionState> {
  const profile = await requireProfile();
  const today = todayLjubljana();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab || !isRehabActive(rehab, today) || !TIME_ORDER.includes(time)) {
    return { error: "To okrevanje je zaključeno. Tablet tukaj ne označujete več." };
  }

  const supabase = await createClient();
  const { data } = await supabase.from("medications").select("*").eq("rehab_id", rehab.id);
  const meds = ((data ?? []) as Medication[]).filter((m) => isScheduledOn(m, today) && m.times.includes(time));
  if (!meds.length) return {};

  const { error } = await supabase.from("dose_logs").upsert(
    meds.map((m) => ({ medication_id: m.id, rehab_id: rehab.id, scheduled_date: today, time_of_day: time, status: "vzeto" as const })),
    { onConflict: "medication_id,scheduled_date,time_of_day", ignoreDuplicates: true },
  );
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}
