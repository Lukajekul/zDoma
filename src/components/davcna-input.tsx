"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cleanDavcnaInput, davcnaError } from "@/lib/davcna";

type Props = {
  label?: string;
  hint?: string;
  name?: string;
  autoComplete?: string;
  /** Uncontrolled start value (forms that post FormData). */
  defaultValue?: string;
  /** Controlled mode: pass value + onChange. */
  value?: string;
  onChange?: (davcna: string) => void;
  /** Show the check error now, e.g. after "Naprej" was tapped outside a form. */
  showError?: boolean;
};

/**
 * The one davčna številka field (AGENTS.md §6): digits only, at most 8, check
 * digit verified before the surrounding form is submitted. On a bad number the
 * submit is stopped and a Slovenian error says what to do.
 */
export function DavcnaInput({
  label = "Davčna številka",
  hint = "8 števk",
  name = "davcna",
  autoComplete = "username",
  defaultValue,
  value,
  onChange,
  showError,
}: Props) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [own, setOwn] = useState(() => cleanDavcnaInput(defaultValue ?? ""));
  const [touched, setTouched] = useState(false);
  const current = value !== undefined ? cleanDavcnaInput(value) : own;
  const error = davcnaError(current);
  const visibleError = (touched || showError) && error ? error : undefined;

  // Stop the parent form (also noValidate forms with a server action) while the
  // number is wrong. React skips a form action whose submit was prevented.
  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onSubmit = (e: SubmitEvent) => {
      if (!davcnaError(ref.current?.value ?? "")) return;
      e.preventDefault();
      setTouched(true);
      ref.current?.focus();
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  function change(raw: string) {
    const next = cleanDavcnaInput(raw);
    if (value === undefined) setOwn(next);
    onChange?.(next);
  }

  const describedBy = [hint && `${id}-hint`, visibleError && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-bold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-base text-muted-foreground">
          {hint}
        </p>
      )}
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]{8}"
        maxLength={8}
        autoComplete={autoComplete}
        required
        value={current}
        onChange={(e) => change(e.target.value)}
        onPaste={(e) => {
          // maxLength would cut "1234 5678" before we strip the space, so clean it here.
          e.preventDefault();
          const el = e.currentTarget;
          const start = el.selectionStart ?? el.value.length;
          const end = el.selectionEnd ?? el.value.length;
          change(el.value.slice(0, start) + e.clipboardData.getData("text") + el.value.slice(end));
        }}
        onBlur={() => current.length > 0 && setTouched(true)}
        aria-invalid={visibleError ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="min-h-14 w-full rounded-xl border-2 border-border bg-card px-4 text-lg tracking-wider text-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-status-rdece"
      />
      {visibleError && (
        <p id={`${id}-error`} role="alert" className="text-lg font-semibold text-status-rdece">
          {visibleError}
        </p>
      )}
    </div>
  );
}
