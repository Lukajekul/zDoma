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
  /** Screen title, shown big in the green band. */
  title: string;
  /** Small line under the title (e.g. "Dan 6 od 30"). */
  subtitle?: ReactNode;
  /** Shown top-right in the band, next to the logo (e.g. today's date). */
  aside?: ReactNode;
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
  /** Hide the zDoma logo row (nurse pages show it in the sidebar on a PC). */
  noLogo?: boolean;
  children: ReactNode;
};

/**
 * Page frame (design v3): green wave band with logo, "Nazaj" and the title, then white
 * cards straight on the grey canvas. Pages lay their content out as cards; on a PC
 * they may use columns (`lg:grid-cols-2`), the shell itself is a single column.
 */
export function AppShell({ title, subtitle, aside, back, hero, width, wide = false, noLogo = false, children }: AppShellProps) {
  const size = width ?? (wide ? "wide" : "narrow");
  return (
    <div className={cn("mx-auto flex w-full flex-1 flex-col px-4 pb-12 sm:px-6", WIDTH[size])}>
      <WaveBand className="-mx-4 rounded-b-4xl sm:mx-0 sm:mt-6 sm:rounded-4xl">
        <header className={cn("flex flex-col gap-3 px-5 pt-5 sm:px-8 sm:pt-6", hero ? "pb-24" : "pb-8")}>
          {!noLogo && (
            <div className={cn("flex items-center justify-between gap-3", size !== "narrow" && "lg:hidden")}>
              <Link href="/" className="flex min-h-12 items-center gap-2 text-xl font-extrabold">
                <Leaf aria-hidden className="size-6" />
                zDoma
              </Link>
              {aside && <span className="text-lg font-semibold">{aside}</span>}
            </div>
          )}
          {back !== false && <BackButton href={back} className="w-fit" />}
          <div>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-lg font-semibold">{subtitle}</p>}
          </div>
        </header>
      </WaveBand>
      {hero && <div className="relative -mt-20 sm:mx-4">{hero}</div>}
      <main className={cn("flex flex-1 flex-col gap-4", hero ? "mt-4" : "mt-6", "sm:mx-4")}>{children}</main>
    </div>
  );
}

/** A white card on the canvas: the basic building block of every screen. */
export function Card({ className, children, lift = false }: { className?: string; children: ReactNode; lift?: boolean }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-3xl bg-card p-5 sm:p-6", lift ? "shadow-lift" : "shadow-soft", className)}>
      {children}
    </section>
  );
}
