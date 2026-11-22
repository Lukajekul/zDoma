import "server-only";

import { getRing } from "@/app/patient/_lib/ring";
import { addDays } from "@/app/patient/_lib/schedule";
import { getAppointments } from "@/lib/appointments-server";
import { getObservations } from "@/lib/observations-server";
import { getApprovedPlan } from "@/lib/plans-server";
import { createClient } from "@/lib/supabase/server";
import { predlogaZaRehab } from "@/lib/templates";
import { laceScore, tedenskiPovzetek } from "@/lib/triage";
import { isRehabActive } from "@/lib/types";
import { getZakaj, type ZakajOpozorilo } from "./zakaj";
import type { CheckinAnswers, Rehabilitacija } from "@/lib/types";

const photoLifetimeSeconds = 300;

export async function getPatientDetail(id: string, today: string) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("rehabilitacije")
    .select("*, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name, phone, obcina, naselje)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row?.patient) return null;

  const { patient, ...rawRehab } = row;
  const rehab = rawRehab as Rehabilitacija;
  const template = predlogaZaRehab(rehab);
  const end = rehab.end_date < today ? rehab.end_date : today;
  const start = addDays(end, -6);
  const [checkins, openAlerts, closedAlerts, photoRows, participation, appointments, observations] = await Promise.all([
    supabase
      .from("checkins")
      .select("checkin_date, answers, triage_status")
      .eq("rehab_id", id)
      .gte("checkin_date", addDays(start, -14))
      .lte("checkin_date", end)
      .order("checkin_date"),
    supabase
      .from("alerts")
      .select("id, status, reason, created_at, checkin_id")
      .eq("rehab_id", id)
      .eq("state", "odprto")
      .order("status", { ascending: false })
      .order("created_at")
      .order("id"),
    supabase
      .from("alerts")
      .select("id, reason, action, resolved_at")
      .eq("rehab_id", id)
      .eq("state", "zaprto")
      .order("resolved_at", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from("checkins")
      .select("checkin_date, photo_path, photo_path_2")
      .eq("rehab_id", id)
      .lte("checkin_date", end)
      .not("photo_path", "is", null)
      .order("checkin_date", { ascending: false })
      .limit(3),
    // With an approved plan the ring counts its items, as the patient sees it (T-84).
    template
      ? getApprovedPlan(id).catch(() => null).then((plan) => getRing(rehab, template, today, plan?.plan))
      : null,
    getAppointments(id).catch(() => null),
    getObservations(rehab).catch(() => null),
  ]);

  if (checkins.error || openAlerts.error || closedAlerts.error) {
    throw new Error("Could not read the episode's checks or alerts");
  }

  // Up to two photos per check-in day (T-72); older rows only have photo_path.
  const photos = (photoRows.data ?? []).reverse().map(({ checkin_date, photo_path, photo_path_2 }) => ({
    date: checkin_date,
    paths: [photo_path, photo_path_2].flatMap((p) => (p ? [p.startsWith(`${id}/`) ? p : null] : [])),
  }));
  const paths = [...new Set(photos.flatMap((day) => day.paths.flatMap((p) => (p ? [p] : []))))];
  const signed = paths.length
    ? await supabase.storage.from("wound-photos").createSignedUrls(paths, photoLifetimeSeconds)
    : null;
  const urls = new Map((signed?.data ?? []).flatMap(({ path, signedUrl }) =>
    path && signedUrl ? [[path, signedUrl] as const] : [],
  ));

  const active = isRehabActive(rehab, today);
  const { zakaj, zamujeno } = await getZakaj({
    rehabId: id,
    startDate: rehab.start_date,
    active,
    today,
    values: rehab.patient_values,
    alerts: openAlerts.data,
  }).catch(() => ({ zakaj: {} as Record<string, ZakajOpozorilo>, zamujeno: null }));

  const series = checkins.data.filter((checkin) => checkin.checkin_date >= start);
  const summary = template ? tedenskiPovzetek({
    predloga: template,
    vrednosti: rehab.patient_values,
    izbranaVprasanja: rehab.questions,
    pregledi: checkins.data.map((row) => ({
      datum: row.checkin_date,
      odgovori: row.answers as CheckinAnswers,
    })),
    doDne: end,
  }).vrstice : [];
  const weights = (template?.vprasanja ?? [])
    .filter((question) => question.tip === "teza" && rehab.questions.includes(question.id))
    .map((question) => series.flatMap((row) => {
      const value = (row.answers as CheckinAnswers)[question.id];
      return typeof value === "number" && Number.isFinite(value)
        ? [{ date: row.checkin_date, value }]
        : [];
    }));

  return {
    patient,
    patientId: rehab.patient_id,
    rehabId: rehab.id,
    active,
    templateName: template?.ime,
    diagnosis: rehab.diagnosis,
    status: openAlerts.data[0]?.status ?? rehab.current_status,
    startDate: rehab.start_date,
    endDate: rehab.end_date,
    openAlerts: openAlerts.data,
    closedAlerts: closedAlerts.data,
    zakaj,
    zamujeno,
    summary,
    lace: rehab.lace ? laceScore(rehab.lace).skupaj : null,
    participation: participation?.ring.answeredShare ?? null,
    trends: {
      start,
      end,
      statuses: series.map((row) => ({ date: row.checkin_date, status: row.triage_status })),
      weights,
    },
    photos: photos.map(({ date, paths }) => ({ date, urls: paths.map((p) => (p ? urls.get(p) ?? null : null)) })),
    photosUnavailable: Boolean(photoRows.error),
    appointments,
    observations,
    today,
  };
}

export type PatientDetail = NonNullable<Awaited<ReturnType<typeof getPatientDetail>>>;
