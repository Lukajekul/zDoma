import { dniBesedilo } from "@/lib/triage";
import type { RingData, RingPart } from "@/lib/progress-ring";

const COLOR: Record<RingPart, string> = {
  answered: "var(--status-zeleno)",
  missed: "var(--status-rdece)",
  future: "oklch(0.9 0 0)",
};

const SIZE = 240;
const C = SIZE / 2;
const R_OUT = 116;
const R_IN = 84;

/** Point on a circle; angle in degrees from 12 o'clock, negative = counter-clockwise. */
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
};

/** Thick ring sector from angle a to b (b < a, counter-clockwise). */
function sector(a: number, b: number) {
  const large = a - b > 180 ? 1 : 0;
  return `M ${pt(R_OUT, a)} A ${R_OUT} ${R_OUT} 0 ${large} 0 ${pt(R_OUT, b)} L ${pt(R_IN, b)} A ${R_IN} ${R_IN} 0 ${large} 1 ${pt(R_IN, a)} Z`;
}

const percent = new Intl.NumberFormat("sl-SI", { style: "percent", maximumFractionDigits: 0 });

/**
 * The whole rehabilitacija as a thick circle: starts at 12 o'clock, fills
 * counter-clockwise, one slice per day split by its questions. Always with words.
 */
export function ProgressRing({ data, extendedUntil }: { data: RingData; extendedUntil?: string }) {
  const dayDeg = 360 / Math.max(data.days.length, 1);
  const gap = data.days.length <= 120 ? Math.min(1, dayDeg * 0.15) : 0;

  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-60">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" aria-hidden>
          {data.days.map((day, d) => {
            const start = -d * dayDeg - gap / 2;
            const partDeg = (dayDeg - gap) / day.parts.length;
            return day.parts.map((p, i) => (
              <path key={`${d}-${i}`} d={sector(start - i * partDeg, start - (i + 1) * partDeg)} fill={COLOR[p]} stroke={COLOR[p]} strokeWidth={0.6} strokeLinejoin="round" />
            ));
          })}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{percent.format(data.answeredShare)}</span>
          <span className="text-base text-muted-foreground">odgovorov</span>
        </p>
      </div>
      <figcaption className="text-center text-lg font-semibold">
        Opravljeno {dniBesedilo(data.doneDays)} · Izpuščeno {dniBesedilo(data.missedDays)} · Še {dniBesedilo(data.leftDays)}
      </figcaption>
      {extendedUntil && <p className="text-center text-lg">Okrevanje podaljšano do {extendedUntil}</p>}
    </figure>
  );
}
