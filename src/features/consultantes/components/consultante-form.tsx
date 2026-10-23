"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { FormSection } from "@/components/shared/form-section";
import { NativeSelect } from "@/components/shared/native-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTADOS_CONSULTANTE, SEXOS } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { ESTADO_CONSULTANTE_LABEL, SEXO_LABEL } from "../schemas";

type Valores = Partial<Record<string, string | number | boolean | Date | null>>;
type Accion = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ConsultanteForm({
  action,
  defaults = {},
  cancelarHref,
  modo,
  hoy,
}: {
  action: Accion;
  defaults?: Valores;
  cancelarHref: string;
  modo: "crear" | "editar";
  /** Fecha de hoy (YYYY-MM-DD) en la zona del consultorio, para limitar fechas futuras. */
  hoy: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const err = state?.fieldErrors;
  const v = (campo: string) => {
    const valor = state?.values?.[campo] ?? defaults[campo];
    return valor == null || typeof valor === "boolean" ? "" : String(valor);
  };
  const [consentimiento, setConsentimiento] = useState(
    state?.values
      ? state.values.consentimientoInformado === "on"
      : Boolean(defaults.consentimientoInformado),
  );

  return (
    <Card>
      <CardContent>
        <form action={formAction} noValidate>
          <FormMessage state={state} className="mb-6" />

          <FormSection title="Identificación" description="Datos de la ficha de identificación.">
            <Field id="nombre" label="Nombre(s)" required error={err?.nombre}>
              <Input name="nombre" defaultValue={v("nombre")} autoComplete="off" maxLength={80} />
            </Field>
            <Field id="apellidos" label="Apellidos" required error={err?.apellidos}>
              <Input
                name="apellidos"
                defaultValue={v("apellidos")}
                autoComplete="off"
                maxLength={80}
              />
            </Field>
            <Field id="fechaNacimiento" label="Fecha de nacimiento" error={err?.fechaNacimiento}>
              <Input
                name="fechaNacimiento"
                type="date"
                max={hoy}
                defaultValue={v("fechaNacimiento")}
              />
            </Field>
            <Field id="sexo" label="Sexo" error={err?.sexo}>
              <NativeSelect name="sexo" defaultValue={v("sexo")}>
                <option value="">Sin especificar</option>
                {SEXOS.map((s) => (
                  <option key={s} value={s}>
                    {SEXO_LABEL[s]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="estadoCivil" label="Estado civil" error={err?.estadoCivil}>
              <Input name="estadoCivil" defaultValue={v("estadoCivil")} />
            </Field>
            <Field id="ocupacion" label="Ocupación" error={err?.ocupacion}>
              <Input name="ocupacion" defaultValue={v("ocupacion")} />
            </Field>
            <Field id="escolaridad" label="Escolaridad" error={err?.escolaridad}>
              <Input name="escolaridad" defaultValue={v("escolaridad")} />
            </Field>
          </FormSection>

          <FormSection
            title="Contacto"
            description="El correo se usa para enviar confirmaciones de cita."
          >
            <Field id="telefono" label="Teléfono" error={err?.telefono}>
              <Input name="telefono" type="tel" autoComplete="off" defaultValue={v("telefono")} />
            </Field>
            <Field id="email" label="Correo electrónico" error={err?.email}>
              <Input name="email" type="email" autoComplete="off" defaultValue={v("email")} />
            </Field>
            <Field
              id="direccion"
              label="Dirección"
              error={err?.direccion}
              className="sm:col-span-2"
            >
              <Input name="direccion" defaultValue={v("direccion")} />
            </Field>
          </FormSection>

          <FormSection
            title="Contacto de emergencia"
            description="Persona a quien llamar en caso de riesgo o urgencia."
          >
            <Field
              id="contactoEmergenciaNombre"
              label="Nombre"
              error={err?.contactoEmergenciaNombre}
            >
              <Input name="contactoEmergenciaNombre" defaultValue={v("contactoEmergenciaNombre")} />
            </Field>
            <Field
              id="contactoEmergenciaParentesco"
              label="Parentesco"
              error={err?.contactoEmergenciaParentesco}
            >
              <Input
                name="contactoEmergenciaParentesco"
                defaultValue={v("contactoEmergenciaParentesco")}
              />
            </Field>
            <Field
              id="contactoEmergenciaTelefono"
              label="Teléfono"
              error={err?.contactoEmergenciaTelefono}
            >
              <Input
                name="contactoEmergenciaTelefono"
                type="tel"
                defaultValue={v("contactoEmergenciaTelefono")}
              />
            </Field>
          </FormSection>

          <FormSection title="Administrativo">
            <Field id="referidoPor" label="Referido por" error={err?.referidoPor}>
              <Input
                name="referidoPor"
                placeholder="Médico, escuela, otro consultante…"
                defaultValue={v("referidoPor")}
              />
            </Field>
            {modo === "editar" && (
              <Field id="estado" label="Estado del proceso" error={err?.estado}>
                <NativeSelect name="estado" defaultValue={v("estado") || "activo"}>
                  {ESTADOS_CONSULTANTE.map((e) => (
                    <option key={e} value={e}>
                      {ESTADO_CONSULTANTE_LABEL[e]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            )}
            <div className="flex items-start gap-3 rounded-xl border border-tint-3 bg-tint p-4 sm:col-span-2">
              <Checkbox
                id="consentimientoInformado"
                name="consentimientoInformado"
                value="on"
                checked={consentimiento}
                onCheckedChange={(c) => setConsentimiento(c === true)}
                className="mt-0.5"
              />
              <div className="grid flex-1 gap-3">
                <Label htmlFor="consentimientoInformado" className="leading-snug font-semibold">
                  El consultante firmó el consentimiento informado
                </Label>
                {consentimiento && (
                  <Field
                    id="consentimientoFecha"
                    label="Fecha de firma"
                    error={err?.consentimientoFecha}
                    className="max-w-60"
                  >
                    <Input
                      name="consentimientoFecha"
                      type="date"
                      max={hoy}
                      defaultValue={v("consentimientoFecha") || hoy}
                    />
                  </Field>
                )}
              </div>
            </div>
          </FormSection>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-6">
            <Button variant="ghost" asChild>
              <Link href={cancelarHref}>Cancelar</Link>
            </Button>
            <SubmitButton pendingText="Guardando…">
              {modo === "crear" ? "Registrar y abrir expediente" : "Guardar cambios"}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
