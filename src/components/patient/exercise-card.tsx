"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Undo2, X } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { ExerciseActionState } from "@/app/patient/[rehabId]/vaje/actions";
import { PainPicker } from "./pain-picker";

export type ExerciseLogView = { id: string; done: boolean; pain: number | null; canUndo: boolean; markedBy?: string };

type ExerciseCardProps = {
  title: string;
  repetitions: string | null;
  timesPerDay: number;
  steps: string[];
  image?: string;
  logs: ExerciseLogView[];
  /** Read-only (finished rehabilitacija). */
  readOnly?: boolean;
  onLog: (done: boolean, pain: number | null) => Promise<ExerciseActionState>;
  onUndo: (logId: string) => Promise<ExerciseActionState>;
};

/** One exercise: picture, steps, "Opravljeno?" → pain 0–10 → saved, with undo. */
export function ExerciseCard(props: ExerciseCardProps) {
  const { title, repetitions, timesPerDay, steps, image, logs, readOnly, onLog, onUndo } = props;
  const [askPain, setAskPain] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const remaining = timesPerDay - logs.length;

  function run(action: () => Promise<ExerciseActionState>) {
    setError(undefined);
    startTransition(async () => {
      const res = await action();
      setError(res.error);
      setAskPain(false);
    });
  }

  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-card shadow-soft p-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-lg">
          {[repetitions, timesPerDay > 1 ? `${timesPerDay}-krat na dan` : null].filter(Boolean).join(" · ")}
        </p>
      </div>

      {image && (
        <Image src={image} alt={title} width={360} height={224} unoptimized className="w-full max-w-md rounded-lg bg-muted" />
      )}

      {steps.length > 0 && (
        <ol className="flex list-decimal flex-col gap-2 pl-7 text-lg">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}

      {logs.map((l) => (
        <div key={l.id} className="flex flex-col gap-2">
          <p
            className={
              l.done
                ? "rounded-xl bg-status-zeleno-bg px-4 py-3 text-xl font-bold text-status-zeleno"
                : "rounded-xl bg-muted px-4 py-3 text-xl font-bold"
            }
          >
            {l.done ? `Opravljeno ✓ · bolečina ${l.pain ?? "–"} od 10` : "Danes ne"}
            {l.markedBy && <span className="block text-lg font-semibold">Označeno: {l.markedBy}</span>}
          </p>
          {l.canUndo && !readOnly && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => onUndo(l.id))}
              className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-card shadow-soft px-4 text-lg font-semibold hover:bg-muted disabled:opacity-50"
            >
              <Undo2 aria-hidden className="size-6" />
              Razveljavi
            </button>
          )}
        </div>
      ))}

      {!readOnly && remaining > 0 &&
        (askPain ? (
          <>
            <PainPicker disabled={pending} onPick={(pain) => run(() => onLog(true, pain))} />
            <BigButton variant="secondary" disabled={pending} onClick={() => setAskPain(false)}>
              Nazaj
            </BigButton>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xl font-semibold">
              Opravljeno?{timesPerDay > 1 && ` (še ${remaining}-krat danes)`}
            </p>
            <BigButton icon={<Check />} disabled={pending} onClick={() => setAskPain(true)}>
              Da, opravljeno
            </BigButton>
            <BigButton variant="secondary" icon={<X />} disabled={pending} onClick={() => run(() => onLog(false, null))}>
              Danes ne
            </BigButton>
          </div>
        ))}

      {pending && <p className="text-lg">Shranjujem …</p>}
      {error && (
        <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
          {error}
        </p>
      )}
    </li>
  );
}
