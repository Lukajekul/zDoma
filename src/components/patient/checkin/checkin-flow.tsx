"use client";

import { useState, useTransition } from "react";
import { BigButton } from "@/components/shell";
import { canSkip, withFollowUps, type Emergency, type QuestionView } from "@/app/patient/_lib/checkin-plan";
import type { CheckinInput } from "@/app/patient/[rehabId]/pregled/actions";
import { WithChange } from "./change-mark";
import { EmergencyScreen } from "./emergency-screen";
import { HelpRow, NUJNA_POMOC } from "./help-row";
import { OtherProblem } from "./other-problem";
import { PhotoScreen } from "./photo-screen";
import { WeightScreen } from "./weight-screen";

type Props = {
  rehabId: string;
  today: string;
  questions: QuestionView[];
  save: (input: CheckinInput) => Promise<{ error?: string }>;
};

type Answers = Record<string, string | number>;

/** One question per screen, one tap per answer. Saves after the last one. */
export function CheckinFlow({ rehabId, today, questions, save }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [photoFor, setPhotoFor] = useState<string>();
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [emergency, setEmergency] = useState<{ q: QuestionView; optionId: string; e: Emergency }>();
  const [error, setError] = useState<string>();
  // T-94: skipped question ids, "Sporoči drugo težavo", and which side screen is open.
  const [skipped, setSkipped] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState(false);
  const [side, setSide] = useState<"help" | "other">();
  const [saving, startSaving] = useTransition();

  // A follow-up joins the queue right after its parent once the answer triggers it (T-80).
  // T-95: no "Enako kot včeraj": every question is answered (or skipped, T-94) every day.
  const queueFor = (a: Answers) => withFollowUps(questions, a);
  const queue = queueFor(answers);
  const q = queue[index];

  function submit(all: Answers, photos = photoPaths) {
    setError(undefined);
    // Drop answers to follow-ups no longer triggered (the parent was changed after going back).
    const final = Object.fromEntries(queueFor(all).flatMap((x) => (all[x.id] === undefined ? [] : [[x.id, all[x.id]]])));
    startSaving(async () => {
      const asked = new Set(queueFor(all).map((x) => x.id));
      const res = await save({
        answers: final,
        photoPaths: photos,
        skipped: skipped.filter((id) => asked.has(id) && all[id] === undefined),
        otherProblem,
      });
      if (res.error) setError(res.error);
    });
  }

  function next(final: Answers, photos?: string[]) {
    if (index + 1 < queueFor(final).length) setIndex(index + 1);
    else submit(final, photos);
  }

  function answer(question: QuestionView, value: string | number) {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);
    setSkipped((s) => s.filter((id) => id !== question.id));
    if (question.photo) return setPhotoFor(question.id);
    next(updated);
  }

  /** "Preskoči": no answer is kept, the nurse sees it as skipped (T-94). */
  function skip(question: QuestionView) {
    const updated = { ...answers };
    delete updated[question.id];
    setAnswers(updated);
    setSkipped((s) => (s.includes(question.id) ? s : [...s, question.id]));
    next(updated);
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

  if (side === "other") {
    return (
      <OtherProblem
        onConfirm={() => {
          setOtherProblem(true);
          setSide(undefined);
        }}
        onBack={() => setSide(undefined)}
      />
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

      <HelpRow
        onBack={index > 0 ? () => setIndex(index - 1) : undefined}
        onSkip={canSkip(q) ? () => skip(q) : undefined}
        otherProblem={otherProblem}
        onOther={() => setSide("other")}
        onCancelOther={() => setOtherProblem(false)}
        onHelp={() => setSide("help")}
      />

      {side === "help" && (
        <EmergencyScreen
          emergency={NUJNA_POMOC}
          backLabel="Nazaj na vprašanje"
          onContinue={() => setSide(undefined)}
          onBack={() => setSide(undefined)}
        />
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
