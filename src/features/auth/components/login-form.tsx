"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { ArrowRightIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { IconInput } from "@/components/shared/icon-input";
import { iniciarSesion } from "../actions";

export function LoginForm() {
  const [state, formAction] = useActionState(iniciarSesion, undefined);
  const desde = useSearchParams().get("desde") ?? "";

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="desde" value={desde} />
      <FormMessage state={state} />
      <Field id="email" label="Correo electrónico" error={state?.fieldErrors?.email}>
        <IconInput
          icon={MailIcon}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tucorreo@ejemplo.com"
          defaultValue={state?.values?.email}
          required
          autoFocus
        />
      </Field>
      <Field id="password" label="Contraseña" error={state?.fieldErrors?.password}>
        <PasswordInput
          icon={LockKeyholeIcon}
          name="password"
          autoComplete="current-password"
          required
          className="h-12"
        />
      </Field>
      <SubmitButton
        size="lg"
        className="mt-2 h-[52px] gap-2.5 text-base font-extrabold shadow-[0_14px_28px_-12px_rgba(101,52,168,0.65)] transition-transform hover:-translate-y-0.5"
        pendingText="Entrando…"
      >
        Iniciar sesión <ArrowRightIcon className="size-[18px]" />
      </SubmitButton>
    </form>
  );
}
