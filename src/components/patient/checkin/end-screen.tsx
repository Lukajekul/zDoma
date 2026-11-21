import type { ReactNode } from "react";
import { Check, Scale } from "lucide-react";
import { BigButton, Card, IconTile } from "@/components/shell";
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
  /** Progress ring (T-40), shown under "Dan X od Y". */
  ring?: ReactNode;
};

/** Check-in done: something back against the patient's own numbers, never a diagnosis. */
export function EndScreen({ status, day, total, weight, target, trend, nextTime, backHref, ring }: Props) {
  const green = status === "zeleno";
  const min = Math.min(...trend.map((t) => t.kg));
  // At least a 3 kg span, so small day-to-day changes don't look dramatic.
  const span = Math.max(Math.max(...trend.map((t) => t.kg)) - min, 3);

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="flex items-center gap-4 rounded-3xl bg-status-zeleno-bg p-5 text-2xl font-bold text-status-zeleno">
        <IconTile><Check /></IconTile>
        Shranjeno ✓
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="items-center">
          <p className="text-xl font-bold">Dan {day} od {total}</p>
          {ring}
        </Card>

        <div className="flex flex-col gap-4">
          {weight !== undefined && (
            <Card className="flex-row items-center">
              <IconTile ghost={!green}><Scale /></IconTile>
              <p>
                <strong className="block text-2xl">{formatNumber(weight)} kg</strong>
                {target !== undefined && (
                  <span className="text-lg text-muted-foreground">
                    {green ? `Blizu vaše ciljne teže ${formatNumber(target)} kg ✓` : `Vaša ciljna teža je ${formatNumber(target)} kg`}
                  </span>
                )}
              </p>
            </Card>
          )}

          {trend.length > 1 && (
            <Card>
              <figure className="flex flex-col gap-2">
                <figcaption className="text-lg font-bold">Vaša teža zadnje dni</figcaption>
                <ol className="flex h-36 items-end gap-2" aria-label="Teža po dnevih">
                  {trend.map((t) => (
                    <li key={t.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                      <span className="text-base font-semibold">{formatNumber(t.kg)}</span>
                      <span
                        aria-hidden
                        className="w-full rounded-t-lg bg-brand"
                        style={{ height: `${16 + ((t.kg - min) / span) * 56}px` }}
                      />
                      <span className="text-base text-muted-foreground">{t.label}</span>
                    </li>
                  ))}
                </ol>
              </figure>
            </Card>
          )}

          <Card>
            <p className="text-xl">
              {green ? "Vse je zabeleženo." : "Sestra bo pogledala vaše podatke."} Jutri ob {nextTime} spet.
            </p>
            <BigButton href={backHref}>Nazaj na Danes</BigButton>
          </Card>
        </div>
      </div>
    </div>
  );
}
