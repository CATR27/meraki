"use client";

import { PlusIcon } from "lucide-react";
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
    <form action={formAction} noValidate className="grid gap-4">
      <Field id="titulo" label="¿Qué necesitas recordar?" required error={err?.titulo}>
        <Input
          name="titulo"
          placeholder="Enviar informe, llamar a la escuela…"
          defaultValue={v("titulo")}
          maxLength={120}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="fecha" label="Fecha" required error={err?.fecha}>
          <Input name="fecha" type="date" defaultValue={v("fecha", hoy)} />
        </Field>
        <Field id="hora" label="Hora" required error={err?.hora}>
          <Input name="hora" type="time" step={300} defaultValue={v("hora", horaSugerida)} />
        </Field>
      </div>
      <Field id="consultanteId" label="Relacionado con (opcional)" error={err?.consultanteId}>
        <NativeSelect name="consultanteId" defaultValue={v("consultanteId")}>
          <option value="">Ningún consultante</option>
          {consultantes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.apellidos}, {c.nombre}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field id="descripcion" label="Detalles (opcional)" error={err?.descripcion}>
        <Textarea name="descripcion" defaultValue={v("descripcion")} className="min-h-20" />
      </Field>
      <SubmitButton pendingText="Guardando…">
        <PlusIcon /> Agregar recordatorio
      </SubmitButton>
    </form>
  );
}
