"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";

/** "Nameščeno ✓" after the first home visit (T-36 b). */
export async function markInstalled(rehabId: string): Promise<{ error?: string }> {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("rehabilitacije").update({ installed_at: new Date().toISOString() }).eq("id", rehabId);
  if (error) return { error: "Ni uspelo shraniti. Poskusite znova." };
  await supabase.from("audit_log").insert({ actor_id: staff.id, action: "namesceno", entity: "rehabilitacije", entity_id: rehabId, details: {} });
  redirect("/nurse/danes");
}

/** "Nadomeščanje": hand a nurse's patients to a colleague until a date; they return automatically after it. */
export async function createSubstitution(nurseId: string, substituteId: string, until: string): Promise<{ error?: string; ok?: boolean }> {
  const staff = await requireStaff();
  const today = todayLjubljana();
  if (!nurseId || !substituteId) return { error: "Izberite obe sestri." };
  if (nurseId === substituteId) return { error: "Sestra ne more nadomeščati sama sebe." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until) || until < today) return { error: "Datum »do« mora biti danes ali kasneje." };

  const supabase = await createClient();
  const { data: open } = await supabase.from("nadomescanje").select("id").eq("nurse_id", nurseId).gte("until_date", today);
  if (open?.length) return { error: "Za to sestro nadomeščanje že teče. Najprej ga prekličite." };

  const { data, error } = await supabase
    .from("nadomescanje")
    .insert({ nurse_id: nurseId, substitute_id: substituteId, until_date: until, created_by: staff.id })
    .select("id")
    .single();
  if (error || !data) return { error: "Ni uspelo shraniti. Poskusite znova." };
  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: "nadomescanje",
    entity: "nadomescanje",
    entity_id: data.id,
    details: { sestra: nurseId, nadomesca: substituteId, do: until },
  });
  refresh();
  return { ok: true };
}

/** End a nadomeščanje now: the patients return to their nurse at once. */
export async function cancelSubstitution(id: string): Promise<{ error?: string }> {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("nadomescanje").delete().eq("id", id);
  if (error) return { error: "Ni uspelo. Poskusite znova." };
  await supabase.from("audit_log").insert({ actor_id: staff.id, action: "nadomescanje_preklicano", entity: "nadomescanje", entity_id: id, details: {} });
  refresh();
  return {};
}
