"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { OdobritevVnos } from "../../_lib/dejstva";
import { shraniNacrt } from "../../_lib/nacrt-server";

/** Approve (or re-approve as a new version) the modular plan of an active rehabilitacija (T-79). */
export async function approvePlan(rehabId: string, input: OdobritevVnos): Promise<{ error: string }> {
  const staff = await requireStaff();
  const { data: r } = await (await createClient())
    .from("rehabilitacije")
    .select("status, start_date")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r) return { error: "Rehabilitacije ni mogoče najti." };
  if (r.status !== "aktivna") return { error: "Rehabilitacija ni aktivna. Načrt lahko spremenite samo med okrevanjem." };
  // Recovery day 0 is the start of the rehabilitacija.
  const res = await shraniNacrt(rehabId, { ...input, dejstva: { ...input.dejstva, odpust: r.start_date } }, staff);
  if ("error" in res) return res;
  redirect(`/nurse/odpust/${rehabId}?nacrt=${res.version}`);
}
