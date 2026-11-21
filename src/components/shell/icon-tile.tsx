import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rounded square behind an icon (design v3). Decorative: the text label sits next to it. */
export function IconTile({ children, ghost = false, tone, className }: {
  children: ReactNode;
  /** White tile with a green icon instead of a green tile. */
  ghost?: boolean;
  tone?: "rdece" | "rumeno";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl [&_svg]:size-6",
        tone === "rdece" ? "bg-status-rdece text-white"
          : tone === "rumeno" ? "bg-[oklch(0.78_0.14_80)] text-white"
          : ghost ? "bg-card text-primary shadow-soft" : "bg-brand text-white shadow-[0_4px_10px_oklch(0.73_0.15_150/0.35)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
