"use server";

import { isAlertOutcome } from "@/components/nurse/alert-outcomes";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function resolveAlert(id: string, outcome: unknown) {
  await requireStaff();
  if (typeof id !== "string" || !uuid.test(id) || !isAlertOutcome(outcome)) return "invalid" as const;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_nurse_alert", { p_alert_id: id, p_action: outcome });

  if (error) return "error" as const;
  return data ? "saved" as const : "unavailable" as const;
}
