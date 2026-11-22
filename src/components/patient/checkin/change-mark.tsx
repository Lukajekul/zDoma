import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Change } from "@/app/patient/_lib/answer-change";

/** An answer label with an arrow and a word against the last answer (T-66). Never colour alone. */
export function WithChange({ change, children }: { change?: Change | null; children: ReactNode }) {
  if (!change) return children;
  const worse = change === "slabse";
  const Icon = worse ? ArrowUp : ArrowDown;
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span>{children}</span>
      <span className={`inline-flex items-center gap-1 text-base font-bold ${worse ? "text-status-rdece" : "text-boljse"}`}>
        <Icon aria-hidden className="size-5! stroke-3" />
        {worse ? "slabše" : "boljše"}
        <span className="sr-only"> kot zadnjič</span>
      </span>
    </span>
  );
}
