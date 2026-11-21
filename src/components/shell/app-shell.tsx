import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";
import { WaveBand } from "./wave-band";

export type ShellWidth = "narrow" | "medium" | "wide";

const WIDTH: Record<ShellWidth, string> = { narrow: "max-w-xl", medium: "max-w-3xl", wide: "max-w-7xl" };

type AppShellProps = {
  /** Screen title, shown big at the top. */
  title: string;
  /**
   * "Nazaj" target. A path links there; omitted = browser back.
   * `false` hides it: only for a top-level home screen with nothing to go back to.
   */
  back?: string | false;
  /**
   * Column width on larger screens. Patient and family screens keep "narrow" (mobile-first,
   * centred on a PC). Staff screens are PC-first: "wide" for lists and dashboards, "medium" for forms.
   */
  width?: ShellWidth;
  /** Shorthand for `width="wide"`. */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Page frame: green wave band with "Nazaj" and the title, then a white panel overlapping it.
 * Band and panel share one centred column, so a phone screen also looks tidy on a PC.
 */
export function AppShell({ title, back, width, wide = false, children }: AppShellProps) {
  const size = width ?? (wide ? "wide" : "narrow");
  return (
    <div className={cn("mx-auto flex w-full flex-1 flex-col px-4 pb-10 sm:px-6", WIDTH[size])}>
      <WaveBand className="-mx-4 rounded-b-4xl sm:mx-0 sm:mt-6 sm:rounded-4xl">
        <header className="flex flex-col items-start gap-4 px-4 pt-4 pb-20 sm:px-8 sm:pt-6">
          {back !== false && <BackButton href={back} />}
          <h1 className="text-3xl leading-tight font-bold">{title}</h1>
        </header>
      </WaveBand>
      <main className="relative -mt-14 flex flex-1 flex-col gap-4 rounded-3xl bg-card p-5 shadow-lift sm:mx-3 sm:p-8">
        {children}
      </main>
    </div>
  );
}
