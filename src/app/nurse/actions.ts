"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

// The generated schema is refreshed after the migration is applied.
type ClaimDatabase = Database & {
  public: { Functions: { claim_rehab: { Args: { p_rehab_id: string }; Returns: boolean } } };
};

export async function claimRehab(id: string) {
  await requireStaff();
  if (typeof id !== "string" || !uuid.test(id)) return "invalid" as const;

  const supabase = (await createClient()) as unknown as SupabaseClient<ClaimDatabase>;
  const { data, error } = await supabase.rpc("claim_rehab", { p_rehab_id: id });

  if (error) return "error" as const;
  return data ? "claimed" as const : "unavailable" as const;
}
