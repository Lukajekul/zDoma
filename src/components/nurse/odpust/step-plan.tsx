"use client";

import { BigButton } from "@/components/shell";
import { vstaviVrednosti, type Predloga } from "@/lib/templates";
import { dailyCount } from "@/app/nurse/odpust/_lib/plan";
import { Field } from "./ui";

/** Step 2: which patient group (template). */
export function StepTemplate({ templates, value, onPick }: { templates: Predloga[]; value: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {templates.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={value === p.id}
          onClick={() => onPick(p.id)}
          className="flex min-h-16 flex-col items-start gap-1 rounded-3xl bg-card shadow-soft p-4 text-left hover:bg-muted aria-pressed:border-primary"
        >
          <span className="text-xl font-bold">
            {value === p.id && "✓ "}
            {p.ime}
          </span>
          <span className="text-lg text-muted-foreground">Privzeto {p.privzetoTrajanjeDni} dni</span>
        </button>
      ))}
    </div>
  );
}

type ValuesProps = {
  predloga: Predloga;
  values: Record<string, string>;
  questions: string[];
  onValues: (v: Record<string, string>) => void;
  onQuestions: (q: string[]) => void;
  onNext: () => void;
};

/** Step 3: the patient's own values (dry weight …) and which check-in questions they get. */
export function StepValues({ predloga, values, questions, onValues, onQuestions, onNext }: ValuesProps) {
  const daily = dailyCount(predloga, questions);
  const missing = predloga.vrednostiPacienta.some((v) => !(values[v.kljuc] ?? "").trim());
  const toggle = (id: string) => onQuestions(questions.includes(id) ? questions.filter((q) => q !== id) : [...questions, id]);

  return (
    <div className="flex flex-col gap-4">
      {predloga.vrednostiPacienta.map((v) => (
        <Field
          key={v.kljuc}
          label={`${v.oznaka}${v.enota ? ` (${v.enota})` : ""}`}
          inputMode={v.tip === "stevilo" ? "decimal" : "text"}
          value={values[v.kljuc] ?? ""}
          onChange={(x) => onValues({ ...values, [v.kljuc]: x })}
        />
      ))}

      <h3 className="mt-2 text-xl font-bold">Vprašanja za dnevni pregled</h3>
      <p className="text-lg text-muted-foreground">Izbranih dnevnih: {daily} od največ 6.</p>
      <ul className="flex flex-col gap-2">
        {predloga.vprasanja.map((q) => (
          <li key={q.id}>
            <label className="flex min-h-12 items-start gap-3 rounded-xl bg-card shadow-soft p-3 text-lg">
              <input type="checkbox" className="mt-1 size-6 shrink-0" checked={questions.includes(q.id)} onChange={() => toggle(q.id)} />
              <span>
                {vstaviVrednosti(q.besedilo, values)}
                <span className="block text-base text-muted-foreground">
                  {[q.vednoVprasaj && "vedno vprašano", q.pogostost === "tedensko" && "tedensko", q.opomba].filter(Boolean).join(" · ")}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {daily > 6 && <p role="alert" className="text-lg font-semibold text-status-rdece">Odznačite nekaj vprašanj: največ 6 na dan.</p>}
      <BigButton onClick={onNext} disabled={missing || daily > 6 || questions.length === 0}>
        Naprej
      </BigButton>
      {missing && <p className="text-lg text-muted-foreground">Izpolnite vse vrednosti zgoraj.</p>}
    </div>
  );
}
