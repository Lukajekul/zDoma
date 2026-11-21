"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { setPassword, type FormState } from "../actions";
import { FormError, PasswordField } from "./fields";

/** Two password fields and one button: the patient's own password after the first QR scan. */
export function SetPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setPassword, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <PasswordField label="Novo geslo" hint="Vsaj 8 znakov" autoComplete="new-password" />
      <PasswordField label="Ponovite geslo" name="password_repeat" autoComplete="new-password" />
      <BigButton type="submit" disabled={pending}>
        {pending ? "Shranjujem …" : "Shrani geslo"}
      </BigButton>
    </form>
  );
}
