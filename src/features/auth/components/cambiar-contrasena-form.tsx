"use client";

import { useActionState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { cambiarContrasena } from "../actions";

export function CambiarContrasenaForm({ temporal }: { temporal: boolean }) {
  const [state, formAction] = useActionState(cambiarContrasena, undefined);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      <Field
        id="actual"
        label={temporal ? "Contraseña temporal" : "Contraseña actual"}
        error={state?.fieldErrors?.actual}
      >
        <PasswordInput name="actual" autoComplete="current-password" required className="h-12" />
      </Field>
      <Field
        id="nueva"
        label="Nueva contraseña"
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
        error={state?.fieldErrors?.nueva}
      >
        <PasswordInput name="nueva" autoComplete="new-password" required className="h-12" />
      </Field>
      <Field
        id="confirmar"
        label="Confirma la nueva contraseña"
        error={state?.fieldErrors?.confirmar}
      >
        <PasswordInput name="confirmar" autoComplete="new-password" required className="h-12" />
      </Field>
      <SubmitButton size="lg" className="mt-2 h-[52px] text-base font-extrabold" pendingText="Guardando…">
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
