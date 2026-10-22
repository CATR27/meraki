import { z } from "zod";
import { emailSchema, optionalInt, optionalText, requiredInt } from "@/lib/validation";
import { ZONA_VALUES } from "@/lib/zonas";

/** Datos profesionales que también puede editar el propio psicólogo en su perfil. */
export const datosProfesionalesSchema = z.object({
  name: z.string().trim().min(3, "Escribe el nombre completo.").max(120, "Máximo 120 caracteres."),
  cedulaProfesional: z
    .string()
    .trim()
    .min(4, "Escribe la cédula profesional.")
    .max(30, "Máximo 30 caracteres."),
  especialidad: optionalText(120),
  enfoqueTerapeutico: optionalText(120),
  universidad: optionalText(160),
  telefono: optionalText(30),
  direccionConsultorio: optionalText(300),
  duracionSesionMin: requiredInt(15, 240),
  costoSesion: optionalInt(0, 1_000_000),
  zonaHoraria: z.enum(ZONA_VALUES, { error: "Elige una zona horaria." }),
});

export const psicologoSchema = datosProfesionalesSchema.extend({ email: emailSchema });

export type PsicologoInput = z.infer<typeof psicologoSchema>;
