"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { Emergency, QuestionView } from "@/app/patient/_lib/checkin-plan";
import type { CheckinInput } from "@/app/patient/[rehabId]/pregled/actions";
import { WithChange } from "./change-mark";
import { EmergencyScreen } from "./emergency-screen";
import { PhotoScreen } from "./photo-screen";
import { WeightScreen } from "./weight-screen";

type Props = {
  rehabId: string;
  today: string;
  questions: QuestionView[];
  /** Yesterday was green: offer "Enako kot včeraj" first. */
  canRepeat: boolean;
  save: (input: CheckinInput) => Promise<{ error?: string }>;
};

type Answers = Record<string, string | number>;

/** One question per screen, one tap per answer. Saves after the last one. */
export function CheckinFlow({ rehabId, today, questions, canRepeat, save }: Props) {
  const [mode, setMode] = useState<"choose" | "same" | "all">(canRepeat ? "choose" : "all");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [photoFor, setPhotoFor] = useState<string>();
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [emergency, setEmergency] = useState<{ q: QuestionView; optionId: string; e: Emergency }>();
  const [error, setError] = useState<string>();
  const [saving, startSaving] = useTransition();

  const queue = mode === "same" ? questions.filter((q) => q.always) : questions;
  const q = queue[index];

  function submit(final: Answers, photos = photoPaths) {
    setError(undefined);
    startSaving(async () => {
      const res = await save({ answers: final, sameAsYesterday: mode === "same", photoPaths: photos });
      if (res.error) setError(res.error);
    });
  }

  function next(final: Answers, photos?: string[]) {
    if (index + 1 < queue.length) setIndex(index + 1);
    else submit(final, photos);
  }

  function answer(question: QuestionView, value: string | number) {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);
    if (question.photo) return setPhotoFor(question.id);
    next(updated);
  }

  function chooseSame() {
    setMode("same");
    // Nothing left to ask: save straight away.
    if (!questions.some((x) => x.always)) {
      startSaving(async () => {
        const res = await save({ answers: {}, sameAsYesterday: true });
        if (res.error) setError(res.error);
      });
    }
  }

  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xl">Včeraj je bilo vse v redu. Je danes vse enako?</p>
        <BigButton icon={<Copy />} onClick={() => chooseSame()}>
          Enako kot včeraj
        </BigButton>
        <BigButton variant="secondary" onClick={() => setMode("all")}>
          Ne, odgovorim na vprašanja
        </BigButton>
        {questions.some((x) => x.always) && (
          <p className="text-lg text-muted-foreground">Nekatere meritve vas vprašamo vsak dan, tudi tako.</p>
        )}
      </div>
    );
  }

  if (saving || (!q && !error)) return <p className="text-2xl font-semibold">Shranjujem …</p>;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-xl bg-status-rdece-bg p-4 text-xl font-semibold text-status-rdece">{error}</p>
        <BigButton onClick={() => submit(answers)}>Poskusi znova</BigButton>
      </div>
    );
  }

  if (photoFor) {
    return (
      <PhotoScreen
        rehabId={rehabId}
        today={today}
        onDone={(paths) => {
          const kept = paths.length ? paths : photoPaths;
          setPhotoFor(undefined);
          setPhotoPaths(kept);
          next(answers, kept);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold text-muted-foreground">
          Vprašanje {index + 1} od {queue.length}
        </p>
        <div aria-hidden className="flex gap-1.5">
          {queue.map((_, i) => (
            <i key={i} className={i <= index ? "h-1.5 flex-1 rounded-full bg-brand" : "h-1.5 flex-1 rounded-full bg-border"} />
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl leading-snug font-extrabold tracking-tight">{q.text}</h2>
      </div>

      {q.kind === "teza" ? (
        <WeightScreen key={q.id} options={q.options} changes={q.changes} onAnswer={(kg) => answer(q, kg)} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {q.options.map((o) => (
            <BigButton
              key={o.id}
              variant="choice"
              onClick={() => (o.emergency ? setEmergency({ q, optionId: o.id, e: o.emergency }) : answer(q, o.id))}
            >
              <WithChange change={o.change}>{o.text}</WithChange>
            </BigButton>
          ))}
        </div>
      )}

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-card shadow-soft px-4 text-lg font-semibold hover:bg-muted"
        >
          <ArrowLeft aria-hidden className="size-6" />
          Prejšnje vprašanje
        </button>
      )}

      {emergency && (
        <EmergencyScreen
          emergency={emergency.e}
          onBack={() => setEmergency(undefined)}
          onContinue={() => {
            const { q: eq, optionId } = emergency;
            setEmergency(undefined);
            answer(eq, optionId);
          }}
        />
      )}
    </div>
  );
}
