"use client";

import { useActionState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { FormSection } from "@/components/shared/form-section";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import type { Rol } from "@/db/schema";
import { CamposProfesionales } from "@/features/psicologos/components/campos-profesionales";
import { actualizarPerfil } from "../actions";

type Valores = Partial<Record<string, string | number | null>>;

export function PerfilForm({ rol, defaults }: { rol: Rol; defaults: Valores }) {
  const [state, formAction] = useActionState(actualizarPerfil, undefined);
  const err = state?.fieldErrors;
  const v = (campo: string) => String(state?.values?.[campo] ?? defaults[campo] ?? "");

  return (
    <form action={formAction} noValidate>
      <FormMessage state={state} className="mb-6" />
      <FormSection
        title="Cuenta"
        description="Para cambiar tu correo de acceso, contacta a la administración."
      >
        <Field id="name" label="Nombre completo" required error={err?.name}>
          <Input name="name" defaultValue={v("name")} maxLength={120} autoComplete="name" />
        </Field>
        <Field id="email" label="Correo electrónico">
          <Input value={v("email")} disabled readOnly />
        </Field>
      </FormSection>

      {rol === "psicologo" && (
        <CamposProfesionales
          v={v}
          err={err}
          descripcion="Aparecen en tu perfil y en los documentos del expediente."
        />
      )}

      <div className="flex justify-end border-t border-border/70 pt-6">
        <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
