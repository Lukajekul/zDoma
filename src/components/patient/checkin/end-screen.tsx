import { BigButton } from "@/components/shell";
import { formatNumber } from "@/lib/format";
import type { TriageStatus } from "@/lib/types";

export type TrendPoint = { label: string; kg: number };

type Props = {
  status: TriageStatus;
  day: number;
  total: number;
  weight?: number;
  target?: number;
  trend: TrendPoint[];
  /** "8:00" */
  nextTime: string;
  backHref: string;
};

/** Check-in done: something back against the patient's own numbers, never a diagnosis. */
export function EndScreen({ status, day, total, weight, target, trend, nextTime, backHref }: Props) {
  const green = status === "zeleno";
  const min = Math.min(...trend.map((t) => t.kg));
  // At least a 3 kg span, so small day-to-day changes don't look dramatic.
  const span = Math.max(Math.max(...trend.map((t) => t.kg)) - min, 3);

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-status-zeleno-bg p-4 text-2xl font-bold text-status-zeleno">Shranjeno ✓</p>

      {weight !== undefined && (
        <p className="text-2xl font-semibold">
          {formatNumber(weight)} kg
          {target !== undefined &&
            (green ? ` – blizu vaše ciljne teže ${formatNumber(target)} kg ✓` : ` · vaša ciljna teža je ${formatNumber(target)} kg`)}
        </p>
      )}

      <p className="text-2xl font-semibold">
        Dan {day} od {total}
      </p>

      {trend.length > 1 && (
        <figure className="flex flex-col gap-2">
          <figcaption className="text-lg font-semibold">Vaša teža zadnje dni</figcaption>
          <ol className="flex h-36 items-end gap-2" aria-label="Teža po dnevih">
            {trend.map((t) => (
              <li key={t.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-base font-semibold">{formatNumber(t.kg)}</span>
                <span
                  aria-hidden
                  className="w-full rounded-t bg-primary/70"
                  style={{ height: `${16 + ((t.kg - min) / span) * 56}px` }}
                />
                <span className="text-base text-muted-foreground">{t.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      )}

      <p className="text-xl">
        {green ? "Vse je zabeleženo." : "Sestra bo pogledala vaše podatke."} Jutri ob {nextTime} spet.
      </p>
      <BigButton href={backHref}>Nazaj na Danes</BigButton>
    </div>
  );
}
