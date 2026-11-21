"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Labelled text input, 48 px+ high. */
export function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-lg font-semibold">
      {props.label}
      <input
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="min-h-12 rounded-lg border-2 border-input px-3 text-xl font-normal"
      />
      {props.hint && <span className="text-base font-normal text-muted-foreground">{props.hint}</span>}
    </label>
  );
}

/** Toggle chip with a pressed state that is visible without colour (✓). */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-12 rounded-full border-2 px-4 text-lg font-semibold",
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
      )}
    >
      {on && "✓ "}
      {children}
    </button>
  );
}

export function StepTitle({ n, total, children }: { n: number; total: number; children: ReactNode }) {
  return (
    <div>
      <p className="text-lg font-semibold text-muted-foreground">
        Korak {n} od {total}
      </p>
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
      {children}
    </p>
  );
}
