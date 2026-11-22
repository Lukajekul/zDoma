"use client";

import { useState } from "react";
import { Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { StaffLoginForm } from "./staff-login-form";

type Who = "osebje" | "svojci";

const OPTIONS: { who: Who; label: string; hint: string; Icon: typeof Users }[] = [
  { who: "svojci", label: "Svojci", hint: "z davčno številko", Icon: Users },
  { who: "osebje", label: "Osebje", hint: "z e-pošto", Icon: Stethoscope },
];

/** "Kdo se prijavlja?": two big labelled buttons, then the matching form (T-67). */
export function LoginChooser() {
  const [who, setWho] = useState<Who | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-xl font-bold">Kdo se prijavlja?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map(({ who: value, label, hint, Icon }) => {
            const active = who === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setWho(value)}
                className={cn(
                  "flex min-h-16 items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left transition-colors",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground shadow-soft hover:bg-brand-soft",
                )}
              >
                <Icon aria-hidden className="size-7 shrink-0" />
                <span className="flex flex-col">
                  <span className="text-xl font-bold">{label}</span>
                  <span className={cn("text-base", active ? "text-primary-foreground" : "text-muted-foreground")}>{hint}</span>
                </span>
                {active && <span className="ml-auto text-xl font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </fieldset>
      {who === "osebje" && <StaffLoginForm />}
      {who === "svojci" && <LoginForm />}
    </div>
  );
}
