import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Phone } from "lucide-react";
import { getMedsAndLogs } from "@/app/patient/_lib/doses";
import { dosesOn, TIME_LABEL } from "@/app/patient/_lib/schedule";
import { LogoutButton } from "@/components/auth/logout-button";
import { RouteToday } from "@/components/student/route-today";
import { AppShell, StatusBadge } from "@/components/shell";
import { requireStudent } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { clock, visitMinutes, visitSlots } from "@/lib/student/visits";
import { createClient } from "@/lib/supabase/server";
import { fullAddress, nowMinutesLjubljana, todayRoute } from "./_lib/route";
import { isActiveStudent, isRehabActive, todayLjubljana, type Profile, type Rehabilitacija } from "@/lib/types";

export const metadata = { title: "Moji pacienti – Študent pomočnik – zDoma" };

/** Študent pomočnik: the assigned patients, what is done today and what is still waiting. */
export default function StudentHomePage() {
  return (
    <AppShell title="Moji pacienti" subtitle="Študent pomočnik" back={false}>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <StudentHome />
      </Suspense>
      <div className="mt-auto flex flex-col gap-3 border-t-2 pt-6">
        <LogoutButton />
      </div>
    </AppShell>
  );
}

type PatientRow = Pick<Profile, "id" | "first_name" | "last_name" | "address" | "obcina" | "phone" | "checkin_time">;

async function StudentHome() {
  const profile = await requireStudent();
  const today = todayLjubljana();
  if (!isActiveStudent(profile, today)) {
    return (
      <p className="rounded-3xl bg-card shadow-soft p-5 text-xl">
        Vaša praksa se je končala {profile.student_until ? formatDate(profile.student_until) : ""}. Do pacientov nimate
        več dostopa. Hvala za pomoč!
      </p>
    );
  }

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("student_assignments")
    .select("patient_id, status")
    .eq("student_id", profile.id)
    .neq("status", "rejected");
  const approved = (assignments ?? []).filter((a) => a.status === "approved").map((a) => a.patient_id);
  const pending = (assignments ?? []).filter((a) => a.status === "pending").length;

  let people: PatientRow[] = [];
  let rehabs: Rehabilitacija[] = [];
  if (approved.length) {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id, first_name, last_name, address, obcina, phone, checkin_time").in("id", approved),
      supabase.from("rehabilitacije").select("*").in("patient_id", approved),
    ]);
    people = (p.data ?? []) as PatientRow[];
    rehabs = ((r.data ?? []) as Rehabilitacija[]).filter((x) => isRehabActive(x, today));
  }

  const cards = await Promise.all(
    people.map(async (p) => {
      const rehab = rehabs.find((r) => r.patient_id === p.id) ?? null;
      if (!rehab) return { p, rehab, slots: [], alerts: 0 };
      const [{ meds, logs }, { count: checkins }, { count: alerts }] = await Promise.all([
        getMedsAndLogs(rehab.id),
        supabase.from("checkins").select("id", { count: "exact", head: true }).eq("rehab_id", rehab.id).eq("checkin_date", today),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("rehab_id", rehab.id).eq("state", "odprto"),
      ]);
      const slots = visitSlots(
        dosesOn(meds, logs, today).map((g) => ({ slot: g.time, allMarked: g.doses.every((d) => !!d.log) })),
        (checkins ?? 0) > 0,
      );
      return { p, rehab, slots, alerts: alerts ?? 0 };
    }),
  );
  // Patients still waiting for something today come first.
  const finished = (c: (typeof cards)[number]) => Number(c.slots.length > 0 && c.slots.every((s) => s.done));
  cards.sort((a, b) => finished(a) - finished(b));
  const route = todayRoute(
    cards.map(({ p, rehab, slots }) => ({
      p: { name: `${p.first_name} ${p.last_name}`.trim(), address: p.address, obcina: p.obcina, checkin_time: p.checkin_time },
      rehabId: rehab?.id ?? null,
      slots,
    })),
    nowMinutesLjubljana(),
  );

  return (
    <>
      {pending > 0 && (
        <p className="rounded-3xl bg-card shadow-soft p-4 text-lg">
          {pending === 1 ? "En pacient še ni potrdil vaše pomoči." : `Pacienti, ki še niso potrdili vaše pomoči: ${pending}.`} Ko
          potrdi, se prikaže tukaj.
        </p>
      )}
      {cards.length === 0 && pending === 0 && (
        <p className="text-xl">Še nimate dodeljenih pacientov. Dodeli vam jih sestra ali zdravnik.</p>
      )}

      {cards.some((c) => c.rehab) && <RouteToday stops={route.stops} pins={route.pins} />}

      {cards.length > 0 && <h2 className="mt-4 text-2xl font-bold">Vsi pacienti</h2>}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {cards.map(({ p, rehab, slots, alerts }) => {
          const name = `${p.first_name} ${p.last_name}`.trim();
          const allDone = slots.length > 0 && slots.every((s) => s.done);
          return (
            <section key={p.id} className="flex flex-col gap-3 rounded-3xl bg-card shadow-soft p-5">
              <h2 className="text-2xl font-bold">{name}</h2>
              {(p.address || p.obcina) && (
                <p className="flex items-start gap-2 text-lg">
                  <MapPin aria-hidden className="mt-1 size-5 shrink-0" />
                  {fullAddress(p.address, p.obcina)}
                </p>
              )}
              {p.phone && (
                <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="flex min-h-12 items-center gap-2 text-lg font-semibold underline">
                  <Phone aria-hidden className="size-5 shrink-0" />
                  Pokliči: {p.phone}
                </a>
              )}

              {!rehab ? (
                <p className="text-lg">Trenutno nima aktivnega okrevanja.</p>
              ) : (
                <>
                  <StatusBadge status={rehab.current_status} />
                  {alerts > 0 && (
                    <p className="text-lg font-semibold text-status-rumeno">Odprta opozorila: {alerts}. Poglejte podrobnosti.</p>
                  )}
                  <ul className="flex flex-col gap-1 text-lg">
                    {slots.map((s) => (
                      <li key={s.slot}>
                        {TIME_LABEL[s.slot]} ob {clock(visitMinutes(s.slot, p.checkin_time))}:{" "}
                        {s.done ? <strong>opravljeno ✓</strong> : <strong className="text-status-rumeno">še čaka</strong>}
                      </li>
                    ))}
                  </ul>
                  {allDone && <p className="text-lg font-bold text-status-zeleno">Končano za danes ✓</p>}
                  <Link
                    href={`/student/${rehab.id}`}
                    className="flex min-h-14 items-center justify-between rounded-xl bg-primary px-5 text-lg font-bold text-primary-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {allDone ? "Odpri" : "Začni obisk"}
                    <ChevronRight aria-hidden className="size-6" />
                  </Link>
                </>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
