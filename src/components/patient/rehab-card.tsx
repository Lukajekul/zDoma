import Link from "next/link";
import { ChevronRight, HeartPulse } from "lucide-react";
import { IconTile } from "@/components/shell";
import { formatDate } from "@/lib/format";
import type { IsoDate, Rehabilitacija } from "@/lib/types";
import { rehabDay, rehabTitle } from "./rehab-info";

/** Big tappable card for one rehabilitacija on the patient's home screen. */
export function RehabCard({ rehab, today, past = false }: { rehab: Rehabilitacija; today: IsoDate; past?: boolean }) {
  const { day, total } = rehabDay(rehab, today);
  return (
    <Link
      href={`/patient/${rehab.id}`}
      className="flex min-h-24 items-center gap-4 rounded-3xl bg-card shadow-soft p-5 hover:shadow-lift focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <IconTile ghost={past}><HeartPulse /></IconTile>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-xl font-bold">{rehabTitle(rehab)}</span>
        <span className="text-lg text-muted-foreground">
          {past
            ? `${formatDate(rehab.start_date)} – ${formatDate(rehab.end_date)} · zaključeno`
            : `Dan ${day} od ${total} · do ${formatDate(rehab.end_date)}`}
        </span>
      </span>
      <span className="flex items-center gap-1 text-lg font-semibold text-primary">
        Odpri
        <ChevronRight aria-hidden className="size-6" />
      </span>
    </Link>
  );
}
