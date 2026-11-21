"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { sendPush } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { REMINDER_TIMES } from "./times";

export interface BrowserSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Stores this device's push subscription for the logged-in user (moves it if the device changed account). */
export async function saveSubscription(sub: BrowserSubscription): Promise<{ ok: boolean }> {
  const profile = await requireProfile();
  if (!/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .upsert(
      { user_id: profile.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: "endpoint" },
    );
  return { ok: !error };
}

/** "Opomnik ob": the patient picks the daily reminder time (they can't switch it off). */
export async function setCheckinTime(time: string): Promise<void> {
  const profile = await requireProfile();
  if (!REMINDER_TIMES.includes(time)) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ checkin_time: time }).eq("id", profile.id);
  revalidatePath("/patient/opomnik");
}

/** "Pošlji poskusno obvestilo" to this user's devices. */
export async function sendTestPush(): Promise<{ reached: number }> {
  const profile = await requireProfile();
  const reached = await sendPush([profile.id], {
    title: "zDoma",
    body: `${profile.first_name}, obvestila delujejo ✓`,
    url: "/patient",
  });
  return { reached };
}
