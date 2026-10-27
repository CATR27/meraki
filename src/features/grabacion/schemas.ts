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

/** Lo que devuelve el modelo: la transcripción por turnos de habla y la nota SOAP propuesta. */
export const propuestaIaSchema = z.object({
  turnos: z
    .array(
      z.object({
        indice: z.number().int().min(0).describe("Segmento numerado donde empieza el turno."),
        hablante: z.enum(HABLANTES),
        texto: z.string().describe("Texto literal del turno, sin resumir ni corregir."),
      }),
    )
    .describe("La transcripción completa dividida en turnos: un turno por cada cambio de hablante."),
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

/** La propuesta tal como se guarda: los turnos ya van dentro de la transcripción. */
export type PropuestaGuardada = Omit<PropuestaIa, "turnos">;

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

const largo = (textos: string[]) => textos.reduce((n, t) => n + t.trim().length, 0);

/**
 * Convierte los turnos del modelo en la transcripción final, con el tiempo del segmento
 * donde empieza cada turno. Whisper corta por pausas, no por hablante, así que un segmento
 * puede contener a los dos; por eso el modelo los separa.
 *
 * Si el modelo resumió o recortó (cubre menos del 80 % del texto original), se conserva
 * la transcripción literal de Whisper y solo se toma de él quién habla en cada segmento.
 */
export function construirTurnos(segmentos: Segmento[], turnos: PropuestaIa["turnos"]): Segmento[] {
  const validos = turnos.filter((t) => t.indice < segmentos.length && t.texto.trim());
  const cobertura = largo(validos.map((t) => t.texto)) / Math.max(1, largo(segmentos.map((s) => s.texto)));

  if (validos.length === 0 || cobertura < 0.8) {
    const primero = new Map<number, Hablante>();
    for (const t of validos) if (!primero.has(t.indice)) primero.set(t.indice, t.hablante);
    return segmentos.map((s, i) => ({ ...s, hablante: primero.get(i) ?? null }));
  }

  return validos.map((t) => ({
    inicioMs: segmentos[t.indice].inicioMs,
    finMs: segmentos[t.indice].finMs,
    texto: t.texto.trim(),
    hablante: t.hablante,
  }));
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
