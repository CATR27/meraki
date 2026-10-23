import { z } from "zod";
import { esFechaISO, esHora } from "@/lib/agenda";
import { optionalText } from "@/lib/validation";

export const recordatorioSchema = z.object({
  titulo: z.string().trim().min(1, "Escribe el recordatorio.").max(120, "Máximo 120 caracteres."),
  descripcion: optionalText(1000),
  fecha: z.string().refine(esFechaISO, "Elige una fecha."),
  hora: z.string().refine(esHora, "Elige una hora."),
  consultanteId: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .nullish(),
});
