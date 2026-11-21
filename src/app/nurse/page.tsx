import { Suspense } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NurseDashboard } from "@/components/nurse/nurse-dashboard";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell, BigButton } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { seznamPredlog } from "@/lib/templates";
import { todayLjubljana } from "@/lib/format";
import { getDashboardRows } from "./_lib/dashboard";
import { getCoveredNurseIds, getVisits } from "./_patronaza/visits";

export const metadata = { title: "Pacienti – zDoma" };

export default function NursePage() {
  return (
    <AppShell title="Pacienti" wide back={false}>
      <Suspense fallback={<p role="status">Nalagam seznam pacientov …</p>}>
        <Dashboard />
      </Suspense>
    </AppShell>
  );
}

async function Dashboard() {
  const staff = await requireStaff();
  const today = todayLjubljana();
  const [rows, visits, covering] = await Promise.all([getDashboardRows(today), getVisits(staff.id, today), getCoveredNurseIds(staff.id, today)]);

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BigButton href="/nurse/odpust" icon={<Plus />}>Nova rehabilitacija</BigButton>
        <BigButton href="/nurse/danes" variant="secondary">Danes obiščite</BigButton>
        <BigButton href="/nurse/nadomescanje" variant="secondary">Nadomeščanje</BigButton>
        <BigButton href="/nurse/predloge" variant="secondary">Predloge</BigButton>
      </div>
      {visits && visits.todo.length > 0 && (
        <Link href="/nurse/danes" className="mb-4 block rounded-xl border-2 border-primary p-4 text-lg font-semibold">
          Prvi obisk še ni opravljen: {visits.todo.length} {visits.todo.length === 1 ? "pacient" : "pacientov"} ›
        </Link>
      )}
      {rows ? (
        <NurseDashboard rows={rows} nurseId={staff.id} covering={covering} templates={seznamPredlog.map(({ id, ime }) => ({ id, label: ime }))} />
      ) : (
        <p role="alert" className="rounded-xl border p-4">
          Seznama pacientov ni bilo mogoče naložiti. Osvežite stran in poskusite znova.
        </p>
      )}
      <div className="mt-4 self-start">
        <LogoutButton />
      </div>
    </>
  );
}
