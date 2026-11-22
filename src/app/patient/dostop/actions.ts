"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PAGE = "/patient/dostop";

/** Patient answers a request: "Dovoli" or "Zavrni". RLS allows it only on requests to this patient. */
export async function decideAccess(formData: FormData): Promise<never> {
  const profile = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approved";

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_access")
    .update({ status: approve ? "approved" : "rejected", decided_at: new Date().toISOString() })
    .eq("id", id)
    .eq("patient_id", profile.id)
    .eq("status", "pending");
  redirect(`${PAGE}?ok=${error ? "napaka" : approve ? "dovoljeno" : "zavrnjeno"}`);
}

/** Patient removes someone's access (or withdraws a pending request). */
export async function removeAccess(formData: FormData): Promise<never> {
  const profile = await requireProfile();
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.from("family_access").delete().eq("id", id).eq("patient_id", profile.id);
  redirect(`${PAGE}?ok=${error ? "napaka" : "odstranjeno"}`);
}

/** Patient answers a študent pomočnik assigned by staff: "Dovoli" or "Zavrni". Only staff remove one later. */
export async function decideStudent(formData: FormData): Promise<never> {
  const profile = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approved";

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_assignments")
    .update({ status: approve ? "approved" : "rejected", decided_at: new Date().toISOString() })
    .eq("id", id)
    .eq("patient_id", profile.id)
    .eq("status", "pending");
  if (!error) {
    await supabase.from("audit_log").insert({
      actor_id: profile.id,
      action: approve ? "student_potrjen" : "student_zavrnjen",
      entity: "student_assignments",
      entity_id: id,
      details: {},
    });
  }
  redirect(`${PAGE}?ok=${error ? "napaka" : approve ? "student_dovoljen" : "zavrnjeno"}`);
}
