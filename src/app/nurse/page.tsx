import { Suspense } from "react";
import Link from "next/link";
import { CalendarCheck, Plus } from "lucide-react";
import { getStaffKind } from "@/lib/staff";
import { LogoutButton } from "@/components/auth/logout-button";
import { NurseDashboard } from "@/components/nurse/nurse-dashboard";
import { AppShell, BigButton, IconTile } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatShortDay, greeting, todayLjubljana } from "@/lib/format";
import { seznamPredlog } from "@/lib/templates";
import { getDashboardRows } from "./_lib/dashboard";
import { getCoveredNurseIds, getVisits } from "./_patronaza/visits";

export const metadata = { title: "Pacienti – zDoma" };

export default function NursePage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Pacienti" wide back={false}>
          <p role="status" className="text-xl">Nalagam seznam pacientov …</p>
        </AppShell>
      }
    >
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const staff = await requireStaff();
  const today = todayLjubljana();
  const [rows, visits, covering, { kind, obcine }] = await Promise.all([
    getDashboardRows(today),
    getVisits(staff.id, today),
    getCoveredNurseIds(staff.id, today),
    getStaffKind(staff.id),
  ]);
  const subtitle = kind === "patronaza" ? `Patronažna sestra · ${obcine.join(", ")}` : "Bolnišnica · pregled pacientov";

  return (
    <AppShell title={`${greeting()}, ${staff.first_name}`} subtitle={subtitle} aside={formatShortDay()} wide back={false}>
      {kind === "bolnisnica" && (
        <BigButton href="/nurse/odpust" icon={<Plus />} className="sm:w-fit sm:px-8">Nova rehabilitacija</BigButton>
      )}
      {visits && visits.todo.length > 0 && (
        <Link href="/nurse/danes" className="flex items-center gap-4 rounded-3xl bg-card p-4 text-lg font-semibold shadow-soft hover:shadow-lift">
          <IconTile><CalendarCheck /></IconTile>
          <span className="flex-1">
            Prvi obisk še ni opravljen: {visits.todo.length} {visits.todo.length === 1 ? "pacient" : "pacientov"}
          </span>
          <span className="text-primary underline underline-offset-4">Odpri</span>
        </Link>
      )}
      {rows ? (
        <NurseDashboard kind={kind} rows={rows} nurseId={staff.id} covering={covering} templates={seznamPredlog.map(({ id, ime }) => ({ id, label: ime }))} />
      ) : (
        <p role="alert" className="rounded-3xl bg-card p-5 shadow-soft">
          Seznama pacientov ni bilo mogoče naložiti. Osvežite stran in poskusite znova.
        </p>
      )}
      <div className="self-start lg:hidden">
        <LogoutButton />
      </div>
    </AppShell>
  );
}
