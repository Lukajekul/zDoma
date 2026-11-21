import { Suspense } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NurseDashboard } from "@/components/nurse/nurse-dashboard";
import { Plus } from "lucide-react";
import { AppShell, BigButton } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { seznamPredlog } from "@/lib/templates";
import { todayLjubljana } from "@/lib/format";
import { getDashboardRows } from "./_lib/dashboard";

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
  const rows = await getDashboardRows(todayLjubljana());

  return (
    <>
      <div className="mb-4 sm:max-w-sm">
        <BigButton href="/nurse/odpust" icon={<Plus />}>Nova rehabilitacija</BigButton>
      </div>
      {rows ? (
        <NurseDashboard rows={rows} nurseId={staff.id} templates={seznamPredlog.map(({ id, ime }) => ({ id, label: ime }))} />
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
