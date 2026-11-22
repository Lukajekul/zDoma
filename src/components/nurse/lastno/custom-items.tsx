"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { LastnaVaja, LastnoVprasanje } from "@/lib/templates";
import { ExerciseForm } from "./exercise-form";
import { QuestionForm } from "./question-form";

const small = "min-h-12 rounded-xl bg-card px-4 text-lg font-semibold shadow-soft hover:bg-muted";

type ListProps<T> = {
  items: T[];
  onChange: (next: T[]) => void;
  /** Why nothing more can be added (e.g. the daily limit), or undefined. */
  blocked?: string;
};

function useEditor<T extends { id: string }>({ items, onChange }: ListProps<T>) {
  const [open, setOpen] = useState<"new" | string | null>(null);
  return {
    open,
    setOpen,
    save: (x: T) => {
      onChange(items.some((i) => i.id === x.id) ? items.map((i) => (i.id === x.id ? x : i)) : [...items, x]);
      setOpen(null);
    },
    remove: (id: string) => onChange(items.filter((i) => i.id !== id)),
  };
}

function Row({ title, lines, onEdit, onRemove }: { title: string; lines: string[]; onEdit: () => void; onRemove: () => void }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3">
      <span className="text-lg font-semibold">{title}</span>
      {lines.map((l, i) => (
        <span key={i} className="text-base text-muted-foreground">{l}</span>
      ))}
      <span className="flex flex-wrap gap-2">
        <button type="button" className={small} onClick={onEdit}>Uredi</button>
        <button type="button" className={small} onClick={onRemove}>Odstrani</button>
      </span>
    </li>
  );
}

/** T-69: the doctor's own check-in questions: list, add, edit, remove. */
export function CustomQuestions(props: ListProps<LastnoVprasanje>) {
  const e = useEditor(props);
  return (
    <div className="flex flex-col gap-3">
      {props.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {props.items.map((q) =>
            e.open === q.id ? (
              <li key={q.id}><QuestionForm initial={q} onSave={e.save} onCancel={() => e.setOpen(null)} /></li>
            ) : (
              <Row
                key={q.id}
                title={q.besedilo}
                lines={[
                  `Odgovori: ${q.odgovori.map((o) => o.besedilo).join(" / ")}`,
                  q.opozorilo
                    ? `Opozorilo ob »${q.odgovori.find((o) => o.id === q.opozorilo!.odgovor)?.besedilo}«: ${q.opozorilo.razlog}`
                    : "Brez opozorila",
                ]}
                onEdit={() => e.setOpen(q.id)}
                onRemove={() => e.remove(q.id)}
              />
            ),
          )}
        </ul>
      )}
      {e.open === "new" ? (
        <QuestionForm onSave={e.save} onCancel={() => e.setOpen(null)} />
      ) : props.blocked ? (
        <p className="text-lg text-muted-foreground">{props.blocked}</p>
      ) : (
        <BigButton variant="secondary" icon={<Plus />} onClick={() => e.setOpen("new")}>Dodaj svoje vprašanje</BigButton>
      )}
    </div>
  );
}

/** T-69: the doctor's own exercises: list, add, edit, remove. */
export function CustomExercises(props: ListProps<LastnaVaja>) {
  const e = useEditor(props);
  return (
    <div className="flex flex-col gap-3">
      {props.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {props.items.map((v) =>
            e.open === v.id ? (
              <li key={v.id}><ExerciseForm initial={v} onSave={e.save} onCancel={() => e.setOpen(null)} /></li>
            ) : (
              <Row
                key={v.id}
                title={v.naslov}
                lines={[...v.koraki.map((k, i) => `${i + 1}. ${k}`), v.ponovitve]}
                onEdit={() => e.setOpen(v.id)}
                onRemove={() => e.remove(v.id)}
              />
            ),
          )}
        </ul>
      )}
      {e.open === "new" ? (
        <ExerciseForm onSave={e.save} onCancel={() => e.setOpen(null)} />
      ) : props.blocked ? (
        <p className="text-lg text-muted-foreground">{props.blocked}</p>
      ) : (
        <BigButton variant="secondary" icon={<Plus />} onClick={() => e.setOpen("new")}>Dodaj svojo vajo</BigButton>
      )}
    </div>
  );
}
