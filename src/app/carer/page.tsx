import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listAccessForCarer } from "@/lib/family-access";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";
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

  return (
    <>
      {patients.length === 0 && (
        <p className="text-xl">Še nikogar ne spremljate. Zaprosite za dostop z davčno številko osebe, ki ji pomagate.</p>
      )}

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
                className="flex items-center gap-3 rounded-xl border-2 border-primary p-4 hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-xl font-semibold">{rehabTitle(r)}</span>
                  <span className="text-lg">
                    Dan {day} od {total}
                  </span>
                  <StatusBadge status={r.current_status} />
                </span>
                <span className="flex items-center text-lg font-semibold text-primary">
                  Odpri <ChevronRight aria-hidden className="size-7" />
                </span>
              </Link>
            );
          })}
          {past.length > 0 && (
            <div className="rounded-xl border-2 border-border p-4">
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

      {pending > 0 && (
        <p className="rounded-xl border-2 border-border bg-muted/50 p-4 text-xl">
          {pending === 1 ? "1 prošnja čaka na odobritev." : `Prošnje, ki čakajo na odobritev: ${pending}`}
        </p>
      )}
    </>
  );
}
