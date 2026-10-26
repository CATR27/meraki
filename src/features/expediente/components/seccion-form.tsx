"use client";

import { CheckIcon, CircleCheckIcon, CircleDotIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { guardarSeccionExpediente } from "../actions";
import type { SeccionExpediente } from "../secciones";

type Props = {
  consultanteId: string;
  seccion: SeccionExpediente;
  valores: Record<string, string | null>;
};

export function SeccionForm({ consultanteId, seccion, valores }: Props) {
  const [state, formAction] = useActionState(
    guardarSeccionExpediente.bind(null, consultanteId, seccion.id),
    undefined,
  );
  const [sucio, setSucio] = useState(false);
  const v = (campo: string) => state?.values?.[campo] ?? valores[campo] ?? "";

  return (
    <form
      action={(fd) => {
        setSucio(false);
        return formAction(fd);
      }}
      onInput={() => setSucio(true)}
      className="grid gap-5"
    >
      {state && !state.ok && <FormMessage state={state} />}
      {seccion.campos.map(({ campo, label, guia }) => (
        <Field
          key={campo}
          id={`${seccion.id}-${campo}`}
          label={label}
          hint={guia}
          error={state?.fieldErrors?.[campo]}
        >
          <Textarea
            name={campo}
            defaultValue={v(campo)}
            className="min-h-28 rounded-[18px] leading-relaxed placeholder-shown:bg-tint focus-visible:bg-card"
            maxLength={20_000}
          />
        </Field>
      ))}
      <div className="flex flex-wrap items-center gap-3.5">
        <SubmitButton pendingText="Guardando…">
          <CheckIcon aria-hidden="true" /> Guardar sección
        </SubmitButton>
        <span aria-live="polite" className="text-[13px]">
          {sucio ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
              <CircleDotIcon className="size-4" aria-hidden="true" /> Cambios sin guardar
            </span>
          ) : state?.ok ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-success">
              <CircleCheckIcon className="size-[15px]" aria-hidden="true" /> Guardado hace un momento
            </span>
          ) : null}
        </span>
      </div>
    </form>
  );
}
