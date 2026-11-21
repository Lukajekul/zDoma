import "server-only";

import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Profile, type Rehabilitacija } from "@/lib/types";

export type CaredPatient = Pick<Profile, "id" | "first_name" | "last_name">;

/** Patients who approved this zadolženec, with their rehabilitacije split into active and past. */
export async function getCaredPatients(carerId: string) {
  const supabase = await createClient();
  const { data: access, error } = await supabase
    .from("family_access")
    .select("relation, patient:profiles!family_access_patient_id_fkey(id, first_name, last_name)")
    .eq("requester_id", carerId)
    .eq("status", "approved");
  if (error) throw new Error("Seznama ni bilo mogoče naložiti.");

  const patients = (access ?? [])
    .map((a) => ({ relation: a.relation, patient: a.patient as CaredPatient | null }))
    .filter((a): a is { relation: string | null; patient: CaredPatient } => !!a.patient);
  if (!patients.length) return [];

  const { data: rehabs } = await supabase
    .from("rehabilitacije")
    .select("*")
    .in("patient_id", patients.map((p) => p.patient.id))
    .order("start_date", { ascending: false });
  const today = todayLjubljana();
  return patients.map(({ patient, relation }) => {
    const own = ((rehabs ?? []) as Rehabilitacija[]).filter((r) => r.patient_id === patient.id);
    return {
      patient,
      relation,
      active: own.filter((r) => isRehabActive(r, today)),
      past: own.filter((r) => !isRehabActive(r, today)),
    };
  });
}

/** Route params of the helper pages; shared by /carer/<id>/… and /nurse/obisk/<id>/…. */
export type RehabParams = { params: Promise<{ rehabId: string }> };

/** Who does tasks together with the patient: an approved zadolženec, or staff on a home visit (T-57). */
export type Helper = "family" | "staff";

/**
 * The helper's view of one rehabilitacija, or null without access: an approved
 * zadolženec, or a bolničar (a patronažna sestra on a home visit). Every carer
 * page and action calls this. `base` / `home` are where its links lead:
 * "/carer/<id>" and "/carer" for family, "/nurse/obisk/<id>" and "/nurse/<id>" for staff.
 */
export async function getCarerRehab(rehabId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: rehab } = await supabase.from("rehabilitacije").select("*").eq("id", rehabId).maybeSingle();
  const r = rehab as Rehabilitacija | null;
  if (!r || r.patient_id === profile.id) return null;

  const [{ data: access }, { data: patient }] = await Promise.all([
    profile.is_staff
      ? Promise.resolve({ data: null })
      : supabase
          .from("family_access")
          .select("id")
          .eq("requester_id", profile.id)
          .eq("patient_id", r.patient_id)
          .eq("status", "approved")
          .maybeSingle(),
    supabase.from("profiles").select("id, first_name, last_name").eq("id", r.patient_id).maybeSingle(),
  ]);
  if ((!access && !profile.is_staff) || !patient) return null;

  const helper: Helper = profile.is_staff ? "staff" : "family";
  const today = todayLjubljana();
  return {
    profile,
    helper,
    base: helper === "staff" ? `/nurse/obisk/${r.id}` : `/carer/${r.id}`,
    home: helper === "staff" ? `/nurse/${r.id}` : "/carer",
    rehab: r,
    patient: patient as CaredPatient,
    today,
    active: isRehabActive(r, today),
  };
}

export const patientName = (p: CaredPatient) => `${p.first_name} ${p.last_name}`.trim();
