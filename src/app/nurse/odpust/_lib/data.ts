import "server-only";

import { createClient } from "@/lib/supabase/server";
import { seznamPredlog, type Zdravilo } from "@/lib/templates";
import type { NurseOption } from "./plan";

/** Patronažne sestre (staff with at least one teren), their tereni and current nadomeščanja. */
export async function getNurseData() {
  const supabase = await createClient();
  const [staff, tereni, subs] = await Promise.all([
    supabase.from("staff_directory").select("id, first_name, last_name"),
    supabase.from("tereni").select("nurse_id, obcina, naselja"),
    supabase.from("nadomescanje").select("nurse_id, substitute_id, until_date"),
  ]);
  const nurses: NurseOption[] = (staff.data ?? [])
    .map((s) => ({
      id: s.id ?? "",
      name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim(),
      tereni: (tereni.data ?? []).filter((t) => t.nurse_id === s.id).map((t) => ({ obcina: t.obcina, naselja: t.naselja })),
    }))
    .filter((n) => n.id && n.tereni.length)
    .sort((a, b) => a.name.localeCompare(b.name, "sl"));
  return { nurses, subs: subs.data ?? [] };
}

/** "Dodaj zdravilo" mock list: every template's medicines, once each. Later the Centralna baza zdravil. */
export function medicineCatalogue(): Zdravilo[] {
  const seen = new Set<string>();
  return seznamPredlog
    .flatMap((p) => p.zdravila)
    .filter((z) => (seen.has(z.ime) ? false : (seen.add(z.ime), true)))
    .sort((a, b) => a.ime.localeCompare(b.ime, "sl"));
}
