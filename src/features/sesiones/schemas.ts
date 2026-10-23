import { z } from "zod";
import { NIVELES_RIESGO } from "@/db/schema";
import { optionalInt, optionalText } from "@/lib/validation";

export type NivelRiesgo = (typeof NIVELES_RIESGO)[number];

export const RIESGO_LABEL: Record<NivelRiesgo, string> = {
  ninguno: "Sin riesgo",
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

/** Campos de texto de la nota SOAP, con preguntas guía. */
export const CAMPOS_SOAP = [
  {
    campo: "subjetivo",
    label: "S · Subjetivo",
    guia: "Lo que el consultante reporta: cómo llega, qué trae hoy, cambios desde la última sesión.",
  },
  {
    campo: "objetivo",
    label: "O · Objetivo",
    guia: "Lo que observas: apariencia, afecto, conducta, lenguaje, resultados de pruebas.",
  },
  {
    campo: "analisis",
    label: "A · Análisis",
    guia: "Tu interpretación clínica: avances, patrones, hipótesis, relación con los objetivos.",
  },
  {
    campo: "plan",
    label: "P · Plan",
    guia: "Intervenciones realizadas y siguientes pasos para el proceso.",
  },
] as const;

export const notaSchema = z.object({
  subjetivo: optionalText(20_000),
  objetivo: optionalText(20_000),
  analisis: optionalText(20_000),
  plan: optionalText(20_000),
  tareasAsignadas: optionalText(5_000),
  observaciones: optionalText(5_000),
  estadoAnimo: optionalInt(1, 10),
  nivelRiesgo: z.enum(NIVELES_RIESGO).catch("ninguno"),
});

export type NotaInput = z.input<typeof notaSchema>;
export type NotaDatos = z.output<typeof notaSchema>;

/** Al cerrar la nota se exige un mínimo de contenido clínico. */
export function validarCierre(datos: NotaDatos): string | null {
  if (!datos.subjetivo && !datos.objetivo && !datos.analisis && !datos.plan) {
    return "Escribe al menos uno de los apartados S, O, A o P antes de finalizar.";
  }
  return null;
}
