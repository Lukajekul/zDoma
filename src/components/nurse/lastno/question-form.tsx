"use client";

import { useState } from "react";
import { BigButton } from "@/components/shell";
import type { LastnoVprasanje } from "@/lib/templates";
import { DA_NE, NAJVEC_ODGOVOROV, novId, preveriLastnoVprasanje } from "@/lib/templates/lastno";
import { Chip, ErrorText, Field } from "@/components/nurse/odpust/ui";

type Props = { initial?: LastnoVprasanje; onSave: (q: LastnoVprasanje) => void; onCancel: () => void };

const jeDaNe = (q?: LastnoVprasanje) => !q || (q.odgovori.length === 2 && q.odgovori.every((o, i) => o.id === DA_NE[i].id));

/** T-69: add or edit one of the doctor's own check-in questions (Da/Ne or 2–5 answers, optional red flag). */
export function QuestionForm({ initial, onSave, onCancel }: Props) {
  const [besedilo, setBesedilo] = useState(initial?.besedilo ?? "");
  const [daNe, setDaNe] = useState(jeDaNe(initial));
  const [odgovori, setOdgovori] = useState<string[]>(
    initial && !jeDaNe(initial) ? initial.odgovori.map((o) => o.besedilo) : ["", ""],
  );
  const [opozori, setOpozori] = useState<string | null>(initial?.opozorilo?.odgovor ?? null);
  const [razlog, setRazlog] = useState(initial?.opozorilo?.razlog ?? "");
  const [poskus, setPoskus] = useState(false);

  const seznam = daNe ? DA_NE : odgovori.map((b, i) => ({ id: `o${i + 1}`, besedilo: b }));
  const q: LastnoVprasanje = {
    id: initial?.id ?? "",
    besedilo,
    odgovori: seznam,
    ...(opozori && seznam.some((o) => o.id === opozori) ? { opozorilo: { odgovor: opozori, razlog } } : {}),
  };
  const napake = preveriLastnoVprasanje({ ...q, id: q.id || "lastno-preveri" });

  function shrani() {
    setPoskus(true);
    if (napake.length) return;
    onSave({ ...q, id: q.id || novId("lastno") });
  }

  function vrsta(v: boolean) {
    setDaNe(v);
    setOpozori(null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 border-primary bg-card p-4">
      <Field label="Vprašanje za pacienta" value={besedilo} onChange={setBesedilo} hint="Kratko in preprosto, npr. »Ali vas boli rana?«" />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-lg font-semibold">Odgovori</legend>
        <div className="flex flex-wrap gap-2">
          <Chip on={daNe} onClick={() => vrsta(true)}>Da / Ne</Chip>
          <Chip on={!daNe} onClick={() => vrsta(false)}>Več odgovorov</Chip>
        </div>
        {!daNe && (
          <>
            {odgovori.map((o, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label={`Odgovor ${i + 1}`} value={o} onChange={(v) => setOdgovori(odgovori.map((x, j) => (j === i ? v : x)))} />
                </div>
                {odgovori.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOdgovori(odgovori.filter((_, j) => j !== i));
                      setOpozori(null);
                    }}
                    className="min-h-12 rounded-xl bg-muted px-3 text-lg font-semibold"
                  >
                    Odstrani
                  </button>
                )}
              </div>
            ))}
            {odgovori.length < NAJVEC_ODGOVOROV && (
              <BigButton variant="secondary" onClick={() => setOdgovori([...odgovori, ""])}>
                Dodaj odgovor
              </BigButton>
            )}
          </>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-lg font-semibold">Opozorilo za sestro</legend>
        <div className="flex flex-wrap gap-2">
          <Chip on={!opozori} onClick={() => setOpozori(null)}>Brez opozorila</Chip>
          {seznam.map((o) => (
            <Chip key={o.id} on={opozori === o.id} onClick={() => setOpozori(o.id)}>
              Ob odgovoru »{o.besedilo || "…"}«
            </Chip>
          ))}
        </div>
        {opozori && (
          <Field label="Razlog, ki ga vidi sestra" value={razlog} onChange={setRazlog} hint="Npr. »Rana boli več kot včeraj«" />
        )}
      </fieldset>

      {poskus && <ErrorText>{napake.join(" ")}</ErrorText>}
      <BigButton onClick={shrani}>{initial ? "Shrani vprašanje" : "Dodaj vprašanje"}</BigButton>
      <BigButton variant="secondary" onClick={onCancel}>Prekliči</BigButton>
    </div>
  );
}
