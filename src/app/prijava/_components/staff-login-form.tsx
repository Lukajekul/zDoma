"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { loginStaff, type FormState } from "../actions";
import { Field, FormError, PasswordField } from "./fields";

/** Staff login (T-67): service email + password. */
export function StaffLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginStaff, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field
        key={state.values?.email}
        label="E-pošta"
        hint="Vaš službeni e-poštni naslov"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state.values?.email}
      />
      <PasswordField autoComplete="current-password" />
      <BigButton type="submit" disabled={pending}>
        {pending ? "Prijavljam …" : "Prijava za osebje"}
      </BigButton>
    </form>
  );
}
