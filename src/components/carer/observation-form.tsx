"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import type { Emergency } from "@/app/patient/_lib/checkin-plan";
import { carerAddObservation } from "@/app/carer/[rehabId]/opazanje/actions";
import { EmergencyScreen } from "@/components/patient/checkin/emergency-screen";
import { BigButton, bigButtonClass } from "@/components/shell";
import { NAJVEC_ZNAKOV_OPAZANJA } from "@/lib/templates/types";
import { cn } from "@/lib/utils";

/** One chip from the template's `opazanja`, with what tapping it means. */
export type ChipView = { id: string; text: string; alerting: boolean; emergency?: Emergency };

type Step = "chips" | "text" | "concern" | "done";
type Props = { rehabId: string; name: string; chips: ChipView[]; back: string };

/** T-73: chips → optional text → "Ali vas to skrbi?" (only when no chip raises an alert) → "Shranjeno ✓". */
export function ObservationForm({ rehabId, name, chips, back }: Props) {
  const [step, setStep] = useState<Step>("chips");
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [alerted, setAlerted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const chosen = chips.filter((c) => picked.includes(c.id));
  const askConcern = !chosen.some((c) => c.alerting);
  const hasContent = picked.length > 0 || note.trim().length > 0;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const fromChips = () => {
    const e = chosen.find((c) => c.emergency)?.emergency;
    if (e) setEmergency(e);
    else setStep("text");
  };

  const send = (concern: boolean) =>
    start(async () => {
      setError(null);
      const r = await carerAddObservation(rehabId, picked, note, concern);
      if (r.error) return setError(r.error);
      setAlerted(!!r.alerted);
      setStep("done");
    });

  if (emergency) {
    return (
      <EmergencyScreen
        emergency={emergency}
        continueLabel="Nadaljuj z opažanjem"
        backLabel="Nazaj – popravi izbiro"
        onContinue={() => {
          setEmergency(null);
          setStep("text");
        }}
        onBack={() => setEmergency(null)}
      />
    );
  }

  if (step === "done") {
    return (
      <>
        <p role="status" className="rounded-3xl border-2 border-status-zeleno bg-status-zeleno-bg p-5 text-2xl font-bold text-status-zeleno">
          Shranjeno ✓
        </p>
        <p className="text-xl">
          {alerted ? "Sestra bo opažanje pogledala." : "Sestra bo opažanje videla ob naslednjem pregledu podatkov."}
        </p>
        <BigButton href={back}>Nazaj</BigButton>
      </>
    );
  }

  const errorBox = error && (
    <p role="alert" className="rounded-3xl border-2 border-status-rdece bg-status-rdece-bg p-4 text-lg font-semibold text-status-rdece">
      {error}
    </p>
  );

  if (step === "chips") {
    return (
      <>
        <h2 className="text-2xl font-bold">Kaj ste opazili?</h2>
        <p className="text-lg">
          Izberite vse, kar velja za: <strong>{name}</strong>. Lahko tudi nič in na naslednjem koraku opišete z besedami.
        </p>
        <div className="flex flex-col gap-3">
          {chips.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.id)}
                className={cn(bigButtonClass(on ? "primary" : "choice"), "justify-start text-left")}
              >
                <span
                  aria-hidden
                  className={cn("grid size-8 shrink-0 place-items-center rounded-lg border-2", on ? "border-white bg-white text-primary" : "border-muted-foreground")}
                >
                  {on && <Check className="size-6" />}
                </span>
                <span>{c.text}</span>
              </button>
            );
          })}
        </div>
        <BigButton onClick={fromChips}>Naprej</BigButton>
      </>
    );
  }

  if (step === "text") {
    const left = NAJVEC_ZNAKOV_OPAZANJA - note.length;
    return (
      <>
        <h2 className="text-2xl font-bold">Želite kaj dopisati?</h2>
        <p className="rounded-3xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
          Tega nihče ne bere sproti. Če je nujno, pokličite 112.
        </p>
        <label className="flex flex-col gap-2 text-lg font-semibold">
          Opis (ni obvezno)
          <textarea
            value={note}
            maxLength={NAJVEC_ZNAKOV_OPAZANJA}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="rounded-xl border-2 border-input bg-card p-3 text-lg font-normal"
            placeholder="Na primer: Ponoči je večkrat vstal in bil zmeden."
          />
        </label>
        <p className={cn("text-lg", left < 20 && "font-semibold text-status-rumeno")} aria-live="polite">
          {note.length} / {NAJVEC_ZNAKOV_OPAZANJA} znakov
        </p>
        {errorBox}
        {askConcern ? (
          <BigButton onClick={() => setStep("concern")} disabled={!hasContent}>
            Naprej
          </BigButton>
        ) : (
          <BigButton onClick={() => send(false)} disabled={pending}>
            {pending ? "Pošiljam …" : "Pošlji"}
          </BigButton>
        )}
        {!hasContent && <p className="text-lg">Izberite opažanje ali ga opišite z besedami.</p>}
        <BigButton variant="secondary" onClick={() => setStep("chips")}>
          Nazaj
        </BigButton>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Ali vas to skrbi?</h2>
      <p className="text-lg">Če izberete »Da«, bo sestra opažanje pogledala prej.</p>
      {errorBox}
      <BigButton variant="choice" onClick={() => send(false)} disabled={pending}>
        Ne, samo v vednost
      </BigButton>
      <BigButton variant="choice" onClick={() => send(true)} disabled={pending}>
        Da, prosim, naj sestra pogleda
      </BigButton>
      {pending && <p role="status" className="text-lg">Pošiljam …</p>}
      <BigButton variant="secondary" onClick={() => setStep("text")}>
        Nazaj
      </BigButton>
    </>
  );
}
