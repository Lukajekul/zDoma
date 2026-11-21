// Shared domain types: the source of truth for the data model (AGENTS.md §8).
// Row types mirror the tables in supabase/migrations/ (snake_case, as the
// Supabase client returns them). Shared file: change it on a branch.

// ---------- Ids and enums ----------

export type Uuid = string;
/** ISO date in Europe/Ljubljana, e.g. "2026-11-21". */
export type IsoDate = string;
/** ISO timestamp with zone, as Postgres returns it. */
export type IsoDateTime = string;

/** Relation of a person to a patient (AGENTS.md §6). Not stored as an account type. */
export type UserRole = "odpuscenec" | "zadolzenec" | "bolnicar";

export const TEMPLATE_IDS = [
  "srcno-popuscanje",
  "srce-po-infarktu",
  "kolk-koleno",
  "kopb",
  "mozganska-kap",
  "rak-sistemsko",
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type RehabStatus = "aktivna" | "zakljucena";
/** Triage status. UI always shows it with a word (AGENTS.md §7). */
export type TriageStatus = "zeleno" | "rumeno" | "rdece";
export type AccessStatus = "pending" | "approved" | "rejected";
export type DoseStatus = "vzeto" | "izpusceno";
export type TimeOfDay = "zjutraj" | "opoldne" | "zvecer" | "ponoci";
/** Compared with the medicines before admission (T-35). */
export type MedicationChange = "novo" | "spremenjeno" | "nespremenjeno" | "ukinjeno";
export type AlertState = "odprto" | "zaprto";
export type AlertSource = "checkin" | "zdravila" | "brez_pregleda" | "drugo";

// ---------- Tables ----------

/** One per auth user. id = auth.users.id. Login email is `<davcna>@zdoma.local`, never shown. */
export interface Profile {
  id: Uuid;
  davcna: string;
  first_name: string;
  last_name: string;
  /** Bolničar. Set only by seed/admin (service role), never by the client. */
  is_staff: boolean;
  address: string | null;
  obcina: string | null;
  naselje: string | null;
  phone: string | null;
  /** Staff photo shown to patients (T-34). */
  photo_url: string | null;
  /** Daily check-in reminder time, "08:00", Europe/Ljubljana (T-39). */
  checkin_time: string;
  created_at: IsoDateTime;
}

/** Patient's own values used in question text, e.g. { suhaTeza: 72, ciljniTlak: "130/80" }. */
export type PatientValues = Record<string, number | string>;

/** LACE inputs, filled by the bolničar at discharge (T-04 computes the score). */
export interface LaceInput {
  /** Length of stay in days. */
  l: number;
  /** Acute (emergency) admission. */
  a: boolean;
  /** Charlson comorbidity index. */
  c: number;
  /** ED visits in the last 6 months. */
  e: number;
}

/** One recovery episode (AGENTS.md §6 "Rehabilitacije"). */
export interface Rehabilitacija {
  id: Uuid;
  patient_id: Uuid;
  template_id: TemplateId;
  /** Plain-language diagnosis shown to the patient. */
  diagnosis: string | null;
  status: RehabStatus;
  start_date: IsoDate;
  end_date: IsoDate;
  created_by: Uuid | null;
  /** Patronažna sestra; null = "Nedodeljeni". */
  assigned_nurse_id: Uuid | null;
  /** Ids of the template's check-in questions chosen for this patient. */
  questions: string[];
  patient_values: PatientValues;
  lace: LaceInput | null;
  /** Latest triage status, for sorting the dashboard. */
  current_status: TriageStatus;
  /** "Nameščeno ✓" at the first home visit (T-36); null = not yet. */
  installed_at: IsoDateTime | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

/** Area a patronažna sestra covers. A nurse with ≥1 teren is a patronažna sestra. */
export interface Teren {
  id: Uuid;
  nurse_id: Uuid;
  obcina: string;
  /** Optional narrowing within the občina; null = whole občina. */
  naselja: string[] | null;
  postcodes: string[] | null;
}

/** Nurse's patients handed to a colleague until a date (T-36). */
export interface Nadomescanje {
  id: Uuid;
  nurse_id: Uuid;
  substitute_id: Uuid;
  until_date: IsoDate;
  created_by: Uuid | null;
  created_at: IsoDateTime;
}

/** Zadolženec access request. Covers all of the patient's rehabilitacije. */
export interface FamilyAccess {
  id: Uuid;
  requester_id: Uuid;
  patient_id: Uuid;
  status: AccessStatus;
  /** Shown as "Ana (hčerka)". */
  relation: string | null;
  created_at: IsoDateTime;
  decided_at: IsoDateTime | null;
}

export interface Medication {
  id: Uuid;
  rehab_id: Uuid;
  name: string;
  active_substance: string | null;
  /** e.g. "40 mg" */
  dose: string;
  times: TimeOfDay[];
  /** Plain-language "what it's for", e.g. "odvaja odvečno vodo". */
  purpose: string | null;
  change: MedicationChange;
  /** Dose before admission, for "Spremenjeno" (old → new). */
  previous_dose: string | null;
  photo_url: string | null;
  start_date: IsoDate;
  end_date: IsoDate | null;
  /** Pharmacy pick-up date from eRecept (mock, T-31); null = "ni prevzeto". */
  picked_up_at: IsoDate | null;
  /** Pills in the pack picked up, for days left (T-32). */
  pickup_pack_size: number | null;
  created_at: IsoDateTime;
}

export interface DoseLog {
  id: Uuid;
  medication_id: Uuid;
  rehab_id: Uuid;
  scheduled_date: IsoDate;
  time_of_day: TimeOfDay;
  status: DoseStatus;
  /** Who tapped it: the patient or a zadolženec. */
  entered_by: Uuid;
  created_at: IsoDateTime;
}

/** Answer to one question: a button value, or a number (weight). */
export type CheckinAnswer = string | number | boolean;
export type CheckinAnswers = Record<string, CheckinAnswer>;

/** One per rehabilitacija per day. */
export interface Checkin {
  id: Uuid;
  rehab_id: Uuid;
  checkin_date: IsoDate;
  /** questionId → answer */
  answers: CheckinAnswers;
  /** Filled with "Enako kot včeraj". */
  same_as_yesterday: boolean;
  triage_status: TriageStatus;
  /** Slovenian reasons from triage, e.g. "Teža +2,5 kg v 3 dneh". */
  reasons: string[];
  /** Storage path in bucket `wound-photos`: `<rehab_id>/<file>`. */
  photo_path: string | null;
  entered_by: Uuid;
  created_at: IsoDateTime;
}

export interface RehabExercise {
  id: Uuid;
  rehab_id: Uuid;
  /** Id of the exercise in the template. */
  exercise_id: string;
  title: string;
  /** e.g. "10-krat" or "15 minut" */
  repetitions: string | null;
  times_per_day: number;
  active: boolean;
  created_at: IsoDateTime;
}

export interface RehabLog {
  id: Uuid;
  rehab_exercise_id: Uuid;
  rehab_id: Uuid;
  log_date: IsoDate;
  done: boolean;
  /** 0–10 */
  pain: number | null;
  entered_by: Uuid;
  created_at: IsoDateTime;
}

export interface Alert {
  id: Uuid;
  rehab_id: Uuid;
  checkin_id: Uuid | null;
  /** Set for alerts about one medicine (not picked up, T-31). */
  medication_id: Uuid | null;
  status: Exclude<TriageStatus, "zeleno">;
  /** Nurse-readable Slovenian reason, always present. */
  reason: string;
  source: AlertSource;
  state: AlertState;
  /** One-tap action taken, e.g. "Poklicano – vse v redu". */
  action: string | null;
  resolved_by: Uuid | null;
  resolved_at: IsoDateTime | null;
  created_at: IsoDateTime;
}

export interface AuditLogEntry {
  id: number;
  actor_id: Uuid | null;
  /** e.g. "rehab.extend", "qr.rotate", "nurse.substitute" */
  action: string;
  entity: string;
  entity_id: Uuid | null;
  details: Record<string, unknown>;
  created_at: IsoDateTime;
}

/** View `staff_directory`: what any logged-in user may see about staff. */
export interface StaffPublic {
  id: Uuid;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

// ---------- Helpers ----------

/** Internal Supabase Auth email for a davčna številka. Never show it to users. */
export function davcnaEmail(davcna: string): string {
  return `${davcna}@zdoma.local`;
}

/** Today's date in Europe/Ljubljana as "YYYY-MM-DD". */
export function todayLjubljana(now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * A rehabilitacija accepts check-ins and alerts only while it's aktivna and
 * its end date hasn't passed (the stored status may lag behind the date).
 */
export function isRehabActive(
  rehab: Pick<Rehabilitacija, "status" | "end_date">,
  today: IsoDate = todayLjubljana(),
): boolean {
  return rehab.status === "aktivna" && today <= rehab.end_date;
}
