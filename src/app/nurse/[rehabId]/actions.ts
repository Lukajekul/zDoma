"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isAlertOutcome } from "@/components/nurse/alert-outcomes";
import { requireStaff } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

// Replace this bridge with generated types after applying the migration.
type AlertDatabase = Database & {
  public: { Functions: {
    resolve_nurse_alert: { Args: { p_alert_id: string; p_action: string }; Returns: boolean };
  } };
};

export async function resolveAlert(id: string, outcome: unknown) {
  await requireStaff();
  if (typeof id !== "string" || !uuid.test(id) || !isAlertOutcome(outcome)) return "invalid" as const;

  const supabase = (await createClient()) as unknown as SupabaseClient<AlertDatabase>;
  const { data, error } = await supabase.rpc("resolve_nurse_alert", { p_alert_id: id, p_action: outcome });

  if (error) return "error" as const;
  return data ? "saved" as const : "unavailable" as const;
}
