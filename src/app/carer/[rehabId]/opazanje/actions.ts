"use server";

// T-73: a zadolženec reports something they noticed. Severity comes only from the
// chips and their own "Ali vas to skrbi?" answer (oceniOpazanje); the text is stored as-is.
import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { createClient } from "@/lib/supabase/server";
import { NAJVEC_ZNAKOV_OPAZANJA, predlogaZaRehab } from "@/lib/templates";
import { oceniOpazanje } from "@/lib/triage";
import { getCarerRehab } from "../../_lib/access";

export type ObservationResult = { error?: string; alerted?: boolean };

export async function carerAddObservation(
  rehabId: string,
  chips: string[],
  note: string,
  concern: boolean,
): Promise<ObservationResult> {
  const c = await getCarerRehab(rehabId);
  if (!c || c.helper !== "family" || !c.active) return { error: "To okrevanje je zaključeno. Opažanj ne morete več pošiljati." };
  const predloga = predlogaZaRehab(c.rehab);
  if (!predloga) return { error: "Ni uspelo. Poskusite znova." };

  const known = [...new Set(chips)].filter((id) => predloga.opazanja.some((o) => o.id === id));
  const text = note.trim().slice(0, NAJVEC_ZNAKOV_OPAZANJA) || null;
  if (!known.length && !text) return { error: "Izberite vsaj eno opažanje ali ga opišite z besedami." };

  const names = await getMarkerNames(c.patient.id, [{ entered_by: c.profile.id }]);
  const ocena = oceniOpazanje(predloga, known, concern, names[c.profile.id] ?? c.profile.first_name);

  const supabase = await createClient();
  const { error } = await supabase.from("carer_observations").insert({
    rehab_id: c.rehab.id,
    chips: known,
    note: text,
    concern,
    status: ocena.status,
    reasons: ocena.razlogi,
  });
  if (error) return { error: "Ni uspelo. Preverite internetno povezavo in poskusite znova." };

  if (ocena.status !== "zeleno" && ocena.razlogi.length) {
    // The observation is already saved; a failed alert still shows up as unread after 24 h.
    await supabase.from("alerts").insert(
      ocena.razlogi.map((reason) => ({ rehab_id: c.rehab.id, status: ocena.status, reason, source: "drugo" as const })),
    );
  }
  return { alerted: ocena.status !== "zeleno" };
}
