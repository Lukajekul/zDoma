"use client";

import { useState } from "react";
import { addDaysIso } from "@/app/nurse/odpust/_lib/plan";
import { BigButton } from "@/components/shell";
import { formatDate } from "@/lib/format";
import { ErrorText, Field } from "./ui";

const MAX_DAYS = 365;
const dayWord = (n: number) => (n % 100 === 1 ? "dan" : n % 100 === 2 ? "dneva" : "dni");
const stepClass = "min-h-14 min-w-14 rounded-2xl border-2 border-border bg-card text-3xl font-bold hover:bg-muted";

/** Whole days from start to end, both included (the same count the template default uses). */
const lengthDays = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;

/**
 * End date at discharge (T-85): − / number / +, then "+N dni" or "−N dni" moves the end date.
 * The date field stays below for picking an exact day.
 */
export function EndStepper(props: { start: string; end: string; defaultDays: number; onEnd: (d: string) => void }) {
  const { start, end, defaultDays, onEnd } = props;
  const [text, setText] = useState("7");

  const parsed = Number(text);
  const n = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DAYS ? parsed : null;
  const total = end ? lengthDays(start, end) : null;
  const canAdd = n !== null && !!end && (total ?? 0) + n <= MAX_DAYS;
  const canRemove = n !== null && !!end && addDaysIso(end, -n) >= start;
  const step = (delta: number) => setText(String(Math.min(MAX_DAYS, Math.max(1, (n ?? 1) + delta))));
  const label = n === null ? "…" : `${n} ${dayWord(n)}`;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-soft">
      <p className="text-lg">Začetek: {formatDate(start)} (danes)</p>
      <p className="text-xl">
        Konec: <strong>{end ? formatDate(end) : "—"}</strong>
        {total !== null && total >= 1 && ` · skupaj ${total} ${dayWord(total)}`}
      </p>

      <label htmlFor="end-stepper-days" className="text-lg font-semibold">
        Za koliko dni spremenim?
      </label>
      <div className="flex items-stretch gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="Manj dni" className={stepClass}>
          −
        </button>
        <input
          id="end-stepper-days"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_DAYS}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-14 w-full min-w-0 rounded-2xl border-2 border-border bg-background px-3 text-center text-3xl font-bold"
        />
        <button type="button" onClick={() => step(1)} aria-label="Več dni" className={stepClass}>
          +
        </button>
      </div>
      {n === null && <ErrorText>Vpišite število dni od 1 do {MAX_DAYS}.</ErrorText>}

      <div className="grid gap-3 sm:grid-cols-2">
        <BigButton onClick={() => n && onEnd(addDaysIso(end, n))} disabled={!canAdd}>
          Podaljšaj +{label}
        </BigButton>
        <BigButton variant="secondary" onClick={() => n && onEnd(addDaysIso(end, -n))} disabled={!canRemove}>
          Skrajšaj −{label}
        </BigButton>
      </div>
      {n !== null && end && !canRemove && (
        <p className="text-lg">Konec ne more biti pred začetkom ({formatDate(start)}).</p>
      )}

      <Field label="Ali izberite datum konca" type="date" value={end} onChange={onEnd} hint={`Privzeto ${defaultDays} dni.`} />
    </div>
  );
}
