import Link from "next/link";
import { StatusBadge } from "@/components/shell";
import type { VisitRow } from "@/app/nurse/_patronaza/visits";

/** One patient on "Danes obiščite": name, status word, address, "Prvi obisk" if not set up yet. */
export function VisitRowCard({ r }: { r: VisitRow }) {
  return (
    <li className="flex flex-col gap-2 rounded-3xl bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/nurse/${r.rehabId}`} className="text-xl font-bold underline-offset-4 hover:underline">{r.name}</Link>
        <StatusBadge status={r.status} short />
      </div>
      <p className="text-lg text-muted-foreground">{[r.address, r.naselje].filter(Boolean).join(", ") || r.obcina}</p>
      {r.coveringFor && <p className="text-lg">Nadomeščate: {r.coveringFor}</p>}
      <div className="flex flex-wrap gap-2">
        <Link href={`/nurse/obisk/${r.rehabId}`} className="inline-flex min-h-12 items-center rounded-2xl bg-primary px-5 text-lg font-bold text-primary-foreground hover:bg-primary/90">
          Obisk
        </Link>
        {!r.installed && (
          <Link href={`/nurse/prvi-obisk/${r.rehabId}`} className="inline-flex min-h-12 items-center rounded-2xl border-2 border-primary px-4 text-lg font-semibold text-primary hover:bg-muted">
            Prvi obisk
          </Link>
        )}
      </div>
    </li>
  );
}
