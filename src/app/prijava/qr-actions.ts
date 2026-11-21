"use server";

import { redirect } from "next/navigation";
import { qrAccessFor, rotateQrToken } from "@/lib/qr/accounts";
import { createClient } from "@/lib/supabase/server";
import type { Uuid } from "@/lib/types";

/**
 * "Nova koda QR": allowed for staff and the patient themselves (not a zadolženec).
 * Every device is signed out and the old QR stops working. When the patient does
 * it, this device logs straight back in with the new code. Both then see the new listek.
 */
export async function newQrCode(patientId: Uuid): Promise<{ error?: string }> {
  const who = await qrAccessFor(patientId);
  if (!who || who.access === "carer") return { error: "Tega ne morete narediti." };

  try {
    const { email, token } = await rotateQrToken(patientId, who.userId);
    if (who.access === "self") {
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({ email, password: token });
    }
  } catch {
    return { error: "Nove kode ni bilo mogoče narediti. Poskusite znova čez minuto." };
  }
  redirect(`/prijava/listek/${patientId}`);
}
