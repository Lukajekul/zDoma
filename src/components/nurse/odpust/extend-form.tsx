"use client";

import { useState, useTransition } from "react";
import { addDaysIso } from "@/app/nurse/odpust/_lib/plan";
import { BigButton } from "@/components/shell";
import { formatDate } from "@/lib/format";
import { ErrorText } from "./ui";

type Result = { error?: string; ok?: boolean; newEnd?: string };

const MAX_DAYS = 365;
const dayWord = (n: number) => (n % 100 === 1 ? "dan" : n % 100 === 2 ? "dneva" : "dni");
const stepClass = "min-h-14 min-w-14 rounded-2xl border-2 border-border bg-card text-3xl font-bold hover:bg-muted";

/**
 * Length stepper for "Podaljšaj": − / number / +, then "+N dni" or "−N dni".
 * Shows the new end date and asks to confirm before saving. The server re-checks everything.
 */
export function ExtendForm(props: {
  currentEnd: string;
  startDate: string;
  today: string;
  ended: boolean;
  onChange: (days: number) => Promise<Result>;
}) {
  const { currentEnd, startDate, today, ended, onChange } = props;
  const [text, setText] = useState("7");
  const [pendingDays, setPendingDays] = useState<number | null>(null);
  const [result, setResult] = useState<Result>({});
  const [saving, startSaving] = useTransition();

  const parsed = Number(text);
  const n = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DAYS ? parsed : null;
  const minEnd = startDate > today ? startDate : today;
  const canExtend = n !== null && addDaysIso(currentEnd, n) >= today;
  const canShorten = !ended && n !== null && addDaysIso(currentEnd, -n) >= minEnd;

  const update = (value: string) => {
    setText(value);
    setPendingDays(null);
    setResult({});
  };
  const step = (delta: number) => update(String(Math.min(MAX_DAYS, Math.max(1, (n ?? 1) + delta))));

  const confirm = (days: number) =>
    startSaving(async () => {
      const res = await onChange(days);
      setResult(res);
      if (res.ok) setPendingDays(null);
    });

  const label = n === null ? "…" : `${n} ${dayWord(n)}`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg">
        Sedanji konec: <strong>{formatDate(currentEnd)}</strong>
      </p>

      <label htmlFor="stepper-days" className="text-lg font-semibold">
        Za koliko dni?
      </label>
      <div className="flex items-stretch gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="Manj dni" className={stepClass}>
          −
        </button>
        <input
          id="stepper-days"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_DAYS}
          value={text}
          onChange={(e) => update(e.target.value)}
          className="min-h-14 w-full min-w-0 rounded-2xl border-2 border-border bg-card px-3 text-center text-3xl font-bold"
        />
        <button type="button" onClick={() => step(1)} aria-label="Več dni" className={stepClass}>
          +
        </button>
      </div>
      {n === null && <ErrorText>Vpišite število dni od 1 do {MAX_DAYS}.</ErrorText>}

      {pendingDays === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <BigButton onClick={() => setPendingDays(n)} disabled={!canExtend}>
            Podaljšaj +{label}
          </BigButton>
          <BigButton variant="secondary" onClick={() => setPendingDays(-(n ?? 0))} disabled={!canShorten}>
            Skrajšaj −{label}
          </BigButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary p-4">
          <p className="text-xl font-bold">Nov konec: {formatDate(addDaysIso(currentEnd, pendingDays))}</p>
          <p className="text-lg">
            {pendingDays > 0
              ? `${ended ? "Rehabilitacija se ponovno odpre in podaljša" : "Rehabilitacija se podaljša"} za ${pendingDays} ${dayWord(pendingDays)}.`
              : `Rehabilitacija se skrajša za ${-pendingDays} ${dayWord(-pendingDays)}.`}
          </p>
          <BigButton onClick={() => confirm(pendingDays)} disabled={saving}>
            {saving ? "Shranjujem …" : "Potrdi"}
          </BigButton>
          <BigButton variant="secondary" onClick={() => setPendingDays(null)} disabled={saving}>
            Prekliči
          </BigButton>
        </div>
      )}

      {ended && n !== null && !canExtend && (
        <p className="text-lg">Rehabilitacija je končana. Dodajte toliko dni, da bo nov konec danes ali kasneje.</p>
      )}
      {!ended && n !== null && !canShorten && pendingDays === null && (
        <p className="text-lg">Skrajšati je mogoče največ do {formatDate(minEnd)}.</p>
      )}
      {result.ok && result.newEnd && (
        <p className="rounded-lg bg-status-zeleno-bg p-3 text-lg font-semibold text-status-zeleno">
          Shranjeno ✓ Nov konec: {formatDate(result.newEnd)}
        </p>
      )}
      <ErrorText>{result.error}</ErrorText>
    </div>
  );
}
