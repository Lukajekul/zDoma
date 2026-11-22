import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";
import type { DejstvaPacienta, Nacrt } from "@/lib/moduli";
import { createClient } from "@/lib/supabase/server";
import type { PatientPlan } from "@/lib/types";

// Load/save for composed plans (T-78): patient_facts and patient_plans.
// RLS decides who may do what: anyone who can read the rehabilitacija reads,
// only staff write.

type Pub = Database["public"];
type Tabela<R, I> = { Row: R; Insert: I; Update: Partial<I>; Relationships: [] };
type FactsRow = { rehab_id: string; discharge_date: string; icd10: string[]; procedures: string[]; medicines: Json; entered_by: string; created_at: string; updated_at: string };
type PlanRow = { id: string; rehab_id: string; version: number; bank_version: number; plan: Json; approved_by: string; approved_at: string };
type FactsInsert = Pick<FactsRow, "rehab_id" | "discharge_date" | "icd10" | "procedures" | "medicines"> & Partial<FactsRow>;
type PlanInsert = Pick<PlanRow, "rehab_id" | "version" | "bank_version" | "plan"> & Partial<PlanRow>;

/**
 * Database with the T-78 tables and checkins.plan_version, until the migration is
 * applied and database.types.ts regenerated. Then drop this and the cast in `db()`.
 */
export type PlanDatabase = Omit<Database, "public"> & {
  public: Omit<Pub, "Tables"> & {
    Tables: Omit<Pub["Tables"], "checkins"> & {
      checkins: {
        Row: Pub["Tables"]["checkins"]["Row"] & { plan_version: number | null };
        Insert: Pub["Tables"]["checkins"]["Insert"] & { plan_version?: number | null };
        Update: Pub["Tables"]["checkins"]["Update"] & { plan_version?: number | null };
        Relationships: Pub["Tables"]["checkins"]["Relationships"];
      };
      patient_facts: Tabela<FactsRow, FactsInsert>;
      patient_plans: Tabela<PlanRow, PlanInsert>;
    };
  };
};

/** The logged-in user's client, typed with the T-78 tables. */
export async function db(): Promise<SupabaseClient<PlanDatabase>> {
  return (await createClient()) as unknown as SupabaseClient<PlanDatabase>;
}

/** Discharge facts of one rehabilitacija, or null when none were entered. */
export async function getPatientFacts(rehabId: string): Promise<DejstvaPacienta | null> {
  const { data, error } = await (await db())
    .from("patient_facts")
    .select("discharge_date, icd10, procedures, medicines")
    .eq("rehab_id", rehabId)
    .maybeSingle();
  if (error) throw new Error("Could not read patient facts");
  if (!data) return null;
  return {
    odpust: data.discharge_date,
    mkb10: data.icd10,
    posegi: data.procedures,
    zdravila: data.medicines as DejstvaPacienta["zdravila"],
  };
}

/** Insert or replace the discharge facts (staff only, RLS). */
export async function savePatientFacts(rehabId: string, d: DejstvaPacienta): Promise<void> {
  const { error } = await (await db()).from("patient_facts").upsert({
    rehab_id: rehabId,
    discharge_date: d.odpust,
    icd10: d.mkb10,
    procedures: d.posegi,
    medicines: d.zdravila as Json,
  });
  if (error) throw new Error("Could not save patient facts");
}

/** The current approved plan (highest version), or null when the rehabilitacija has none. */
export async function getApprovedPlan(rehabId: string): Promise<PatientPlan | null> {
  const { data, error } = await (await db())
    .from("patient_plans")
    .select("*")
    .eq("rehab_id", rehabId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not read the plan");
  return data ? { ...data, plan: data.plan as unknown as Nacrt } : null;
}

/**
 * Store an approved plan (from `odobriNacrt`) as the next version and write the
 * audit log. Staff only (RLS). Returns the new version number.
 */
export async function saveApprovedPlan(rehabId: string, nacrt: Nacrt, staffId: string): Promise<number> {
  if (nacrt.status !== "odobren") throw new Error("Only an approved plan can be saved");
  const supabase = await db();
  const current = await getApprovedPlan(rehabId);
  const version = (current?.version ?? 0) + 1;
  const { error } = await supabase.from("patient_plans").insert({
    rehab_id: rehabId,
    version,
    bank_version: nacrt.verzija,
    plan: nacrt as unknown as Json,
    approved_by: staffId,
  });
  if (error) throw new Error("Could not save the plan");
  await supabase.from("audit_log").insert({
    actor_id: staffId,
    action: "nacrt_odobren",
    entity: "rehabilitacije",
    entity_id: rehabId,
    details: { verzija: version, moduli: nacrt.moduli, odstranjeno: nacrt.odstranjeno },
  });
  return version;
}
