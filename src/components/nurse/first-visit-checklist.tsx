"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BigButton } from "@/components/shell";

type Step = { id: string; title: string; body: ReactNode; done?: boolean };

/** "Prvi obisk": tick each step with the patient, then "Nameščeno ✓". */
export function FirstVisitChecklist({ steps, onInstalled }: { steps: Step[]; onInstalled: () => Promise<{ error?: string }> }) {
  const [ticked, setTicked] = useState<Record<string, boolean>>(Object.fromEntries(steps.map((s) => [s.id, !!s.done])));
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const all = steps.every((s) => ticked[s.id]);

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={s.id} className="flex flex-col gap-2 rounded-xl border-2 border-border p-4">
            <h2 className="text-xl font-bold">{i + 1}. {s.title}</h2>
            <div className="text-lg">{s.body}</div>
            <label className="flex min-h-12 items-center gap-3 text-lg font-semibold">
              <input type="checkbox" className="size-6" checked={!!ticked[s.id]} onChange={() => setTicked({ ...ticked, [s.id]: !ticked[s.id] })} />
              {ticked[s.id] ? "Opravljeno ✓" : "Opravljeno"}
            </label>
          </li>
        ))}
      </ol>
      <BigButton
        variant="success"
        disabled={!all || pending}
        onClick={() => start(async () => setError((await onInstalled()).error))}
      >
        {pending ? "Shranjujem …" : "Nameščeno ✓"}
      </BigButton>
      {!all && <p className="text-lg text-muted-foreground">Označite vse korake.</p>}
      {error && <p role="alert" className="text-lg font-semibold text-status-rdece">{error}</p>}
    </div>
  );
}
