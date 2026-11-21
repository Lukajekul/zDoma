"use client";

import { BigButton } from "@/components/shell";
import { formatDate } from "@/lib/format";
import type { Predloga } from "@/lib/templates";
import { TIME_LABEL, type MedLine, type NurseOption, type suggestNurse } from "@/app/nurse/odpust/_lib/plan";
import { Field } from "./ui";

type ExProps = {
  predloga: Predloga;
  exercises: string[];
  start: string;
  end: string;
  onExercises: (ids: string[]) => void;
  onEnd: (d: string) => void;
  onNext: () => void;
};

/** Step 5: exercises (pre-ticked) and the end date (template default, can change). */
export function StepExercises({ predloga, exercises, start, end, onExercises, onEnd, onNext }: ExProps) {
  const toggle = (id: string) => onExercises(exercises.includes(id) ? exercises.filter((x) => x !== id) : [...exercises, id]);
  return (
    <div className="flex flex-col gap-4">
      {predloga.vajeOpomba && <p className="rounded-3xl bg-card shadow-soft p-4 text-lg">{predloga.vajeOpomba}</p>}
      {predloga.vaje.length === 0 && <p className="text-lg">Predloga nima vaj.</p>}
      <ul className="flex flex-col gap-2">
        {predloga.vaje.map((v) => (
          <li key={v.id}>
            <label className="flex min-h-12 items-start gap-3 rounded-xl bg-card shadow-soft p-3 text-lg">
              <input type="checkbox" className="mt-1 size-6 shrink-0" checked={exercises.includes(v.id)} onChange={() => toggle(v.id)} />
              <span>
                <strong>{v.naslov}</strong>
                <span className="block text-base text-muted-foreground">{v.ponovitve}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-lg">Začetek: {formatDate(start)} (danes)</p>
      <Field label="Konec rehabilitacije" type="date" value={end} onChange={onEnd} hint={`Privzeto ${predloga.privzetoTrajanjeDni} dni.`} />
      <BigButton onClick={onNext} disabled={!end || end < start}>Naprej</BigButton>
    </div>
  );
}

type NurseProps = {
  suggestion: ReturnType<typeof suggestNurse>;
  nurses: NurseOption[];
  nurseId: string | null;
  onPick: (id: string | null) => void;
  onNext: () => void;
};

/** Step 6: patronažna sestra by teren, one tap to confirm; otherwise pick or "Nedodeljeni". */
export function StepNurse({ suggestion, nurses, nurseId, onPick, onNext }: NurseProps) {
  return (
    <div className="flex flex-col gap-4">
      {suggestion ? (
        <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">
          Predlog: <strong>Patronažna sestra: {suggestion.nurse.name} ({suggestion.obcina})</strong>
          {suggestion.via && <span className="block text-lg">Nadomešča: {suggestion.via.name}</span>}
        </p>
      ) : (
        <p className="rounded-3xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
          Nobena patronažna sestra ne pokriva tega naslova. Izberite jo ali pustite »Nedodeljeni«.
        </p>
      )}
      <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Patronažna sestra">
        {[...nurses, null].map((n) => (
          <li key={n?.id ?? "none"}>
            <label className="flex min-h-12 items-center gap-3 rounded-xl bg-card shadow-soft p-3 text-lg">
              <input type="radio" name="nurse" className="size-6" checked={nurseId === (n?.id ?? null)} onChange={() => onPick(n?.id ?? null)} />
              {n ? `${n.name}${n.tereni.length ? ` – ${n.tereni.map((t) => t.obcina).join(", ")}` : ""}` : "Nedodeljeni (prevzame ga katera koli sestra)"}
            </label>
          </li>
        ))}
      </ul>
      <BigButton onClick={onNext}>{nurseId && nurseId === suggestion?.nurse.id ? "Potrdi predlog" : "Naprej"}</BigButton>
    </div>
  );
}

type ConfirmProps = {
  name: string;
  isNew: boolean;
  predloga: Predloga;
  questions: number;
  meds: MedLine[];
  exercises: number;
  start: string;
  end: string;
  nurse: string;
  saving: boolean;
  onConfirm: () => void;
};

/** Step 7: one summary, one button. */
export function StepConfirm(p: ConfirmProps) {
  const chosen = p.meds.filter((m) => m.selected);
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-lg">
        <dt className="text-muted-foreground">Pacient</dt>
        <dd>{p.name}{p.isNew && " (nov račun)"}</dd>
        <dt className="text-muted-foreground">Skupina</dt>
        <dd>{p.predloga.ime}</dd>
        <dt className="text-muted-foreground">Trajanje</dt>
        <dd>{formatDate(p.start)} – {formatDate(p.end)}</dd>
        <dt className="text-muted-foreground">Vprašanja</dt>
        <dd>{p.questions}</dd>
        <dt className="text-muted-foreground">Zdravila</dt>
        <dd>{chosen.length ? chosen.map((m) => `${m.name} ${m.dose} (${m.times.map((t) => TIME_LABEL[t]).join(", ") || "po potrebi"})`).join("; ") : "brez"}</dd>
        <dt className="text-muted-foreground">Vaje</dt>
        <dd>{p.exercises}</dd>
        <dt className="text-muted-foreground">Sestra</dt>
        <dd>{p.nurse}</dd>
      </dl>
      <BigButton onClick={p.onConfirm} disabled={p.saving}>{p.saving ? "Shranjujem …" : "Odpri rehabilitacijo"}</BigButton>
    </div>
  );
}
