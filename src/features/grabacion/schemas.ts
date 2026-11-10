import { z } from "zod";
import { NIVELES_RIESGO } from "@/db/schema";

export const HABLANTES = ["psicologo", "consultante"] as const;
export type Hablante = (typeof HABLANTES)[number];

export const HABLANTE_LABEL: Record<Hablante, string> = {
  psicologo: "Psicólogo",
  consultante: "Consultante",
};

/** Segmento de la transcripción ya ubicado en el tiempo de la sesión completa. */
export type Segmento = {
  inicioMs: number;
  finMs: number;
  texto: string;
  hablante: Hablante | null;
};

export type Transcripcion = { segmentos: Segmento[] };

/**
 * Lo que devuelve el modelo: dónde cambia quién habla y la nota SOAP propuesta. El texto de la
 * transcripción no pasa por el modelo (ya es literal de Whisper): pedirle que lo copiara hacía
 * que en sesiones largas la respuesta se cortara a medio JSON.
 */
export const propuestaIaSchema = z.object({
  cambiosHablante: z
    .array(
      z.object({
        indice: z.number().int().min(0).describe("Segmento numerado donde empieza a hablar."),
        hablante: z.enum(HABLANTES),
      }),
    )
    .describe(
      "Solo los segmentos donde cambia quién habla, en orden; el primero es el segmento 0. Cada segmento hereda el hablante del cambio anterior.",
    ),
  subjetivo: z.string().describe("Lo que el consultante reporta. Vacío si no hay información."),
  objetivo: z.string().describe("Lo observable en la sesión. Vacío si no hay información."),
  analisis: z.string().describe("Interpretación clínica breve. Vacío si no hay información."),
  plan: z.string().describe("Intervenciones y siguientes pasos. Vacío si no hay información."),
  tareasAsignadas: z.string().describe("Tareas que el psicólogo dejó. Vacío si no dejó ninguna."),
  observaciones: z.string().describe("Datos relevantes que no caben en S, O, A o P."),
  estadoAnimoSugerido: z.number().int().min(1).max(10).nullable(),
  nivelRiesgoSugerido: z.enum(NIVELES_RIESGO),
  justificacionRiesgo: z.string(),
});

export type PropuestaIa = z.infer<typeof propuestaIaSchema>;

/** La propuesta tal como se guarda: los hablantes ya van dentro de la transcripción. */
export type PropuestaGuardada = Omit<PropuestaIa, "cambiosHablante">;

/** Campos de texto de la propuesta que se pueden pasar a la nota. */
export const CAMPOS_PROPUESTA = [
  { campo: "subjetivo", label: "S · Subjetivo" },
  { campo: "objetivo", label: "O · Objetivo" },
  { campo: "analisis", label: "A · Análisis" },
  { campo: "plan", label: "P · Plan" },
  { campo: "tareasAsignadas", label: "Tareas asignadas" },
  { campo: "observaciones", label: "Observaciones" },
] as const;

type SegmentoFragmento = { texto: string; inicioSeg: number; finSeg: number };

/**
 * Une las transcripciones de cada fragmento en una sola línea de tiempo, desplazando cada
 * segmento según dónde empieza su fragmento. Descarta segmentos vacíos.
 */
export function unirFragmentos(
  fragmentos: { inicioMs: number; segmentos: SegmentoFragmento[] }[],
): Segmento[] {
  return [...fragmentos]
    .sort((a, b) => a.inicioMs - b.inicioMs)
    .flatMap((f) =>
      f.segmentos
        .map((s) => ({
          inicioMs: f.inicioMs + Math.round(s.inicioSeg * 1000),
          finMs: f.inicioMs + Math.round(s.finSeg * 1000),
          texto: s.texto.trim(),
          hablante: null,
        }))
        .filter((s) => s.texto.length > 0),
    );
}

/**
 * Asigna a cada segmento literal de Whisper el hablante del último cambio que el modelo marcó
 * en él o antes. Los segmentos previos al primer cambio quedan sin hablante (el psicólogo
 * puede corregir cualquiera desde la transcripción).
 */
export function asignarHablantes(
  segmentos: Segmento[],
  cambios: PropuestaIa["cambiosHablante"],
): Segmento[] {
  const enSegmento = new Map<number, Hablante>();
  for (const c of cambios) if (c.indice < segmentos.length) enSegmento.set(c.indice, c.hablante);

  let actual: Hablante | null = null;
  return segmentos.map((s, i) => {
    actual = enSegmento.get(i) ?? actual;
    return { ...s, hablante: actual };
  });
}

/** "[3] (01:12) texto" — formato compacto que recibe el modelo. */
export function segmentosParaModelo(segmentos: Segmento[]) {
  return segmentos
    .map((s, i) => {
      const seg = Math.floor(s.inicioMs / 1000);
      const t = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
      return `[${i}] (${t}) ${s.texto}`;
    })
    .join("\n");
}
