import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";
import { WaveBand } from "./wave-band";

type AppShellProps = {
  /** Screen title, shown big at the top. */
  title: string;
  /**
   * "Nazaj" target. A path links there; omitted = browser back.
   * `false` hides it: only for a top-level home screen with nothing to go back to.
   */
  back?: string | false;
  /** Wider content (staff dashboards). Patient screens keep the default narrow column. */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Page frame: green wave band with "Nazaj" and the title, then a white panel that overlaps
 * the band on the grey canvas. Centred column (max-w-xl, or max-w-6xl with `wide`).
 */
export function AppShell({ title, back, wide = false, children }: AppShellProps) {
  const column = cn("mx-auto w-full px-4 sm:px-6", wide ? "max-w-6xl" : "max-w-xl");
  return (
    <div className="flex flex-1 flex-col bg-canvas pb-10">
      <WaveBand className="sm:mx-4 sm:mt-4 sm:rounded-4xl rounded-b-4xl">
        <header className={cn(column, "flex flex-col items-start gap-4 pt-4 pb-20 sm:pt-6")}>
          {back !== false && <BackButton href={back} />}
          <h1 className="text-3xl leading-tight font-bold">{title}</h1>
        </header>
      </WaveBand>
      <div className={cn(column, "relative -mt-14 flex flex-1 flex-col")}>
        <main className="flex flex-1 flex-col gap-4 rounded-3xl bg-card p-5 shadow-lift sm:p-8">{children}</main>
      </div>
    </div>
  );
}
