"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockEnd } from "./mock-end";
import { useMockCheckin } from "./use-mock-checkin";

/** SMS thread mock: zDoma asks, the patient answers with one digit. */
export function SmsCheckin() {
  const { question, status, log, answer, restart } = useMockCheckin("Odgovorite");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border-2 border-border bg-muted/60 p-3">
        <p className="mb-3 text-center font-semibold">SMS od: zDoma</p>
        <ol className="flex flex-col gap-3" aria-live="polite">
          {log.map((m, i) => (
            <li
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-lg whitespace-pre-line",
                m.from === "zdoma"
                  ? "self-start rounded-bl-sm bg-background"
                  : "self-end rounded-br-sm bg-primary text-2xl font-bold text-primary-foreground",
              )}
            >
              <span className="sr-only">{m.from === "zdoma" ? "zDoma: " : "Vi: "}</span>
              {m.text}
            </li>
          ))}
        </ol>
        <div ref={endRef} />
      </div>

      {question && (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">Pošljite odgovor:</p>
          {question.options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => answer(o.key)}
              className="flex min-h-16 w-full items-center gap-4 rounded-xl border-2 border-primary bg-background px-4 text-left text-xl font-semibold hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-2xl text-primary-foreground">
                {o.key}
              </span>
              <span className="flex-1">{o.label}</span>
              <Send aria-hidden className="size-6 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <MockEnd status={status} onRestart={restart} />
    </div>
  );
}
