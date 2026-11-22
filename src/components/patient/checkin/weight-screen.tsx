"use client";

import { useState } from "react";
import { BigButton } from "@/components/shell";
import { formatNumber } from "@/lib/format";
import type { Mark } from "@/app/patient/_lib/answer-change";
import { WithChange } from "./change-mark";

type Props = { options: number[]; changes?: (Mark | null)[]; onAnswer: (kg: number) => void };

/** Weight as big buttons around the last weight; "Drugo" opens a number field. */
export function WeightScreen({ options, changes, onAnswer }: Props) {
  const [other, setOther] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(false);

  if (other) {
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(text.replace(",", "."));
          if (!Number.isFinite(n) || n < 20 || n > 300) return setError(true);
          onAnswer(Math.round(n * 10) / 10);
        }}
      >
        <label htmlFor="teza" className="text-xl font-semibold">
          Vpišite težo v kilogramih
        </label>
        <input
          id="teza"
          inputMode="decimal"
          autoFocus
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(false);
          }}
          className="min-h-16 rounded-2xl border-2 border-border bg-card px-4 text-3xl font-bold"
          placeholder="npr. 72,5"
        />
        {error && <p role="alert" className="text-lg font-semibold text-status-rdece">Vpišite število, npr. 72,5.</p>}
        <BigButton type="submit">Potrdi</BigButton>
        <BigButton variant="secondary" onClick={() => setOther(false)}>
          Nazaj na gumbe
        </BigButton>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((kg, i) => (
          <BigButton key={kg} variant="choice" onClick={() => onAnswer(kg)} className="px-2 text-2xl">
            <WithChange change={changes?.[i]}>{formatNumber(kg)} kg</WithChange>
          </BigButton>
        ))}
      </div>
      <BigButton variant="choice" onClick={() => setOther(true)}>
        Drugo
      </BigButton>
    </div>
  );
}
