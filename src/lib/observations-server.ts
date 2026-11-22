import "server-only";

import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { createClient } from "@/lib/supabase/server";
import { predlogaZaRehab } from "@/lib/templates";
import type { TriageStatus } from "@/lib/types";

/** One zadolženec observation (T-73), ready to show: chip labels and "Ana (hčerka)". */
export type ObservationView = {
  id: string;
  createdAt: string;
  by: string;
  chips: string[];
  note: string | null;
  concern: boolean;
  status: TriageStatus;
  read: boolean;
};

/** Latest observations of one rehabilitacija, newest first. Throws if they can't be read. */
export async function getObservations(
  rehab: { id: string; patient_id: string; template_id: string; custom_questions?: unknown },
  limit = 10,
): Promise<ObservationView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carer_observations")
    .select("id, created_at, entered_by, chips, note, concern, status, read_at")
    .eq("rehab_id", rehab.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not read carer observations");

  const names = await getMarkerNames(rehab.patient_id, data);
  const labels = new Map((predlogaZaRehab(rehab)?.opazanja ?? []).map((o) => [o.id, o.besedilo]));
  return data.map((o) => ({
    id: o.id,
    createdAt: o.created_at,
    by: names[o.entered_by] ?? "Svojec",
    chips: o.chips.map((id) => labels.get(id) ?? id),
    note: o.note,
    concern: o.concern,
    status: o.status,
    read: !!o.read_at,
  }));
}
