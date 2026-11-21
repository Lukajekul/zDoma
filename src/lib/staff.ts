import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Uuid } from "@/lib/types";

/**
 * Two kinds of bolničar, from data instead of a role (T-57): a staff member who
 * covers a teren is a patronažna sestra (phone first, home visits); anyone else
 * works in the hospital (discharges, templates).
 */
export type StaffKind = "patronaza" | "bolnisnica";

export async function getStaffKind(staffId: Uuid): Promise<{ kind: StaffKind; obcine: string[] }> {
  const supabase = await createClient();
  const { data } = await supabase.from("tereni").select("obcina").eq("nurse_id", staffId);
  const obcine = [...new Set((data ?? []).map((t) => t.obcina))];
  return { kind: obcine.length ? "patronaza" : "bolnisnica", obcine };
}
