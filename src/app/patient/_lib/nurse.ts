import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { IsoDate } from "@/lib/types";

/**
 * The patient's patronažna sestra, and her substitute while a nadomeščanje runs
 * (readable by the patient since the T-49 migration; before it, just no substitute).
 */
export async function getMyNurse(nurseId: string | null, today: IsoDate) {
  if (!nurseId) return null;
  const supabase = await createClient();
  const [{ data: staff }, { data: sub }] = await Promise.all([
    supabase.from("staff_directory").select("id, first_name, last_name"),
    supabase
      .from("nadomescanje")
      .select("substitute_id, until_date")
      .eq("nurse_id", nurseId)
      .gte("until_date", today)
      .order("until_date")
      .limit(1)
      .maybeSingle(),
  ]);
  const name = (id: string) => {
    const s = staff?.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };
  const nurse = name(nurseId);
  if (!nurse) return null;
  const substitute = sub ? name(sub.substitute_id) : null;
  return { nurse, substitute: substitute ? { name: substitute, until: sub!.until_date } : undefined };
}
