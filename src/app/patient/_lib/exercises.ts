import "server-only";

import { getPredloga, type Vaja } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import type { IsoDate, Rehabilitacija, RehabExercise, RehabLog } from "@/lib/types";

export type ExerciseWithContent = {
  exercise: RehabExercise;
  /** Steps and picture from the template, or a doctor's own steps (T-69); undefined when neither has it. */
  content: Vaja | undefined;
  /** This exercise's logs for the given day. */
  logs: RehabLog[];
};

/** A doctor's own exercise (T-69): its steps are stored on the row. */
function lastnaVaja(e: RehabExercise): Vaja | undefined {
  if (!e.steps?.length) return undefined;
  return { id: e.exercise_id, naslov: e.title, koraki: e.steps, ponovitve: e.repetitions ?? "", vir: { opis: "Dodal zdravnik", potrjeno: false } };
}

/** Active exercises of a rehabilitacija with template content and that day's logs. */
export async function getExercisesForDay(
  rehab: Pick<Rehabilitacija, "id" | "template_id">,
  date: IsoDate,
): Promise<ExerciseWithContent[]> {
  const supabase = await createClient();
  const [ex, logs] = await Promise.all([
    supabase.from("rehab_exercises").select("*").eq("rehab_id", rehab.id).eq("active", true).order("created_at"),
    supabase.from("rehab_logs").select("*").eq("rehab_id", rehab.id).eq("log_date", date).order("created_at"),
  ]);
  if (ex.error || logs.error) throw new Error("Vaj ni bilo mogoče naložiti.");

  const vaje = getPredloga(rehab.template_id)?.vaje ?? [];
  return ((ex.data ?? []) as RehabExercise[]).map((exercise) => ({
    exercise,
    content: vaje.find((v) => v.id === exercise.exercise_id) ?? lastnaVaja(exercise),
    logs: ((logs.data ?? []) as RehabLog[]).filter((l) => l.rehab_exercise_id === exercise.id),
  }));
}
