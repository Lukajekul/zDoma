import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { TriageStatus } from "@/lib/types";

export type VisitRow = {
  rehabId: string;
  name: string;
  obcina: string;
  naselje: string | null;
  address: string | null;
  status: TriageStatus;
  installed: boolean;
  /** Patient of a colleague this nurse is substituting for. */
  coveringFor?: string;
};

const RANK: Record<TriageStatus, number> = { rdece: 0, rumeno: 1, zeleno: 2 };

/**
 * "Danes obiščite": active rehabilitacije assigned to this nurse, plus those of
 * nurses she substitutes for today (nadomeščanje), by status then name, grouped by občina.
 */
export async function getVisits(nurseId: string, today: string) {
  const supabase = await createClient();
  const [{ data: covering }, { data: away }] = await Promise.all([
    supabase.from("nadomescanje").select("nurse_id, until_date").eq("substitute_id", nurseId).gte("until_date", today),
    supabase.from("nadomescanje").select("substitute_id, until_date").eq("nurse_id", nurseId).gte("until_date", today),
  ]);
  const ids = [nurseId, ...(covering ?? []).map((c) => c.nurse_id)];
  const { data: staff } = await supabase.from("staff_directory").select("id, first_name, last_name");
  const nameOf = (id: string | null) => {
    const s = staff?.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : "";
  };

  const { data, error } = await supabase
    .from("rehabilitacije")
    .select("id, current_status, installed_at, assigned_nurse_id, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name, obcina, naselje, address)")
    .eq("status", "aktivna")
    .lte("start_date", today)
    .gte("end_date", today)
    .in("assigned_nurse_id", ids);
  if (error) return null;

  const rows: VisitRow[] = (data ?? [])
    .filter((r) => r.patient)
    .map((r) => ({
      rehabId: r.id,
      name: `${r.patient!.first_name} ${r.patient!.last_name}`,
      obcina: r.patient!.obcina ?? "Brez občine",
      naselje: r.patient!.naselje,
      address: r.patient!.address,
      status: r.current_status,
      installed: !!r.installed_at,
      coveringFor: r.assigned_nurse_id !== nurseId ? nameOf(r.assigned_nurse_id) : undefined,
    }))
    .sort((a, b) => RANK[a.status] - RANK[b.status] || a.name.localeCompare(b.name, "sl"));

  const groups = new Map<string, VisitRow[]>();
  for (const r of rows) groups.set(r.obcina, [...(groups.get(r.obcina) ?? []), r]);
  // Občine with the most urgent patient first.
  const ordered = [...groups.entries()].sort(([, a], [, b]) => RANK[a[0].status] - RANK[b[0].status] || b.length - a.length);
  const handedTo = away?.[0] ? { name: nameOf(away[0].substitute_id), until: away[0].until_date } : undefined;
  return { groups: ordered, todo: rows.filter((r) => !r.installed), handedTo };
}
