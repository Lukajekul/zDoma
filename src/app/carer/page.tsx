import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, HeartPulse, Pill, UserPlus } from "lucide-react";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { AppShell, BigButton, IconTile, StatusBadge } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listAccessForCarer } from "@/lib/family-access";
import { createClient } from "@/lib/supabase/server";
import { oceniPrevzem, prevzemDosegel, type PrevzemZdravilo } from "@/lib/triage";
import { todayLjubljana, type Rehabilitacija } from "@/lib/types";
import { getCaredPatients, patientName } from "./_lib/access";

/** "Skrbim za": the patients who approved this zadolženec (T-26), each with their rehabilitacije (T-20). */
export default function CarerPage() {
  return (
    <AppShell title="Skrbim za" back={false}>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <CarerHome />
      </Suspense>
      <div className="mt-auto flex flex-col gap-3 border-t-2 pt-6">
        <BigButton href="/carer/zaprosi" variant="secondary" icon={<UserPlus />}>
          Zaprosi za dostop
        </BigButton>
        <LogoutButton />
      </div>
    </AppShell>
  );
}

async function CarerHome() {
  const profile = await requireProfile();
  const [patients, requests] = await Promise.all([
    getCaredPatients(profile.id),
    listAccessForCarer(await createClient(), profile.id),
  ]);
  const pending = requests.filter((r) => r.status === "pending").length;
  const today = todayLjubljana();
  const notPickedUp = await rehabsWithPickupWarning(patients.flatMap((p) => p.active), today);

  return (
    <>
      {patients.length === 0 && (
        <p className="text-xl">Še nikogar ne spremljate. Zaprosite za dostop z davčno številko osebe, ki ji pomagate.</p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
      {patients.map(({ patient, active, past }) => (
        <section key={patient.id} className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">{patientName(patient)}</h2>
          {active.length === 0 && <p className="text-xl">Trenutno nima aktivne rehabilitacije.</p>}
          {active.map((r) => {
            const { day, total } = rehabDay(r, today);
            return (
              <Link
                key={r.id}
                href={`/carer/${r.id}`}
                className="flex items-center gap-4 rounded-3xl bg-card shadow-lift p-5 hover:shadow-lift focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <IconTile><HeartPulse /></IconTile>
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-xl font-bold">{rehabTitle(r)}</span>
                  <span className="text-lg">
                    Dan {day} od {total}
                  </span>
                  <StatusBadge short status={r.current_status} />
                  {notPickedUp.has(r.id) && (
                    <span className="flex items-center gap-2 text-lg font-bold text-status-rdece">
                      <Pill aria-hidden className="size-6 shrink-0" />
                      Zdravila niso prevzeta v lekarni
                    </span>
                  )}
                </span>
                <span className="flex items-center text-lg font-semibold text-primary">
                  Odpri <ChevronRight aria-hidden className="size-7" />
                </span>
              </Link>
            );
          })}
          {past.length > 0 && (
            <div className="rounded-3xl bg-card shadow-soft p-4">
              <h3 className="text-xl font-semibold">Pretekle rehabilitacije</h3>
              <ul className="mt-3 flex flex-col gap-3">
                {past.map((r) => (
                  <li key={r.id}>
                    <Link href={`/carer/${r.id}`} className="text-xl text-primary underline underline-offset-4">
                      {rehabTitle(r)} · do {formatDate(r.end_date)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
      </div>

      {pending > 0 && (
        <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">
          {pending === 1 ? "1 prošnja čaka na odobritev." : `Prošnje, ki čakajo na odobritev: ${pending}`}
        </p>
      )}
    </>
  );
}

/** T-62: active rehabilitacije where T-48's pharmacy warning shows (same rule, one query for all). */
async function rehabsWithPickupWarning(rehabs: Rehabilitacija[], today: string): Promise<Set<string>> {
  if (!rehabs.length) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("medications")
    .select("id, name, change, picked_up_at, rehab_id")
    .in("rehab_id", rehabs.map((r) => r.id))
    .is("picked_up_at", null);
  const meds = (data ?? []) as (PrevzemZdravilo & { rehab_id: string })[];
  return new Set(
    rehabs
      .filter((r) =>
        oceniPrevzem(meds.filter((m) => m.rehab_id === r.id), r.start_date, today).some((o) =>
          prevzemDosegel(o, "pacient"),
        ),
      )
      .map((r) => r.id),
  );
}
