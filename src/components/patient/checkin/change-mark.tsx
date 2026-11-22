import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Mark } from "@/app/patient/_lib/answer-change";

const WORD: Record<Mark["word"], string> = {
  boljse: "boljše",
  slabse: "slabše",
  enako: "enako",
  dobro: "dobro",
  slabo: "slabo",
};

/**
 * An answer label with a coloured arrow and a word (T-66, T-91): good answers blue ↓,
 * bad answers red ↑, never colour alone. "Enako" also says whether that is good or bad.
 */
export function WithChange({ change, children }: { change?: Mark | null; children: ReactNode }) {
  if (!change) return children;
  const bad = change.tone === "slabo";
  const Icon = bad ? ArrowUp : ArrowDown;
  const compared = change.word === "boljse" || change.word === "slabse" || change.word === "enako";
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span>{children}</span>
      <span className={`inline-flex items-center gap-1 text-base font-bold ${bad ? "text-status-rdece" : "text-boljse"}`}>
        <Icon aria-hidden className="size-5! stroke-3" />
        {change.word === "enako" ? `${WORD[change.tone]} · enako` : WORD[change.word]}
        {compared && <span className="sr-only"> kot zadnjič</span>}
      </span>
    </span>
  );
}
