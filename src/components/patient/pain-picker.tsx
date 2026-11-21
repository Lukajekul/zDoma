"use client";

/** One tap 0–10 pain scale with words at both ends (no slider, AGENTS.md §5a). */
export function PainPicker({ onPick, disabled }: { onPick: (pain: number) => void; disabled?: boolean }) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-2 text-xl font-semibold">Kako močno vas je bolelo med vajo?</legend>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            aria-label={n === 0 ? "0 – brez bolečine" : n === 10 ? "10 – najhujša bolečina" : String(n)}
            className="min-h-14 rounded-xl border-2 border-border text-2xl font-bold hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            {n}
          </button>
        ))}
      </div>
      <p className="flex justify-between text-lg text-muted-foreground">
        <span>0 = brez bolečine</span>
        <span>10 = najhujša</span>
      </p>
    </fieldset>
  );
}
