"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "min-h-14 w-full rounded-xl border-2 border-border bg-card px-4 text-lg text-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

type FieldProps = { label: string; hint?: string } & Omit<ComponentProps<"input">, "className">;

/** Big labelled input (AGENTS.md §7: ≥18 px text, ≥48 px tall). */
export function Field({ label, hint, id, name, ...props }: FieldProps) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      {hint && (
        <p id={`${inputId}-hint`} className="-mt-1 text-base text-muted-foreground">
          {hint}
        </p>
      )}
      <input
        id={inputId}
        name={name}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        className={inputClass}
        {...props}
      />
    </div>
  );
}

export function DavcnaField({ defaultValue }: { defaultValue?: string }) {
  return (
    <Field
      label="Davčna številka"
      hint="8 številk"
      name="davcna"
      inputMode="numeric"
      autoComplete="username"
      maxLength={9}
      required
      defaultValue={defaultValue}
    />
  );
}

/** Password with a labelled "Pokaži geslo" toggle (no icon-only button). */
export function PasswordField({ label = "Geslo", name = "password", autoComplete, hint }: { label?: string; name?: string; autoComplete: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Field
        label={label}
        hint={hint}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "min-h-12 self-start rounded-lg px-2 text-lg font-semibold text-primary underline underline-offset-4",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        {visible ? "Skrij geslo" : "Pokaži geslo"}
      </button>
    </div>
  );
}

/** Error box that screen readers announce. Says what to do next. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-lg font-semibold">
      {message}
    </p>
  );
}
