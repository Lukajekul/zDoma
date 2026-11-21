import { Suspense } from "react";
import Link from "next/link";
import { VisitRowCard } from "@/components/nurse/visit-row";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { todayLjubljana } from "@/lib/types";
import { getVisits } from "../_patronaza/visits";

export const metadata = { title: "Danes obiščite – zDoma" };

/** T-36 (a): the patronažna sestra's patients by status, grouped by občina. */
export default function VisitsPage() {
  return (
    <AppShell title="Danes obiščite" back="/nurse" wide>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Visits />
      </Suspense>
    </AppShell>
  );
}

async function Visits() {
  const staff = await requireStaff();
  const data = await getVisits(staff.id, todayLjubljana());
  if (!data) return <p role="alert" className="text-xl">Seznama ni bilo mogoče naložiti. Osvežite stran.</p>;
  const { groups, todo, handedTo } = data;

  return (
    <>
      {handedTo && (
        <p className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
          Vaše paciente do {formatDate(handedTo.until)} prevzema {handedTo.name}.
        </p>
      )}

      {todo.length > 0 && (
        <section className="flex flex-col gap-2 rounded-2xl border-2 border-primary p-4">
          <h2 className="text-xl font-bold">Prvi obisk še ni opravljen ({todo.length})</h2>
          {todo.map((r) => (
            <Link key={r.rehabId} href={`/nurse/prvi-obisk/${r.rehabId}`} className="flex min-h-12 items-center justify-between gap-2 rounded-lg px-2 text-lg font-semibold text-primary underline underline-offset-4 hover:bg-muted">
              {r.name} · {r.naselje ?? r.obcina}
              <span aria-hidden>›</span>
            </Link>
          ))}
        </section>
      )}

      {groups.length === 0 && <p className="rounded-xl bg-muted p-4 text-xl">Nimate dodeljenih pacientov z odprto rehabilitacijo.</p>}
      {groups.map(([obcina, rows]) => (
        <section key={obcina} className="flex flex-col gap-2">
          <h2 className="mt-2 text-2xl font-bold">{obcina} ({rows.length})</h2>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((r) => <VisitRowCard key={r.rehabId} r={r} />)}</ul>
        </section>
      ))}
    </>
  );
}
