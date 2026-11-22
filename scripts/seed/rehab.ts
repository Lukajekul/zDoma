// Builds all rows for one rehabilitacija (no I/O). Ids are generated here so
// related rows can be inserted in bulk afterwards.
import { randomUUID } from "node:crypto";
import type { CasDneva, Predloga } from "@/lib/templates";
import { prevzemRazlog } from "@/lib/triage";
import type { CheckinAnswers, IsoDate, PatientValues, TimeOfDay, TriageStatus } from "@/lib/types";
import { DIAGNOZA, type rng } from "./data";
import { addDays, patientValues, planCheckins } from "./generate";

type Rng = ReturnType<typeof rng>;
type Row = Record<string, unknown>;

export interface Rows {
  rehabilitacije: Row[];
  medications: Row[];
  rehab_exercises: Row[];
  checkins: Row[];
  alerts: Row[];
  dose_logs: Row[];
  rehab_logs: Row[];
}

export const emptyRows = (): Rows => ({
  rehabilitacije: [], medications: [], rehab_exercises: [], checkins: [], alerts: [], dose_logs: [], rehab_logs: [],
});

const CAS: Record<CasDneva, TimeOfDay> = { zjutraj: "zjutraj", opoldne: "opoldne", zvecer: "zvecer", ponoci: "ponoci" };

export interface RehabSpec {
  predloga: Predloga;
  patientId: string;
  createdBy: string;
  nurseId: string | null;
  start: IsoDate;
  today: IsoDate;
  profil: TriageStatus;
  r: Rng;
  /** Finished rehab (start far enough back that the default length ends before today). */
  zakljucena?: boolean;
  values?: PatientValues;
  fixed?: Record<IsoDate, CheckinAnswers>;
  /** No check-in on the last seeded day (yesterday). */
  skipToday?: boolean;
  /** Leave the first "novo" medicine not picked up (T-31). */
  notPickedUp?: boolean;
  /** Who else marks some pills (a zadolženec). */
  helperId?: string;
  installed?: boolean;
}

export function buildRehab(s: RehabSpec, rows: Rows): { id: string; status: TriageStatus } {
  const { predloga: p, r } = s;
  const id = randomUUID();
  const end = addDays(s.start, p.privzetoTrajanjeDni);
  // Active rehabs end at yesterday: today's dnevni pregled stays open for the live demo (T-90).
  const last = s.zakljucena ? end : addDays(s.today, -1);
  const questions = p.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id).slice(0, 6);
  const values = patientValues(p, r, s.values);

  // Medicines: 2–4 from the template, first one new, the rest unchanged or changed.
  const meds = p.zdravila.slice(0, r.int(Math.min(2, p.zdravila.length), Math.min(4, p.zdravila.length)));
  const medRows = meds.map((z, k) => {
    const change = k === 0 ? "novo" : r.pick(["nespremenjeno", "nespremenjeno", "spremenjeno"] as const);
    const notPicked = s.notPickedUp && k === 0;
    return {
      id: randomUUID(),
      rehab_id: id,
      name: z.ime,
      active_substance: z.ucinkovina,
      dose: z.odmerki[0],
      times: [...new Set(z.casi.map((c) => CAS[c]))],
      purpose: z.zaKaj,
      change,
      previous_dose: change === "spremenjeno" ? (z.odmerki[1] ?? null) : null,
      start_date: s.start,
      picked_up_at: notPicked ? null : addDays(s.start, r.int(0, 1)),
      pickup_pack_size: notPicked ? null : r.pick([28, 30, 50, 100]),
    };
  });
  rows.medications.push(...medRows);

  const exRows = p.vaje.slice(0, 3).map((v) => ({
    id: randomUUID(), rehab_id: id, exercise_id: v.id, title: v.naslov, repetitions: v.ponovitve, times_per_day: 1,
  }));
  rows.rehab_exercises.push(...exRows);

  const plan = planCheckins({
    predloga: p, questions, values, start: s.start, last, profil: s.zakljucena ? "zeleno" : s.profil,
    skipLast: !!s.skipToday, r, fixed: s.fixed,
  });
  for (const c of plan) {
    const checkinId = randomUUID();
    rows.checkins.push({
      id: checkinId, rehab_id: id, checkin_date: c.date, answers: c.answers, triage_status: c.status,
      reasons: c.reasons, entered_by: s.patientId, created_at: `${c.date}T07:${String(r.int(5, 55)).padStart(2, "0")}:00+01:00`,
    });
    if (c.status === "zeleno") continue;
    const open = !s.zakljucena && c.date >= addDays(s.today, -1);
    for (const reason of c.reasons) {
      rows.alerts.push({
        rehab_id: id, checkin_id: checkinId, medication_id: null, status: c.status, reason, source: "checkin",
        state: open ? "odprto" : "zaprto",
        action: open ? null : "Poklicano – vse v redu",
        resolved_by: open ? null : (s.nurseId ?? s.createdBy),
        resolved_at: open ? null : `${addDays(c.date, 1)}T10:00:00+01:00`,
        created_at: `${c.date}T08:00:00+01:00`,
      });
    }
  }

  // Not picked up (T-31): the staff alert syncPickupAlerts() would raise.
  const dni = Math.round((Date.parse(s.today) - Date.parse(s.start)) / 864e5);
  for (const m of medRows.filter((m) => !m.picked_up_at && dni >= 3)) {
    rows.alerts.push({
      rehab_id: id, checkin_id: null, medication_id: m.id, status: "rumeno", source: "zdravila", reason: prevzemRazlog({ ime: m.name, dni }),
      state: "odprto", action: null, resolved_by: null, resolved_at: null, created_at: `${s.today}T08:00:00+01:00`,
    });
  }

  // Pills and exercises for the last 3 days (only for an active rehab).
  if (!s.zakljucena) {
    for (let d = -3; d <= -1; d++) {
      const date = addDays(s.today, d);
      if (date < s.start) continue;
      for (const m of medRows) {
        for (const t of m.times) {
          rows.dose_logs.push({
            medication_id: m.id, rehab_id: id, scheduled_date: date, time_of_day: t,
            status: r.chance(0.06) ? "izpusceno" : "vzeto",
            entered_by: s.helperId && t === "zvecer" ? s.helperId : s.patientId,
          });
        }
      }
      for (const x of exRows) {
        rows.rehab_logs.push({
          rehab_exercise_id: x.id, rehab_id: id, log_date: date, done: r.chance(0.8), pain: r.int(0, 4), entered_by: s.patientId,
        });
      }
    }
  }

  const status = plan.at(-1)?.status ?? "zeleno";
  rows.rehabilitacije.push({
    id, patient_id: s.patientId, template_id: p.id, diagnosis: DIAGNOZA[p.id],
    status: s.zakljucena ? "zakljucena" : "aktivna", start_date: s.start, end_date: end,
    created_by: s.createdBy, assigned_nurse_id: s.nurseId, questions, patient_values: values,
    lace: { l: r.int(2, 12), a: r.chance(0.8), c: r.int(0, 4), e: r.int(0, 3) },
    current_status: status,
    installed_at: s.installed === false ? null : `${addDays(s.start, 1)}T11:00:00+01:00`,
  });
  return { id, status };
}
