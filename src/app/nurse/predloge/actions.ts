"use server";

import { refresh } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getPredloga } from "@/lib/templates";
import { preberiPrilagoditev, preveriPrilagoditev, stisniPrilagoditev, type Prilagoditev } from "@/lib/templates/overrides";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

export type ShraniStanje = { error?: string; ok?: boolean };

/**
 * Saves a template's plan defaults (T-24) and writes the change to audit_log.
 * `prilagoditev = {}` resets to the file template. Only staff (RLS + requireStaff).
 */
export async function shraniPrilagoditev(templateId: string, vnos: Prilagoditev): Promise<ShraniStanje> {
  const staff = await requireStaff();
  const p = getPredloga(templateId);
  if (!p) return { error: "Neznana predloga." };

  const nova = preberiPrilagoditev(vnos);
  const napake = preveriPrilagoditev(p, nova);
  if (napake.length) return { error: napake.join(" ") };
  const shrani: Prilagoditev = stisniPrilagoditev(p, nova);

  const supabase = await createClient();
  const { data: prej } = await supabase.from("template_overrides").select("data").eq("template_id", p.id).maybeSingle();
  const { error } = await supabase.from("template_overrides").upsert({
    template_id: p.id,
    data: shrani as unknown as Json,
    updated_by: staff.id,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Ni uspelo shraniti. Poskusite znova." };

  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: "template.edit",
    entity: "template",
    entity_id: null,
    details: { template_id: p.id, prej: preberiPrilagoditev(prej?.data), potem: shrani } as unknown as Json,
  });
  refresh();
  return { ok: true };
}
