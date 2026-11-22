// Family access (zadolženec, AGENTS.md §6): shared queries and labels.
// Requests go through the `request_family_access` RPC, which never reveals
// whether a davčna številka exists. RLS lets the patient decide or remove.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { AccessStatus } from "@/lib/types";

type Client = SupabaseClient<Database>;

/** One-tap relation chips on the request form. Stored lowercase, shown as "Ana (hčerka)". */
export const RELATIONS = ["hčerka", "sin", "žena", "mož", "vnukinja", "vnuk", "drugo"] as const;

export function isRelation(v: string): v is (typeof RELATIONS)[number] {
  return (RELATIONS as readonly string[]).includes(v);
}

/** "Ana Novak (hčerka)", or just the name when no relation (or "drugo") was given. */
export function personLabel(p: { first_name: string; last_name: string }, relation: string | null): string {
  const name = `${p.first_name} ${p.last_name}`.trim();
  return relation && relation !== "drugo" ? `${name} (${relation})` : name;
}

export interface AccessRow {
  id: string;
  status: AccessStatus;
  relation: string | null;
  created_at: string;
  person: { first_name: string; last_name: string } | null;
}

/** Requests to follow `patientId` (pending + approved), with the requester's name. */
export async function listAccessForPatient(supabase: Client, patientId: string): Promise<AccessRow[]> {
  const { data, error } = await supabase
    .from("family_access")
    .select("id, status, relation, created_at, person:profiles!family_access_requester_id_fkey(first_name, last_name)")
    .eq("patient_id", patientId)
    .neq("status", "rejected")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AccessRow[];
}

/**
 * The carer's own requests. The patient's name is readable only once approved
 * (RLS), so pending ones come back with `person: null`.
 */
export async function listAccessForCarer(supabase: Client, carerId: string): Promise<AccessRow[]> {
  const { data, error } = await supabase
    .from("family_access")
    .select("id, status, relation, created_at, person:profiles!family_access_patient_id_fkey(first_name, last_name)")
    .eq("requester_id", carerId)
    .neq("status", "rejected")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AccessRow[];
}

/** For a banner on the patient's home ("1 prošnja čaka"). */
/** Requests waiting for the patient: family members and a študent pomočnik assigned by staff. */
export async function countPendingRequests(supabase: Client, patientId: string): Promise<number> {
  const [family, student] = await Promise.all([
    supabase.from("family_access").select("id", { count: "exact", head: true }).eq("patient_id", patientId).eq("status", "pending"),
    supabase.from("student_assignments").select("id", { count: "exact", head: true }).eq("patient_id", patientId).eq("status", "pending"),
  ]);
  return (family.count ?? 0) + (student.count ?? 0);
}
