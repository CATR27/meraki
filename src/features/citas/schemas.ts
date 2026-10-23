import { z } from "zod";
import { MODALIDADES } from "@/db/schema";
import { esFechaISO, esHora } from "@/lib/agenda";
import { checkbox, optionalText, requiredInt } from "@/lib/validation";

export const citaSchema = z
  .object({
    consultanteId: z.string().min(1, "Elige a un consultante."),
    fecha: z.string().refine(esFechaISO, "Elige una fecha."),
    hora: z.string().refine(esHora, "Elige una hora."),
    duracionMin: requiredInt(15, 240),
    modalidad: z.enum(MODALIDADES, { error: "Elige la modalidad." }),
    enlaceVideollamada: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .pipe(z.url({ error: "Escribe un enlace válido (https://…)." }).nullable())
      .nullish(),
    notas: optionalText(500),
    enviarConfirmacion: checkbox,
  })
  .transform((data) => ({
    ...data,
    enlaceVideollamada: data.modalidad === "en_linea" ? data.enlaceVideollamada : null,
  }));

export type CitaInput = z.infer<typeof citaSchema>;
