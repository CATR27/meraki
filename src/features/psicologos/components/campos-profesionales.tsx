import { Field } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import { NativeSelect } from "@/components/shared/native-select";
import { Input } from "@/components/ui/input";
import { DEFAULT_TZ } from "@/lib/dates";
import { ZONAS_HORARIAS } from "@/lib/zonas";

type CamposProps = {
  /** Valor por defecto de cada campo. */
  v: (campo: string) => string;
  err?: Record<string, string[] | undefined>;
  /** Texto de la sección profesional (cambia entre admin y perfil propio). */
  descripcion?: string;
};

/** Secciones "Datos profesionales" y "Consultorio y agenda", compartidas por admin y perfil. */
export function CamposProfesionales({ v, err, descripcion }: CamposProps) {
  return (
    <>
      <FormSection
        title="Datos profesionales"
        description={descripcion ?? "Aparecen en el perfil y en los documentos del expediente."}
      >
        <Field
          id="cedulaProfesional"
          label="Cédula profesional"
          required
          error={err?.cedulaProfesional}
        >
          <Input name="cedulaProfesional" defaultValue={v("cedulaProfesional")} maxLength={30} />
        </Field>
        <Field id="especialidad" label="Especialidad" error={err?.especialidad}>
          <Input
            name="especialidad"
            placeholder="Psicología clínica"
            defaultValue={v("especialidad")}
          />
        </Field>
        <Field id="enfoqueTerapeutico" label="Enfoque terapéutico" error={err?.enfoqueTerapeutico}>
          <Input
            name="enfoqueTerapeutico"
            placeholder="Cognitivo-conductual, humanista…"
            defaultValue={v("enfoqueTerapeutico")}
          />
        </Field>
        <Field id="universidad" label="Universidad" error={err?.universidad}>
          <Input name="universidad" defaultValue={v("universidad")} />
        </Field>
        <Field id="telefono" label="Teléfono" error={err?.telefono}>
          <Input name="telefono" type="tel" autoComplete="off" defaultValue={v("telefono")} />
        </Field>
      </FormSection>

      <FormSection title="Consultorio y agenda" description="Valores por defecto al agendar citas.">
        <Field
          id="direccionConsultorio"
          label="Dirección del consultorio"
          error={err?.direccionConsultorio}
          className="sm:col-span-2"
        >
          <Input name="direccionConsultorio" defaultValue={v("direccionConsultorio")} />
        </Field>
        <Field
          id="duracionSesionMin"
          label="Duración de sesión (minutos)"
          required
          error={err?.duracionSesionMin}
        >
          <Input
            name="duracionSesionMin"
            type="number"
            inputMode="numeric"
            min={15}
            max={240}
            step={5}
            defaultValue={v("duracionSesionMin") || "50"}
          />
        </Field>
        <Field id="costoSesion" label="Costo por sesión (MXN)" error={err?.costoSesion}>
          <Input
            name="costoSesion"
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            defaultValue={v("costoSesion")}
          />
        </Field>
        <Field
          id="zonaHoraria"
          label="Zona horaria"
          required
          error={err?.zonaHoraria}
          className="sm:col-span-2"
        >
          <NativeSelect name="zonaHoraria" defaultValue={v("zonaHoraria") || DEFAULT_TZ}>
            {ZONAS_HORARIAS.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </FormSection>
    </>
  );
}
