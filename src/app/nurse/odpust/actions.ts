"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { isValidDavcna, normalizeDavcna } from "@/lib/davcna";
import { erecept, type ZdraviloPrej } from "@/lib/erecept";
import { ensurePatientAccount } from "@/lib/qr/accounts";
import { createClient } from "@/lib/supabase/server";
import { getPredloga } from "@/lib/templates";
import { TIME_ORDER } from "@/app/patient/_lib/schedule";
import type { PatientValues } from "@/lib/types";
import { dailyCount, medicineChange, type MedLine } from "./_lib/plan";

export type PreviousMed = ZdraviloPrej;

export type PatientLookup =
  | { error: string }
  | {
      exists: boolean;
      firstName: string;
      lastName: string;
      address: string;
      obcina: string;
      naselje: string;
      hasActiveRehab: boolean;
      previous: PreviousMed[];
    };

/** Step 1: is this davčna številka already a patient? Returns what they already take. */
export async function lookupPatient(davcnaInput: string): Promise<PatientLookup> {
  await requireStaff();
  const davcna = normalizeDavcna(davcnaInput);
  if (!isValidDavcna(davcna)) return { error: "Davčna številka ni pravilna. Preverite 8 številk." };

  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, address, obcina, naselje")
    .eq("davcna", davcna)
    .maybeSingle();
  if (!p) return { exists: false, firstName: "", lastName: "", address: "", obcina: "", naselje: "", hasActiveRehab: false, previous: [] };

  const { data: rehabs } = await supabase.from("rehabilitacije").select("status").eq("patient_id", p.id);
  // "Already takes" = eRecept history before this admission (mock, T-35).
  const previous = await erecept.zdravilaPredSprejemom(p.id);

  return {
    exists: true,
    firstName: p.first_name,
    lastName: p.last_name,
    address: p.address ?? "",
    obcina: p.obcina ?? "",
    naselje: p.naselje ?? "",
    hasActiveRehab: !!rehabs?.some((r) => r.status === "aktivna"),
    previous,
  };
}

export type OpenRehabInput = {
  davcna: string;
  firstName: string;
  lastName: string;
  address: string;
  obcina: string;
  naselje: string;
  templateId: string;
  values: Record<string, string>;
  questions: string[];
  meds: Pick<MedLine, "name" | "activeSubstance" | "purpose" | "dose" | "times" | "selected" | "previousDose" | "asNeeded">[];
  exercises: { id: string; title: string; repetitions: string }[];
  startDate: string;
  endDate: string;
  nurseId: string | null;
};

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** Last step: account (if new), rehabilitacija, medicines, exercises, audit log. Redirects to the done page. */
export async function openRehab(input: OpenRehabInput): Promise<{ error: string }> {
  const staff = await requireStaff();
  const predloga = getPredloga(input.templateId);
  const davcna = normalizeDavcna(input.davcna);
  if (!predloga) return { error: "Izberite skupino pacientov." };
  if (!isValidDavcna(davcna)) return { error: "Davčna številka ni pravilna." };
  if (!input.firstName.trim() || !input.lastName.trim()) return { error: "Vpišite ime in priimek pacienta." };
  if (!isDate(input.startDate) || !isDate(input.endDate) || input.endDate < input.startDate) {
    return { error: "Preverite datum konca: biti mora po začetku." };
  }
  const questions = input.questions.filter((id) => predloga.vprasanja.some((q) => q.id === id));
  if (!questions.length) return { error: "Izberite vsaj eno vprašanje za dnevni pregled." };
  if (dailyCount(predloga, questions) > 6) return { error: "Največ 6 dnevnih vprašanj." };

  const values: PatientValues = {};
  for (const v of predloga.vrednostiPacienta) {
    const raw = (input.values[v.kljuc] ?? "").trim();
    if (!raw) return { error: `Vpišite: ${v.oznaka}.` };
    if (v.tip === "stevilo") {
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n) || n <= 0) return { error: `${v.oznaka}: vpišite število.` };
      values[v.kljuc] = n;
    } else values[v.kljuc] = raw;
  }
  for (const m of input.meds) {
    if (!m.selected) continue;
    if (!m.dose.trim()) return { error: `${m.name}: izberite odmerek.` };
    if ((!m.times.length && !m.asNeeded) || m.times.some((t) => !TIME_ORDER.includes(t))) return { error: `${m.name}: izberite čas jemanja.` };
  }

  const { patientId, created } = await ensurePatientAccount({ davcna, firstName: input.firstName, lastName: input.lastName });
  const supabase = await createClient();
  if (input.obcina.trim()) {
    await supabase
      .from("profiles")
      .update({ address: input.address.trim() || null, obcina: input.obcina.trim(), naselje: input.naselje.trim() || null })
      .eq("id", patientId);
  }

  const { data: rehab, error } = await supabase
    .from("rehabilitacije")
    .insert({
      patient_id: patientId,
      template_id: predloga.id,
      status: "aktivna",
      start_date: input.startDate,
      end_date: input.endDate,
      created_by: staff.id,
      assigned_nurse_id: input.nurseId,
      questions,
      patient_values: values,
    })
    .select("id")
    .single();
  if (error || !rehab) return { error: "Rehabilitacije ni bilo mogoče shraniti. Poskusite znova." };

  const medRows = input.meds.flatMap((m) => {
    const change = medicineChange(m);
    if (!change) return [];
    return [{
      rehab_id: rehab.id,
      name: m.name,
      active_substance: m.activeSubstance,
      dose: change === "ukinjeno" ? (m.previousDose ?? m.dose) : m.dose.trim(),
      times: m.times,
      purpose: m.purpose,
      change,
      previous_dose: change === "spremenjeno" ? m.previousDose : null,
      start_date: input.startDate,
    }];
  });
  const exRows = input.exercises.map((e) => ({
    rehab_id: rehab.id,
    exercise_id: e.id,
    title: e.title,
    repetitions: e.repetitions || null,
    times_per_day: 1,
    active: true,
  }));
  const [m, x] = await Promise.all([
    medRows.length ? supabase.from("medications").insert(medRows) : { error: null },
    exRows.length ? supabase.from("rehab_exercises").insert(exRows) : { error: null },
  ]);
  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: "odpri_rehabilitacijo",
    entity: "rehabilitacije",
    entity_id: rehab.id,
    details: { template: predloga.id, novRacun: created, sestra: input.nurseId, zdravila: medRows.length, vaje: exRows.length },
  });
  // Always land on the result page, so a retry can't open a second rehabilitacija.
  const q = new URLSearchParams();
  if (created) q.set("nov", "1");
  if (m.error || x.error) q.set("napaka", "1");
  redirect(`/nurse/odpust/${rehab.id}${q.size ? `?${q}` : ""}`);
}
