import "server-only";

import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_COLUMNS, type Appointment, nextAppointment } from "./appointments";

/** The next planned kontrola of one rehabilitacija (RLS decides who may read it). */
export async function getNextAppointment(rehabId: string, today: string): Promise<Appointment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("rehab_id", rehabId)
    .eq("status", "nacrtovano")
    .gte("appt_date", today)
    .order("appt_date")
    .order("appt_time")
    .limit(1);
  return data?.[0] ?? null;
}

/** Next planned kontrola per rehabilitacija, for lists ("Danes obiščite"). */
export async function getNextAppointments(rehabIds: string[], today: string) {
  const map = new Map<string, Appointment>();
  if (!rehabIds.length) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .in("rehab_id", rehabIds)
    .eq("status", "nacrtovano")
    .gte("appt_date", today);
  for (const id of rehabIds) {
    const next = nextAppointment((data ?? []).filter((a) => a.rehab_id === id), today);
    if (next) map.set(id, next);
  }
  return map;
}

/** All kontrole of one rehabilitacija for staff, latest first. */
export async function getAppointments(rehabId: string): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("rehab_id", rehabId)
    .order("appt_date", { ascending: false })
    .order("appt_time", { ascending: false });
  if (error) throw new Error("Could not read appointments");
  return data;
}
