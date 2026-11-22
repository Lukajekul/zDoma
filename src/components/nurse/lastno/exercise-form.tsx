"use client";

import { useState } from "react";
import { BigButton } from "@/components/shell";
import type { LastnaVaja } from "@/lib/templates";
import { NAJVEC_KORAKOV, novId, preveriLastnoVajo } from "@/lib/templates/lastno";
import { ErrorText, Field } from "@/components/nurse/odpust/ui";

type Props = { initial?: LastnaVaja; onSave: (v: LastnaVaja) => void; onCancel: () => void };

/** T-69: add or edit one of the doctor's own exercises (title, 1–4 steps, repetitions). */
export function ExerciseForm({ initial, onSave, onCancel }: Props) {
  const [naslov, setNaslov] = useState(initial?.naslov ?? "");
  const [koraki, setKoraki] = useState<string[]>(initial?.koraki ?? [""]);
  const [ponovitve, setPonovitve] = useState(initial?.ponovitve ?? "");
  const [poskus, setPoskus] = useState(false);

  const v: LastnaVaja = { id: initial?.id ?? "", naslov, koraki, ponovitve };
  const napake = preveriLastnoVajo({ ...v, id: v.id || "lastna-preveri" });

  function shrani() {
    setPoskus(true);
    if (napake.length) return;
    onSave({ ...v, id: v.id || novId("lastna") });
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 border-primary bg-card p-4">
      <Field label="Ime vaje" value={naslov} onChange={setNaslov} hint="Npr. »Dvigovanje pete«" />
      {koraki.map((k, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={`Korak ${i + 1}`} value={k} onChange={(x) => setKoraki(koraki.map((y, j) => (j === i ? x : y)))} />
          </div>
          {koraki.length > 1 && (
            <button
              type="button"
              onClick={() => setKoraki(koraki.filter((_, j) => j !== i))}
              className="min-h-12 rounded-xl bg-muted px-3 text-lg font-semibold"
            >
              Odstrani
            </button>
          )}
        </div>
      ))}
      {koraki.length < NAJVEC_KORAKOV && (
        <BigButton variant="secondary" onClick={() => setKoraki([...koraki, ""])}>
          Dodaj korak
        </BigButton>
      )}
      <Field label="Ponovitve ali čas" value={ponovitve} onChange={setPonovitve} hint="Npr. »10-krat, 2-krat na dan«" />
      {poskus && <ErrorText>{napake.join(" ")}</ErrorText>}
      <BigButton onClick={shrani}>{initial ? "Shrani vajo" : "Dodaj vajo"}</BigButton>
      <BigButton variant="secondary" onClick={onCancel}>Prekliči</BigButton>
    </div>
  );
}
