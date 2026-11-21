import "server-only";

// T-11: a fresh heart-failure patient for a judge, created on demand.
import { randomBytes, randomInt } from "node:crypto";
import { normalAnswer } from "@/lib/demo/answers";
import { davcnaCheckDigit } from "@/lib/davcna";
import { createAdminClient } from "@/lib/supabase/admin";
import { predloge } from "@/lib/templates";
import { oceniPregled, type DanOdgovori } from "@/lib/triage";
import { davcnaEmail, todayLjubljana, type CheckinAnswers, type IsoDate } from "@/lib/types";

const OBCINA = "Šentjur";
const SUHA_TEZA = 72;
const IMENA = ["Marta", "Franc", "Jožica", "Stane", "Milka", "Tone", "Anica", "Ivan"];
const PRIIMKI = ["Kranjc", "Pušnik", "Lešnik", "Gračner", "Jager", "Zorko"];
/** Demo accounts older than this are removed on the next start. */
const KEEP_HOURS = 24;
/** Simple guard: the page is public. */
const MAX_PER_HOUR = 60;

function addDays(date: IsoDate, n: number): IsoDate {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Random valid davčna številka in the reserved demo range 98xxxxxx (made up). */
function demoDavcna(): string {
  for (;;) {
    const first7 = `98${String(randomInt(0, 100000)).padStart(5, "0")}`;
    const c = davcnaCheckDigit(first7);
    if (c !== null) return `${first7}${c}`;
  }
}

type Admin = ReturnType<typeof createAdminClient>;

async function cleanupOldDemos(admin: Admin): Promise<number> {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const cutoff = Date.now() - KEEP_HOURS * 3600_000;
  const users = data?.users ?? [];
  const old = users.filter((u) => u.user_metadata?.demo === true && Date.parse(u.created_at) < cutoff);
  for (const u of old) {
    await admin.from("rehabilitacije").delete().eq("patient_id", u.id); // logs go with it (T-47)
    await admin.auth.admin.deleteUser(u.id);
  }
  return users.filter((u) => u.user_metadata?.demo === true && Date.parse(u.created_at) > Date.now() - 3600_000).length;
}

/**
 * Creates a demo patient (QR-token account, like a real discharge) with an
 * active heart-failure rehabilitacija started 2 days ago: two green check-ins,
 * medicines picked up, yesterday's pills taken. Today is still to do.
 */
export async function createDemoPatient(): Promise<{ email: string; token: string; rehabId: string }> {
  const admin = createAdminClient();
  if ((await cleanupOldDemos(admin)) >= MAX_PER_HOUR) throw new Error("demo limit reached");

  const p = predloge["srcno-popuscanje"];
  const today = todayLjubljana();
  const start = addDays(today, -2);
  const token = randomBytes(32).toString("base64url");
  const first = IMENA[randomInt(IMENA.length)];
  const last = PRIIMKI[randomInt(PRIIMKI.length)];

  let userId = "";
  let email = "";
  for (let attempt = 0; attempt < 5 && !userId; attempt++) {
    email = davcnaEmail(demoDavcna());
    const { data, error } = await admin.auth.admin.createUser({
      email, password: token, email_confirm: true,
      user_metadata: { first_name: first, last_name: last, demo: true },
    });
    if (!error && data.user) userId = data.user.id;
  }
  if (!userId) throw new Error("could not create demo user");

  await admin.from("profiles").update({ obcina: OBCINA, address: `Mestni trg 1, 3230 ${OBCINA}` }).eq("id", userId);
  await admin.from("patient_qr_tokens").insert({ patient_id: userId, token });
  const { data: teren } = await admin.from("tereni").select("nurse_id").eq("obcina", OBCINA).limit(1).maybeSingle();
  const nurse = teren?.nurse_id ?? null;

  const values: Record<string, string | number> = { suhaTeza: SUHA_TEZA, zdraviloZaVodo: p.zdravila[0]?.ime ?? "zdravilo" };
  for (const v of p.vrednostiPacienta) if (v.privzeto !== undefined && !(v.kljuc in values)) values[v.kljuc] = v.privzeto;
  const questions = p.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id).slice(0, 6);

  const { data: rehab, error: rehabError } = await admin
    .from("rehabilitacije")
    .insert({
      patient_id: userId, template_id: p.id, diagnosis: "Srčno popuščanje", start_date: start,
      end_date: addDays(start, p.privzetoTrajanjeDni), created_by: nurse, assigned_nurse_id: nurse,
      questions, patient_values: values, lace: { l: 6, a: true, c: 2, e: 1 }, installed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (rehabError || !rehab) throw new Error(`rehab: ${rehabError?.message}`);

  const { data: meds } = await admin
    .from("medications")
    .insert(
      p.zdravila.slice(0, 3).map((z, k) => ({
        rehab_id: rehab.id, name: z.ime, active_substance: z.ucinkovina, dose: z.odmerki[0],
        times: [...new Set(z.casi)], purpose: z.zaKaj,
        change: k === 0 ? ("novo" as const) : ("nespremenjeno" as const),
        start_date: start, picked_up_at: start, pickup_pack_size: 30,
      })),
    )
    .select("id, times");
  await admin.from("rehab_exercises").insert(
    p.vaje.slice(0, 2).map((v) => ({ rehab_id: rehab.id, exercise_id: v.id, title: v.naslov, repetitions: v.ponovitve })),
  );

  // Two green days, triaged with the real engine.
  const history: DanOdgovori[] = [];
  for (const [k, teza] of [71.8, 71.9].entries()) {
    const date = addDays(start, k);
    const answers: CheckinAnswers = {};
    for (const q of p.vprasanja.filter((x) => questions.includes(x.id))) {
      answers[q.id] = q.tip === "teza" ? teza : (normalAnswer(p, q) ?? "");
    }
    const o = oceniPregled({ predloga: p, vrednosti: values, danes: { datum: date, odgovori: answers }, prejsnji: history, izbranaVprasanja: questions });
    history.push({ datum: date, odgovori: answers });
    await admin.from("checkins").insert({
      rehab_id: rehab.id, checkin_date: date, answers, triage_status: o.status,
      reasons: o.razlogi.map((r) => r.besedilo), entered_by: userId,
    });
  }
  await admin.from("dose_logs").insert(
    (meds ?? []).flatMap((m) =>
      m.times.map((t) => ({
        medication_id: m.id, rehab_id: rehab.id, scheduled_date: addDays(today, -1), time_of_day: t,
        status: "vzeto" as const, entered_by: userId,
      })),
    ),
  );
  await admin.from("rehabilitacije").update({ current_status: "zeleno" }).eq("id", rehab.id);

  return { email, token, rehabId: rehab.id };
}
