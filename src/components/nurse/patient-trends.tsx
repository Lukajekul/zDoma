import { addDays } from "@/app/patient/_lib/schedule";
import type { PatientDetail } from "@/app/nurse/_lib/patient-detail";
import { formatDate, formatNumber } from "@/lib/format";
import type { TriageStatus } from "@/lib/types";

const statusRows = [
  { value: "rdece", label: "Rdeče", dot: "bg-status-rdece" },
  { value: "rumeno", label: "Rumeno", dot: "bg-status-rumeno" },
  { value: "zeleno", label: "Zeleno", dot: "bg-status-zeleno" },
] satisfies { value: TriageStatus; label: string; dot: string }[];

const shortDate = new Intl.DateTimeFormat("sl-SI", {
  day: "numeric", month: "numeric", timeZone: "Europe/Ljubljana",
});

export function PatientTrends({ trends }: { trends: PatientDetail["trends"] }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(trends.start, index));
  const statuses = new Map(trends.statuses.map(({ date, status }) => [date, status]));
  const graphDescription = days.map((date) => {
    const label = statusRows.find(({ value }) => value === statuses.get(date))?.label;
    return `${formatDate(date)} ${label ?? "brez pregleda"}`;
  }).join(" · ");

  return (
    <section className="space-y-4 rounded-2xl border p-4" aria-labelledby="trendi">
      <div>
        <h2 className="text-xl font-bold" id="trendi">Trendi pregledov</h2>
        <p className="text-muted-foreground">{formatDate(trends.start)} – {formatDate(trends.end)}</p>
      </div>
      {statuses.size === 0 ? <p>V tem obdobju ni opravljenih pregledov.</p> : (
        <div className="space-y-2">
          <h3 className="font-semibold">Stanje po dnevih</h3>
          <div
            aria-label={graphDescription}
            className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-y-2 text-center"
            role="img"
          >
            {statusRows.map(({ value, label, dot }) => (
              <div className="contents" key={value}>
                <span className="pr-2 text-left">{label}</span>
                {days.map((date) => (
                  <span className="flex min-h-7 items-center justify-center border-b" key={date}>
                    {statuses.get(date) === value && <span className={`size-3 rounded-full ${dot}`} />}
                  </span>
                ))}
              </div>
            ))}
            <span />
            {days.map((date) => <span key={date}>{new Date(date).getUTCDate()}.</span>)}
          </div>
          <p className="text-muted-foreground">Dan brez pike je brez pregleda.</p>
        </div>
      )}
      {trends.weights.map((points, index) => points.length > 0 && (
        <WeightChart key={index} points={points} start={trends.start} />
      ))}
    </section>
  );
}

function WeightChart({ points, start }: {
  points: { date: string; value: number }[];
  start: string;
}) {
  const values = points.map(({ value }) => value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max((high - low) * 0.15, 0.1);
  const min = low - padding;
  const range = high + padding - min;
  const coords = points.map(({ date, value }) => ({
    x: 10 + ((Date.parse(date) - Date.parse(start)) / 86_400_000) * 50,
    y: 108 - ((value - min) / range) * 96,
  }));

  return (
    <div className="space-y-2 border-t pt-3">
      <h3 className="font-semibold">Telesna teža</h3>
      <svg
        aria-label={points.map(({ date, value }) => `${formatDate(date)} ${formatNumber(value)} kg`).join(" · ")}
        className="h-auto w-full max-w-xl text-primary"
        role="img"
        viewBox="0 0 320 120"
      >
        <path d="M10 12H310M10 60H310M10 108H310" fill="none" stroke="currentColor" opacity="0.2" />
        <polyline
          fill="none"
          points={coords.map(({ x, y }) => `${x},${y}`).join(" ")}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {coords.map(({ x, y }, index) => (
          <circle key={points[index].date} cx={x} cy={y} r="4" fill="currentColor" />
        ))}
      </svg>
      <ul aria-label="Izmerjene teže" className="flex flex-wrap gap-x-4 gap-y-1">
        {points.map(({ date, value }) => (
          <li key={date}><time dateTime={date}>{shortDate.format(new Date(date))}</time> · {formatNumber(value)} kg</li>
        ))}
      </ul>
    </div>
  );
}
