import type { ReactNode } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";
import { WaveBand } from "./wave-band";

export type ShellWidth = "narrow" | "medium" | "wide";

// Mobile-first, but every width grows on a PC instead of staying a phone-sized column.
const WIDTH: Record<ShellWidth, string> = { narrow: "max-w-5xl", medium: "max-w-5xl", wide: "max-w-7xl" };

type AppShellProps = {
  /** Screen title in the green band. */
  title: string;
  /** Small line under the title (e.g. "Dan 6 od 30"). */
  subtitle?: ReactNode;
  /** Small line above the title (e.g. "Pregled / Pacienti" on the dashboard). */
  eyebrow?: ReactNode;
  /** Shown top-right in the band (e.g. today's date). */
  aside?: ReactNode;
  /** Shown on the right of the title in the band on a PC (e.g. the dashboard search). */
  bandEnd?: ReactNode;
  /**
   * "Nazaj" target. A path links there; omitted = browser back.
   * `false` hides it: only for a top-level home screen with nothing to go back to.
   */
  back?: string | false;
  /** Card that overlaps the bottom of the band (e.g. the progress ring on "Danes"). */
  hero?: ReactNode;
  /** Column width: "narrow" for patient and family screens, "medium" staff forms, "wide" staff lists. */
  width?: ShellWidth;
  /** Shorthand for `width="wide"`. */
  wide?: boolean;
  /** Smaller title (staff pages, where the band is a header, not the message). */
  compact?: boolean;
  /** Hide the zDoma logo row (nurse pages show it in the sidebar on a PC). */
  noLogo?: boolean;
  children: ReactNode;
};

/**
 * Page frame (design v3): a rounded green wave band with "Nazaj" (or the logo) and the
 * title, then white cards straight on the grey canvas. Pages lay their content out as
 * cards; on a PC they may use columns (`lg:grid-cols-2`), the shell itself is one column.
 */
export function AppShell({ title, subtitle, eyebrow, aside, bandEnd, back, hero, width, wide = false, compact = false, noLogo = false, children }: AppShellProps) {
  const size = width ?? (wide ? "wide" : "narrow");
  const showLogo = back === false && !noLogo;
  return (
    <div className={cn("mx-auto flex w-full flex-1 flex-col px-4 pb-12 sm:px-6", WIDTH[size])}>
      <WaveBand className="mt-4 rounded-3xl sm:mt-6">
        <header className={cn("flex flex-col gap-2 px-5 pt-4 sm:px-6 sm:pt-5", hero ? "pb-20" : "pb-6")}>
          {(showLogo || back !== false || aside) && (
            <div className={cn("flex items-center justify-between gap-3", size !== "narrow" && back === false && "lg:hidden")}>
              {back !== false ? (
                <BackButton href={back} className="min-h-11 px-3 text-base [&_svg]:size-5" />
              ) : showLogo ? (
                <Link href="/" className="flex min-h-12 items-center gap-2 text-lg font-extrabold">
                  <Leaf aria-hidden className="size-6" />
                  zDoma
                </Link>
              ) : <span />}
              {aside && <span className="text-base font-semibold">{aside}</span>}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              {eyebrow && <p className="text-base font-medium opacity-90">{eyebrow}</p>}
              <h1 className={cn("leading-tight font-extrabold tracking-tight", compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl")}>{title}</h1>
              {subtitle && <p className="mt-0.5 text-base font-semibold sm:text-lg">{subtitle}</p>}
            </div>
            {bandEnd}
          </div>
        </header>
      </WaveBand>
      {hero && <div className="relative -mt-16 px-1.5 sm:px-5">{hero}</div>}
      <main className={cn("flex flex-1 flex-col gap-4", hero ? "mt-4" : "mt-5")}>{children}</main>
    </div>
  );
}

/** A white card on the canvas: the basic building block of every screen. */
export function Card({ className, children, lift = false }: { className?: string; children: ReactNode; lift?: boolean }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-3xl bg-card p-5", lift ? "shadow-lift" : "shadow-soft", className)}>
      {children}
    </section>
  );
}
