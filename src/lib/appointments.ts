// T-64: kontrolni pregled. Optional: most rehabilitacije have none, and then nothing is shown.
import { formatDate, formatLongDate } from "@/lib/format";
import type { Database } from "@/lib/database.types";

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentStatus = "nacrtovano" | "opravljeno" | "preklicano";

export const APPOINTMENT_COLUMNS = "id, rehab_id, appt_date, appt_time, place, doctor, note, status, created_by, created_at, updated_at";

/** The next planned appointment from today on, or null. */
export function nextAppointment<T extends Pick<Appointment, "appt_date" | "appt_time" | "status">>(rows: T[], today: string): T | null {
  return rows
    .filter((a) => a.status === "nacrtovano" && a.appt_date >= today)
    .sort((a, b) => a.appt_date.localeCompare(b.appt_date) || a.appt_time.localeCompare(b.appt_time))[0] ?? null;
}

/** "9:30" from "09:30:00". */
export const formatApptTime = (t: string) => {
  const [h, m = "00"] = t.split(":");
  return `${Number(h)}:${m}`;
};

/** "torek, 3. december 2026 ob 9:30" — weekday in words for elderly readers. */
export function formatAppointmentWhen(a: Pick<Appointment, "appt_date" | "appt_time">) {
  const year = a.appt_date.slice(0, 4);
  return `${formatLongDate(`${a.appt_date}T12:00:00Z`)} ${year} ob ${formatApptTime(a.appt_time)}`;
}

/** "Danes", "Jutri", "Čez 5 dni" or the plain date for later ones. */
export function appointmentRelative(date: string, today: string) {
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (days < 0) return formatDate(`${date}T12:00:00Z`);
  if (days === 0) return "Danes";
  if (days === 1) return "Jutri";
  if (days === 2) return "Pojutrišnjem";
  return `Čez ${days} dni`;
}
