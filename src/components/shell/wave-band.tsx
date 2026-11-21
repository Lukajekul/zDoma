import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Fixed set of thin flowing lines, computed once so server and client render the same SVG.
const WAVES = Array.from({ length: 26 }, (_, i) => {
  const o = i * 3.2;
  return {
    d: `M-20 ${150 - o} C 90 ${40 - o}, 180 ${260 - o * 1.4}, 260 ${90 - o * 0.6} S 380 ${10 + o}, 430 ${60 - o * 0.3}`,
    opacity: i % 7 === 0 ? 0.18 : 0.07,
  };
});

type WaveBandProps = { className?: string; children?: ReactNode };

/**
 * Green header band with soft wave lines (the zDoma look). White text on it must be large
 * (titles, ≥ 24 px bold): the bright end of the gradient is too light for small text.
 */
export function WaveBand({ className, children }: WaveBandProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-135 from-(--band-from) to-(--band-to) text-white",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {WAVES.map((w, i) => (
          <path key={i} d={w.d} fill="none" stroke="white" strokeOpacity={w.opacity} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
