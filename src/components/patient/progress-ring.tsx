import { dniBesedilo } from "@/lib/triage";
import type { RingData, RingPart } from "@/lib/progress-ring";

const COLOR: Record<RingPart, string> = {
  answered: "var(--brand)",
  missed: "oklch(0.65 0.18 27)",
  future: "oklch(0.93 0.006 240)",
};

const SIZE = 220;
const C = SIZE / 2;
const R = 90;
const W = 20;

/** Point on the ring's centre line; angle in radians from 12 o'clock, negative = counter-clockwise. */
const pt = (a: number) => `${(C + R * Math.sin(a)).toFixed(2)} ${(C - R * Math.cos(a)).toFixed(2)}`;

/** Arc stroke from angle a to b (b < a, counter-clockwise). */
const arc = (a: number, b: number) => `M ${pt(a)} A ${R} ${R} 0 ${a - b > Math.PI ? 1 : 0} 0 ${pt(b)}`;

const percent = new Intl.NumberFormat("sl-SI", { style: "percent", maximumFractionDigits: 0 });

/**
 * The whole rehabilitacija as a thick circle: starts at 12 o'clock, fills
 * counter-clockwise, one slice per day split by its questions. Always with words.
 */
export function ProgressRing({ data, extendedUntil }: { data: RingData; extendedUntil?: string }) {
  const n = Math.max(data.days.length, 1);
  const per = (2 * Math.PI) / n;
  const gap = n <= 120 ? Math.min(0.014, per * 0.12) : 0;

  return (
    <figure className="flex flex-col items-center gap-3 text-center">
      <div className="relative grid w-full max-w-60 place-items-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" aria-hidden>
          {data.days.map((day, d) => {
            const a0 = -d * per - gap;
            const span = per - 2 * gap;
            const part = span / day.parts.length;
            // Merge neighbouring parts of the same colour, so a day has no seams inside it.
            const runs: { p: RingPart; from: number; to: number }[] = [];
            day.parts.forEach((p, i) => {
              const last = runs.at(-1);
              if (last?.p === p) last.to = i + 1;
              else runs.push({ p, from: i, to: i + 1 });
            });
            return runs.map((r) => (
              <path key={`${d}-${r.from}`} d={arc(a0 - r.from * part, a0 - r.to * part)} fill="none" stroke={COLOR[r.p]} strokeWidth={W} />
            ));
          })}
        </svg>
        <p className="absolute flex flex-col items-center">
          <span className="text-[2.6rem] leading-none font-extrabold tracking-tight">{percent.format(data.overallShare)}</span>
          <span className="mt-1 text-base text-muted-foreground">opravljeno</span>
        </p>
      </div>
      <figcaption className="text-base text-muted-foreground">
        Opravljeno {dniBesedilo(data.doneDays)} · Izpuščeno {dniBesedilo(data.missedDays)} · Še {dniBesedilo(data.leftDays)}
      </figcaption>
      {extendedUntil && <p className="text-lg font-semibold">Okrevanje podaljšano do {extendedUntil}</p>}
    </figure>
  );
}
