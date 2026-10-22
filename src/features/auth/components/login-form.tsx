"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { iniciarSesion } from "../actions";

export function LoginForm() {
  const [state, formAction] = useActionState(iniciarSesion, undefined);
  const desde = useSearchParams().get("desde") ?? "";

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input type="hidden" name="desde" value={desde} />
      <FormMessage state={state} />
      <Field id="email" label="Correo electrónico" error={state?.fieldErrors?.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tucorreo@ejemplo.com"
          defaultValue={state?.values?.email}
          required
          autoFocus
          className="h-11"
        />
      </Field>
      <Field id="password" label="Contraseña" error={state?.fieldErrors?.password}>
        <PasswordInput name="password" autoComplete="current-password" required className="h-11" />
      </Field>
      <SubmitButton size="lg" className="mt-1 h-11 text-base" pendingText="Entrando…">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
