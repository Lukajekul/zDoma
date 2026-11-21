"use server";

import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function claimRehab(id: string) {
  await requireStaff();
  if (typeof id !== "string" || !uuid.test(id)) return "invalid" as const;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_rehab", { p_rehab_id: id });

  if (error) return "error" as const;
  return data ? "claimed" as const : "unavailable" as const;
}
