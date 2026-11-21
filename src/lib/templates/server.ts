import "server-only";

// T-24: templates with the staff overrides applied (server only). Overrides are
// staff-readable only (RLS); for anyone else this returns the file templates.
import { createClient } from "@/lib/supabase/server";
import { getPredloga, seznamPredlog } from ".";
import { preberiPrilagoditev, uporabiPrilagoditev, type Prilagoditev } from "./overrides";
import type { Predloga, PredlogaId } from "./types";

export interface ShranjenaPrilagoditev {
  prilagoditev: Prilagoditev;
  updatedAt: string;
  updatedBy: string | null;
}

export async function getPrilagoditve(): Promise<Partial<Record<PredlogaId, ShranjenaPrilagoditev>>> {
  const supabase = await createClient();
  const { data } = await supabase.from("template_overrides").select("template_id, data, updated_at, updated_by");
  const out: Partial<Record<PredlogaId, ShranjenaPrilagoditev>> = {};
  for (const row of data ?? []) {
    const p = getPredloga(row.template_id);
    if (p) out[p.id] = { prilagoditev: preberiPrilagoditev(row.data), updatedAt: row.updated_at, updatedBy: row.updated_by };
  }
  return out;
}

/** All six templates with staff defaults applied, in the usual order. */
export async function getPrilagojenePredloge(): Promise<Predloga[]> {
  const o = await getPrilagoditve();
  return seznamPredlog.map((p) => uporabiPrilagoditev(p, o[p.id]?.prilagoditev));
}

export async function getPrilagojenaPredloga(id: string): Promise<Predloga | undefined> {
  const p = getPredloga(id);
  if (!p) return undefined;
  const o = await getPrilagoditve();
  return uporabiPrilagoditev(p, o[p.id]?.prilagoditev);
}
