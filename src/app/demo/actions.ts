"use server";

import { redirect } from "next/navigation";
import { createDemoPatient } from "@/lib/demo/create";
import { createClient } from "@/lib/supabase/server";

export type DemoState = { error?: string };

/** "Začni kot pacient": new demo patient, logged in like a QR scan, then the check-in. */
export async function startDemo(): Promise<DemoState> {
  let rehabId: string;
  try {
    const demo = await createDemoPatient();
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" }); // leave any previous account on this device
    const { error } = await supabase.auth.signInWithPassword({ email: demo.email, password: demo.token });
    if (error) throw error;
    rehabId = demo.rehabId;
  } catch {
    return { error: "Demo trenutno ni na voljo. Poskusite znova čez minuto." };
  }
  redirect(`/patient/${rehabId}/pregled`); // T-61: straight into the check-in
}
