import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Rehabilitacija, type Uuid } from "@/lib/types";

/** The patient's own rehabilitacije, newest first, split into active and past. */
export async function getMyRehabs(patientId: Uuid) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rehabilitacije")
    .select("*")
    .eq("patient_id", patientId)
    .order("start_date", { ascending: false });
  if (error) throw new Error("Rehabilitacij ni bilo mogoče naložiti.");

  const rehabs = (data ?? []) as Rehabilitacija[];
  const today = todayLjubljana();
  return {
    active: rehabs.filter((r) => isRehabActive(r, today)),
    past: rehabs.filter((r) => !isRehabActive(r, today)),
  };
}

/** One of the patient's own rehabilitacije, or null (not theirs / not found). */
export async function getMyRehab(patientId: Uuid, rehabId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rehabilitacije")
    .select("*")
    .eq("id", rehabId)
    .eq("patient_id", patientId)
    .maybeSingle();
  return (data as Rehabilitacija | null) ?? null;
}
