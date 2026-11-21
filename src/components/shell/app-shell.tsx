import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";

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

/** Page frame: "Nazaj", title, centred column (max-w-xl, or max-w-6xl with `wide`). */
export function AppShell({ title, back, wide = false, children }: AppShellProps) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col bg-background px-4 pt-4 pb-10 sm:my-6 sm:rounded-2xl sm:border sm:px-8 sm:shadow-sm",
          wide ? "max-w-6xl" : "max-w-xl",
        )}
      >
        <header className="mb-6 flex flex-col items-start gap-4">
          {back !== false && <BackButton href={back} />}
          <h1 className="text-3xl leading-tight font-bold">{title}</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4">{children}</main>
      </div>
    </div>
  );
}
