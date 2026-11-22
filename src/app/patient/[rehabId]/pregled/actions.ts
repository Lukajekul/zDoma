"use server";

import { refresh } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { oceniPregled } from "@/lib/triage";
import type { CheckinAnswers } from "@/lib/types";
import { cleanAnswer, copyFromYesterday } from "../../_lib/checkin-plan";
import { loadCheckinContext } from "../../_lib/checkins";
import { cleanPhotoPaths } from "../../_lib/photo-paths";

export type CheckinInput = {
  answers: Record<string, string | number>;
  sameAsYesterday: boolean;
  /** Up to two uploaded wound photos (T-72). */
  photoPaths?: string[];
};

const TRY_AGAIN = "Ni uspelo shraniti. Preverite internetno povezavo in poskusite znova.";

/** Saves today's check-in, runs triage and raises alerts. One per rehabilitacija per day. */
export async function saveCheckin(rehabId: string, input: CheckinInput): Promise<{ error?: string }> {
  const profile = await requireProfile();
  const ctx = await loadCheckinContext(profile.id, rehabId);
  if (!ctx || !ctx.active) return { error: "To okrevanje je zaključeno. Dnevnih pregledov ne pošiljate več." };
  if (ctx.todayCheckin) {
    refresh();
    return {};
  }

  // Recompute on the server: never trust copied answers from the client.
  const same = input.sameAsYesterday && ctx.sameSource ? copyFromYesterday(ctx.questions, ctx.sameSource) : {};
  const answers: CheckinAnswers = { ...ctx.known, ...same };
  for (const q of ctx.questions) {
    if (same[q.id] !== undefined) continue;
    const v = cleanAnswer(q, input.answers[q.id]);
    if (v === undefined) return { error: "Manjka odgovor. Pojdite nazaj in odgovorite na vsa vprašanja." };
    answers[q.id] = v;
  }
  const photos = cleanPhotoPaths(ctx.rehab.id, input.photoPaths);

  const ocena = oceniPregled({
    predloga: ctx.predloga,
    vrednosti: ctx.values,
    danes: { datum: ctx.today, odgovori: answers },
    prejsnji: ctx.history.map((c) => ({ datum: c.checkin_date, odgovori: c.answers })),
    izbranaVprasanja: ctx.rehab.questions.length ? ctx.rehab.questions : undefined,
  });

  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("checkins")
    .insert({
      rehab_id: ctx.rehab.id,
      checkin_date: ctx.today,
      answers,
      same_as_yesterday: Object.keys(same).length > 0,
      triage_status: ocena.status,
      reasons: ocena.razlogi.map((r) => r.besedilo),
      ...photos,
    })
    .select("id")
    .single();
  if (error || !saved) return { error: TRY_AGAIN };

  if (ocena.status !== "zeleno") {
    const status = ocena.status;
    await supabase.from("alerts").insert(
      ocena.razlogi.map((r) => ({
        rehab_id: ctx.rehab.id,
        checkin_id: saved.id,
        status,
        reason: r.besedilo,
        source: "checkin" as const,
      })),
    );
  }
  refresh();
  return {};
}
