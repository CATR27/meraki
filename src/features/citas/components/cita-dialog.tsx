"use client";

import { MapPinIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { NativeSelect } from "@/components/shared/native-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MODALIDADES } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { actualizarCita, type CitaGuardada, crearCita } from "../actions";
import { MODALIDAD_LABEL, type Modalidad } from "../constantes";

type OpcionConsultante = { id: string; nombre: string; apellidos: string; tieneEmail: boolean };

export type CitaDefaults = {
  consultanteId?: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  modalidad?: Modalidad;
  enlaceVideollamada?: string | null;
  notas?: string | null;
};

type Props = {
  consultantes: OpcionConsultante[];
  defaults: CitaDefaults;
  /** Si viene, el diálogo edita esa cita. */
  citaId?: string;
  cerrarHref: string;
};

export function CitaDialog({ consultantes, defaults, citaId, cerrarHref }: Props) {
  const router = useRouter();
  const cerrar = () => router.replace(cerrarHref, { scroll: false });

  const accion = citaId ? actualizarCita.bind(null, citaId) : crearCita;
  const [state, formAction] = useActionState(
    async (prev: ActionState<CitaGuardada>, fd: FormData) => {
      const res = await accion(prev, fd);
      if (res?.ok) {
        toast.success(res.message);
        cerrar();
      }
      return res;
    },
    undefined,
  );

  const v = (campo: keyof CitaDefaults) =>
    state?.values?.[campo] ?? (defaults[campo] == null ? "" : String(defaults[campo]));
  const err = state?.fieldErrors;

  const [consultanteId, setConsultanteId] = useState(v("consultanteId"));
  const [modalidad, setModalidad] = useState<Modalidad>(
    (v("modalidad") as Modalidad) || "presencial",
  );
  const [enviar, setEnviar] = useState(!citaId);
  const seleccionado = consultantes.find((c) => c.id === consultanteId);
  const puedeEnviar = Boolean(seleccionado?.tieneEmail);

  return (
    <Dialog open onOpenChange={(open) => !open && cerrar()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {citaId ? "Editar cita" : "Nueva cita"}
          </DialogTitle>
          <DialogDescription>
            {citaId
              ? "Si cambias el horario, la cita vuelve a quedar como programada."
              : "Agenda una sesión con uno de tus consultantes."}
          </DialogDescription>
        </DialogHeader>

        {consultantes.length === 0 ? (
          <div className="grid gap-4 py-2">
            <p className="text-muted-foreground">
              Para agendar necesitas al menos un consultante en proceso.
            </p>
            <Button asChild className="justify-self-start">
              <Link href="/consultantes/nuevo">Registrar consultante</Link>
            </Button>
          </div>
        ) : (
          <form action={formAction} noValidate className="grid gap-5">
            <FormMessage state={state?.ok ? undefined : state} />

            <Field id="consultanteId" label="Consultante" required error={err?.consultanteId}>
              <NativeSelect
                name="consultanteId"
                value={consultanteId}
                onChange={(e) => setConsultanteId(e.target.value)}
              >
                <option value="" disabled>
                  Elige a un consultante
                </option>
                {consultantes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.apellidos}, {c.nombre}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 [&>*]:min-w-0">
              <div className="col-span-2 sm:col-span-1">
                <Field id="fecha" label="Fecha" required error={err?.fecha}>
                  <Input name="fecha" type="date" defaultValue={v("fecha")} />
                </Field>
              </div>
              <Field id="hora" label="Hora" required error={err?.hora}>
                <Input name="hora" type="time" step={300} defaultValue={v("hora")} />
              </Field>
              <Field id="duracionMin" label="Duración (min)" required error={err?.duracionMin}>
                <Input
                  name="duracionMin"
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={240}
                  step={5}
                  defaultValue={v("duracionMin")}
                />
              </Field>
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-semibold text-ink">Modalidad</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODALIDADES.map((m) => {
                  const Icon = m === "presencial" ? MapPinIcon : VideoIcon;
                  return (
                    <label
                      key={m}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                        modalidad === m
                          ? "border-lavanda-500 bg-tint text-soft-foreground"
                          : "hover:border-lavanda-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="modalidad"
                        value={m}
                        checked={modalidad === m}
                        onChange={() => setModalidad(m)}
                        className="sr-only"
                      />
                      <Icon className="size-4" aria-hidden="true" />
                      {MODALIDAD_LABEL[m]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {modalidad === "en_linea" && (
              <Field
                id="enlaceVideollamada"
                label="Enlace de la videollamada"
                hint="Se incluirá en el correo de confirmación."
                error={err?.enlaceVideollamada}
              >
                <Input
                  name="enlaceVideollamada"
                  type="url"
                  placeholder="https://meet.google.com/…"
                  defaultValue={v("enlaceVideollamada")}
                />
              </Field>
            )}

            <Field
              id="notas"
              label="Notas administrativas"
              hint="Solo para ti (p. ej. pago, consultorio). No escribas información clínica aquí."
              error={err?.notas}
            >
              <Textarea
                name="notas"
                defaultValue={v("notas")}
                maxLength={500}
                className="min-h-20"
              />
            </Field>

            <label htmlFor="enviarConfirmacion" className="flex items-start gap-3 rounded-xl bg-tint p-3">
              <Checkbox
                id="enviarConfirmacion"
                name="enviarConfirmacion"
                value="on"
                checked={puedeEnviar && enviar}
                onCheckedChange={(c) => setEnviar(c === true)}
                disabled={!puedeEnviar}
                className="mt-0.5"
              />
              <div className="grid gap-0.5">
                <span className="text-sm leading-none font-semibold">
                  {citaId ? "Avisar al consultante por correo" : "Enviar confirmación por correo"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {seleccionado && !puedeEnviar
                    ? "Este consultante no tiene correo registrado."
                    : "Incluye un archivo para agregarla a su calendario."}
                </p>
              </div>
            </label>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={cerrar}>
                Cancelar
              </Button>
              <SubmitButton pendingText="Guardando…">
                {citaId ? "Guardar cambios" : "Agendar cita"}
              </SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
