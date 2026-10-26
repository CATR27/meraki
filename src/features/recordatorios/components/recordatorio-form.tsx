"use client";

import { CalendarIcon, ClockIcon, PlusIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/shared/form-field";
import { NativeSelect } from "@/components/shared/native-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action-state";
import { crearRecordatorio } from "../actions";

type Props = {
  consultantes: { id: string; nombre: string; apellidos: string }[];
  hoy: string;
  horaSugerida: string;
};

export function RecordatorioForm(props: Props) {
  // Cambiar la key limpia el formulario tras crear uno.
  const [n, setN] = useState(0);
  return <Formulario key={n} {...props} onCreado={() => setN((x) => x + 1)} />;
}

function Formulario({
  consultantes,
  hoy,
  horaSugerida,
  onCreado,
}: Props & { onCreado: () => void }) {
  const [state, formAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const res = await crearRecordatorio(prev, fd);
    if (res?.ok) {
      toast.success(res.message);
      onCreado();
    }
    return res;
  }, undefined);
  const err = state?.fieldErrors;
  const v = (campo: string, def = "") => state?.values?.[campo] ?? def;

  return (
    <form action={formAction} noValidate className="relative grid gap-4">
      <Field id="titulo" label="Título" required error={err?.titulo}>
        <Input
          name="titulo"
          placeholder="Enviar informe, llamar a la escuela…"
          defaultValue={v("titulo")}
          maxLength={120}
          className="rounded-2xl"
        />
      </Field>
      <Field id="descripcion" label="Descripción (opcional)" error={err?.descripcion}>
        <Textarea
          name="descripcion"
          defaultValue={v("descripcion")}
          className="min-h-[60px] rounded-2xl placeholder-shown:bg-tint focus-visible:bg-card"
        />
      </Field>
      <div className="grid gap-3 @min-[560px]:grid-cols-2 @min-[900px]:grid-cols-1">
        <Field id="fecha" label="Fecha" required error={err?.fecha}>
          <div className="relative">
            <CalendarIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-[15px] -translate-y-1/2 text-accent" />
            <Input name="fecha" type="date" defaultValue={v("fecha", hoy)} className="min-w-0 rounded-2xl pl-9" />
          </div>
        </Field>
        <Field id="hora" label="Hora" required error={err?.hora}>
          <div className="relative">
            <ClockIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-[15px] -translate-y-1/2 text-accent" />
            <Input name="hora" type="time" step={300} defaultValue={v("hora", horaSugerida)} className="min-w-0 rounded-2xl pl-9" />
          </div>
        </Field>
      </div>
      <Field id="consultanteId" label="Consultante (opcional)" error={err?.consultanteId}>
        <NativeSelect name="consultanteId" defaultValue={v("consultanteId")}>
          <option value="">Ningún consultante</option>
          {consultantes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.apellidos}, {c.nombre}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <SubmitButton pendingText="Guardando…" size="lg" className="w-full font-extrabold">
        <PlusIcon /> Guardar recordatorio
      </SubmitButton>
    </form>
  );
}
