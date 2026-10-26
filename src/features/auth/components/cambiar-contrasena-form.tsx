"use client";

import { LockKeyholeIcon } from "lucide-react";
import { useActionState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { cn } from "@/lib/utils";
import { cambiarContrasena } from "../actions";
import { CampoAuth } from "./campo-auth";

type Props = {
  temporal: boolean;
  /** "oscuro" = pantalla de acceso (fondo con loto); "claro" = dentro de la app. */
  tono?: "claro" | "oscuro";
};

export function CambiarContrasenaForm({ temporal, tono = "claro" }: Props) {
  const [state, formAction] = useActionState(cambiarContrasena, undefined);
  const oscuro = tono === "oscuro";
  const err = state?.fieldErrors;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      {oscuro ? (
        <>
          <CampoAuth
            id="actual"
            name="actual"
            label={temporal ? "Contraseña temporal" : "Contraseña actual"}
            icon={LockKeyholeIcon}
            revelable
            autoComplete="current-password"
            error={err?.actual}
            required
          />
          <CampoAuth
            id="nueva"
            name="nueva"
            label="Nueva contraseña"
            icon={LockKeyholeIcon}
            revelable
            autoComplete="new-password"
            error={err?.nueva}
            required
          />
          <p className="-mt-3 text-xs text-lavanda-300">Mínimo 8 caracteres, con al menos una letra y un número.</p>
          <CampoAuth
            id="confirmar"
            name="confirmar"
            label="Confirma la nueva contraseña"
            icon={LockKeyholeIcon}
            revelable
            autoComplete="new-password"
            error={err?.confirmar}
            required
          />
        </>
      ) : (
        <>
          <Field
            id="actual"
            label={temporal ? "Contraseña temporal" : "Contraseña actual"}
            error={err?.actual}
          >
            <PasswordInput name="actual" autoComplete="current-password" required className="h-12" />
          </Field>
          <Field
            id="nueva"
            label="Nueva contraseña"
            hint="Mínimo 8 caracteres, con al menos una letra y un número."
            error={err?.nueva}
          >
            <PasswordInput name="nueva" autoComplete="new-password" required className="h-12" />
          </Field>
          <Field id="confirmar" label="Confirma la nueva contraseña" error={err?.confirmar}>
            <PasswordInput name="confirmar" autoComplete="new-password" required className="h-12" />
          </Field>
        </>
      )}
      <SubmitButton
        size="lg"
        className={cn(
          "mt-2 h-[52px] text-base font-extrabold",
          oscuro &&
            "h-[54px] bg-white text-lavanda-800 shadow-[0_18px_36px_-14px_rgba(201,174,240,0.75)] hover:bg-white hover:text-lavanda-800",
        )}
        pendingText="Guardando…"
      >
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
