"use client";

import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { FormSection } from "@/components/shared/form-section";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import type { Credenciales as CredencialesData } from "../actions";
import { CamposProfesionales } from "./campos-profesionales";
import { Credenciales } from "./credenciales";

type Valores = Partial<Record<string, string | number | null>>;
type Accion<T> = (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>;

type PsicologoFormProps =
  | { modo: "crear"; action: Accion<CredencialesData>; defaults?: undefined }
  | { modo: "editar"; action: Accion<undefined>; defaults: Valores };

export function PsicologoForm(props: PsicologoFormProps) {
  // Cambiar la key reinicia el formulario para "crear otra cuenta".
  const [intento, setIntento] = useState(0);
  return <Formulario key={intento} {...props} onReiniciar={() => setIntento((n) => n + 1)} />;
}

function Formulario({
  modo,
  action,
  defaults,
  onReiniciar,
}: PsicologoFormProps & { onReiniciar: () => void }) {
  const [state, formAction] = useActionState(
    action as Accion<CredencialesData | undefined>,
    undefined,
  );
  const err = state?.fieldErrors;
  const v = (campo: string) => String(state?.values?.[campo] ?? defaults?.[campo] ?? "");

  if (modo === "crear" && state?.ok && state.data) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="grid gap-6">
          <div className="flex items-start gap-3">
            <CircleCheckIcon className="mt-1 size-6 shrink-0 text-success" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold">{state.message}</h2>
              <p className="text-muted-foreground">Comparte estas credenciales de acceso.</p>
            </div>
          </div>
          <Credenciales data={state.data} />
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/psicologos">Ir al listado</Link>
            </Button>
            <Button variant="outline" onClick={onReiniciar}>
              Crear otra cuenta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} noValidate>
          <FormMessage state={state} className="mb-6" />

          <FormSection
            title="Cuenta"
            description="Con este correo ingresará a Meraki y recibirá sus credenciales."
          >
            <Field id="name" label="Nombre completo" required error={err?.name}>
              <Input name="name" autoComplete="off" defaultValue={v("name")} maxLength={120} />
            </Field>
            <Field id="email" label="Correo electrónico" required error={err?.email}>
              <Input name="email" type="email" autoComplete="off" defaultValue={v("email")} />
            </Field>
          </FormSection>

          <CamposProfesionales v={v} err={err} />

          <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-6">
            <Button variant="ghost" asChild>
              <Link href="/admin/psicologos">Cancelar</Link>
            </Button>
            <SubmitButton pendingText="Guardando…">
              {modo === "crear" ? "Crear cuenta" : "Guardar cambios"}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
