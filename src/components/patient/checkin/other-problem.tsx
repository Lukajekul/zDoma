"use client";

import { BigButton } from "@/components/shell";

type Props = { onConfirm: () => void; onBack: () => void };

/** T-94: "Sporoči drugo težavo" – no typing, one tap asks the nurse to call. */
export function OtherProblem({ onConfirm, onBack }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl leading-snug font-extrabold tracking-tight">Imate težavo, ki je ni med odgovori?</h2>
        <p className="mt-3 text-xl">
          Sestri bomo sporočili, naj vas pokliče. Sporočilo gre skupaj z današnjim pregledom.
        </p>
      </div>
      <BigButton onClick={onConfirm}>Da, naj me sestra pokliče</BigButton>
      <BigButton variant="secondary" onClick={onBack}>
        Nazaj na vprašanje
      </BigButton>
      <p className="text-lg text-muted-foreground">Če vam je zelo slabo, ne čakajte: pokličite 112.</p>
    </div>
  );
}
