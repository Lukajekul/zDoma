"use server";

import { refresh } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana } from "@/lib/types";
import { getMyRehab } from "../../_lib/rehabs";

export type ExerciseActionState = { error?: string };

const TRY_AGAIN = "Ni uspelo. Preverite internetno povezavo in poskusite znova.";

/** Log one exercise session today: done (with pain 0–10) or skipped. */
export async function logExercise(
  rehabId: string,
  rehabExerciseId: string,
  done: boolean,
  pain: number | null,
): Promise<ExerciseActionState> {
  const profile = await requireProfile();
  const today = todayLjubljana();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab || !isRehabActive(rehab, today)) {
    return { error: "To okrevanje je zaključeno. Vaj tukaj ne označujete več." };
  }
  if (pain !== null && !(Number.isInteger(pain) && pain >= 0 && pain <= 10)) return { error: TRY_AGAIN };

  const supabase = await createClient();
  const { data: ex } = await supabase
    .from("rehab_exercises")
    .select("id, times_per_day")
    .eq("id", rehabExerciseId)
    .eq("rehab_id", rehab.id)
    .eq("active", true)
    .maybeSingle();
  if (!ex) return { error: "Te vaje nimate več v načrtu." };

  const { count } = await supabase
    .from("rehab_logs")
    .select("id", { count: "exact", head: true })
    .eq("rehab_exercise_id", ex.id)
    .eq("log_date", today);
  if ((count ?? 0) >= ex.times_per_day) return { error: "To vajo ste danes že označili." };

  const { error } = await supabase.from("rehab_logs").insert({
    rehab_exercise_id: ex.id,
    rehab_id: rehab.id,
    log_date: today,
    done,
    pain: done ? pain : null,
  });
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** "Razveljavi": remove an entry the user made today (RLS: own rows only). */
export async function undoExercise(rehabId: string, logId: string): Promise<ExerciseActionState> {
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) return { error: TRY_AGAIN };

  const supabase = await createClient();
  const { error } = await supabase
    .from("rehab_logs")
    .delete()
    .eq("id", logId)
    .eq("rehab_id", rehab.id)
    .eq("log_date", todayLjubljana())
    .eq("entered_by", profile.id);
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}
