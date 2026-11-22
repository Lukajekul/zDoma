import "server-only";

// "Zakaj opozorilo" for staff (T-81). `alerts.reason` keeps only the text, so
// for an alert from a plan check-in the flag is recomputed with `oceniNacrt`
// on that check-in's answers and the plan version it followed. Template
// check-ins (plan_version null) keep showing only their reason.
import { danOkrevanja } from "@/app/patient/_lib/checkin-nacrt";
import { razlikaDni } from "@/lib/triage/datumi";
import { banka, oceniNacrt, zamujeniPregledi, type Nacrt, type Zamujeno } from "@/lib/moduli";
import { createClient } from "@/lib/supabase/server";
import { vstaviVrednosti, type Vir } from "@/lib/templates";
import type { CheckinAnswers, PatientValues } from "@/lib/types";

export interface ZakajOpozorilo {
  /** Module that set the threshold, and every module that had the rule. */
  modul: string;
  moduli: string[];
  vprasanje: string;
  odgovor: string;
  datum: string;
  planVerzija: number;
  vir: Vir;
  virVprasanja: Vir;
}

interface Vhod {
  rehabId: string;
  startDate: string;
  active: boolean;
  today: string;
  values: PatientValues;
  alerts: { id: string; reason: string; checkin_id?: string | null }[];
}

const imeModula = new Map(banka.moduli.map((m) => [m.id, m.ime]));
const kg = new Intl.NumberFormat("sl-SI", { maximumFractionDigits: 1 });

function odgovorBesedilo(nacrt: Nacrt, id: string, answer: CheckinAnswers[string], values: PatientValues): string {
  const p = nacrt.vnosi.flatMap((v) => (v.nadaljnje ? [v.postavka, v.nadaljnje] : [v.postavka])).find((x) => x.id === id);
  if (answer === undefined || answer === null) return "Ni odgovora";
  if (typeof answer === "number") return `${kg.format(answer)} kg`;
  if (p?.tip === "izbira") {
    const o = p.odgovori.find((x) => x.id === String(answer));
    if (o) return vstaviVrednosti(o.besedilo, values);
  }
  return String(answer);
}

export async function getZakaj(v: Vhod): Promise<{ zakaj: Record<string, ZakajOpozorilo>; zamujeno: Zamujeno | null }> {
  const supabase = await createClient();
  const { data: checkins, error } = await supabase
    .from("checkins")
    .select("id, checkin_date, answers, plan_version")
    .eq("rehab_id", v.rehabId)
    .lte("checkin_date", v.today)
    .order("checkin_date");
  if (error) throw new Error("Could not read check-ins");

  // Missed check-ins in a row before today; day 0 = start of the rehabilitacija.
  const dan = Math.max(0, razlikaDni(v.startDate, v.today));
  const zamujeno = v.active
    ? zamujeniPregledi(dan, checkins.map((c) => ({ dan: razlikaDni(v.startDate, c.checkin_date) }))) ?? null
    : null;

  const byId = new Map(checkins.map((c) => [c.id, c]));
  const planned = v.alerts.flatMap((a) => {
    const c = a.checkin_id ? byId.get(a.checkin_id) : undefined;
    return c && c.plan_version !== null ? [{ alert: a, checkin: c, version: c.plan_version }] : [];
  });
  if (planned.length === 0) return { zakaj: {}, zamujeno };

  const versions = [...new Set(planned.map((p) => p.version))];
  const { data: plans, error: planError } = await supabase
    .from("patient_plans")
    .select("version, plan")
    .eq("rehab_id", v.rehabId)
    .in("version", versions);
  if (planError) throw new Error("Could not read the plans");
  const planBy = new Map(plans.map((p) => [p.version, p.plan as unknown as Nacrt]));

  const zakaj: Record<string, ZakajOpozorilo> = {};
  for (const { alert, checkin, version } of planned) {
    const nacrt = planBy.get(version);
    if (!nacrt) continue;
    const ocena = oceniNacrt({
      nacrt,
      vrednosti: v.values,
      dan: danOkrevanja(nacrt, checkin.checkin_date),
      danes: { datum: checkin.checkin_date, odgovori: checkin.answers as CheckinAnswers },
      prejsnji: checkins
        .filter((c) => c.checkin_date < checkin.checkin_date)
        .map((c) => ({ datum: c.checkin_date, odgovori: c.answers as CheckinAnswers })),
    });
    const o = ocena.oznake.find((x) => x.besedilo === alert.reason);
    if (!o) continue;
    const postavka = nacrt.vnosi
      .flatMap((vn) => (vn.nadaljnje ? [vn.postavka, vn.nadaljnje] : [vn.postavka]))
      .find((p) => p.id === o.vprasanjeId);
    zakaj[alert.id] = {
      modul: imeModula.get(o.modul) ?? o.modul,
      moduli: o.moduli.map((m) => imeModula.get(m) ?? m),
      vprasanje: postavka ? vstaviVrednosti(postavka.besedilo, v.values) : o.vprasanjeId,
      odgovor: odgovorBesedilo(nacrt, o.vprasanjeId, (checkin.answers as CheckinAnswers)[o.vprasanjeId], v.values),
      datum: checkin.checkin_date,
      planVerzija: version,
      vir: o.vir,
      virVprasanja: o.virVprasanja,
    };
  }
  return { zakaj, zamujeno };
}
