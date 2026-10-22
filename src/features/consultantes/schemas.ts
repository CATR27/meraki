import { z } from "zod";
import { ESTADOS_CONSULTANTE, SEXOS } from "@/db/schema";
import { checkbox, optionalDate, optionalEmail, optionalText } from "@/lib/validation";

export const SEXO_LABEL: Record<(typeof SEXOS)[number], string> = {
  femenino: "Femenino",
  masculino: "Masculino",
  otro: "Otro",
  prefiero_no_decir: "Prefiere no decir",
};

export const ESTADO_CONSULTANTE_LABEL: Record<(typeof ESTADOS_CONSULTANTE)[number], string> = {
  activo: "En proceso",
  alta: "Alta terapéutica",
  baja: "Baja",
};

const nombre = (campo: string) =>
  z.string().trim().min(1, `Escribe ${campo}.`).max(80, "Máximo 80 caracteres.");

export const consultanteSchema = z
  .object({
    nombre: nombre("el nombre"),
    apellidos: nombre("los apellidos"),
    fechaNacimiento: optionalDate({ noFutura: true }),
    sexo: z
      .union([z.enum(SEXOS), z.literal("")])
      .transform((v) => (v === "" ? null : v))
      .nullish(),
    estadoCivil: optionalText(40),
    ocupacion: optionalText(80),
    escolaridad: optionalText(80),
    telefono: optionalText(30),
    email: optionalEmail,
    direccion: optionalText(300),
    contactoEmergenciaNombre: optionalText(120),
    contactoEmergenciaParentesco: optionalText(40),
    contactoEmergenciaTelefono: optionalText(30),
    referidoPor: optionalText(120),
    consentimientoInformado: checkbox,
    consentimientoFecha: optionalDate({ noFutura: true }),
    estado: z.enum(ESTADOS_CONSULTANTE).optional(),
  })
  .transform((data) => ({
    ...data,
    // Sin consentimiento no se guarda una fecha de consentimiento.
    consentimientoFecha: data.consentimientoInformado ? data.consentimientoFecha : null,
  }));

export type ConsultanteInput = z.infer<typeof consultanteSchema>;

export const FILTROS_ESTADO = ["activo", "alta", "baja", "todos"] as const;
export type FiltroEstado = (typeof FILTROS_ESTADO)[number];
