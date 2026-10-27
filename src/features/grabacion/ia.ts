import "server-only";
import { groq, type GroqTranscriptionModelOptions } from "@ai-sdk/groq";
import { generateText, Output, transcribe } from "ai";
import { env } from "@/lib/env";
import { type PropuestaIa, propuestaIaSchema, type Segmento, segmentosParaModelo } from "./schemas";

/** Capa gratis de AI Gateway; ninguno de los dos entrena con los datos (`no_training: all`). */
const MODELO_REDACCION = "openai/gpt-oss-120b";
const MODELO_RESPALDO = "google/gemini-2.5-flash";

/** La IA solo se ofrece si hay con qué transcribir. */
export const iaDisponible = Boolean(env.GROQ_API_KEY);

/** Transcribe un fragmento con Whisper en Groq (con Zero Data Retention en la cuenta). */
export async function transcribirFragmento(audio: Uint8Array) {
  const resultado = await transcribe({
    model: groq.transcription("whisper-large-v3-turbo"),
    audio,
    providerOptions: {
      groq: {
        language: "es",
        responseFormat: "verbose_json",
        timestampGranularities: ["segment"],
        // Orienta el vocabulario sin inducir contenido.
        prompt: "Sesión de psicoterapia en español entre un psicólogo y su consultante.",
        temperature: 0,
      } satisfies GroqTranscriptionModelOptions,
    },
  });
  return resultado.segments.map((s) => ({
    texto: s.text,
    inicioSeg: s.startSecond,
    finSeg: s.endSecond,
  }));
}

const SISTEMA = `Eres asistente clínico de un psicólogo en México. Recibes la transcripción de una sesión de psicoterapia en segmentos numerados, sin indicar quién habla.

Tareas:
1. Divide la transcripción en turnos de habla e identifica quién dice cada uno: "psicologo" (pregunta, guía, interviene, asigna tareas) o "consultante" (relata su experiencia). Los segmentos se cortaron por pausas, no por hablante: si en un mismo segmento hablan los dos, sepáralo en varios turnos con el mismo índice. Copia el texto literal y completo, sin resumir, corregir ni omitir nada.
2. Redacta la nota de evolución en formato SOAP, en español clínico, conciso y en tercera persona ("el consultante refiere…").

Reglas estrictas:
- Usa solo lo que está en la transcripción. No inventes síntomas, diagnósticos, fechas ni datos. Si un apartado no tiene información, déjalo vacío ("").
- "Objetivo" es lo observable en la sesión (afecto, conducta, lenguaje, actitud); no repitas ahí lo que el consultante relata.
- Si el psicólogo ya escribió algo en un apartado, consérvalo y compleméntalo sin contradecirlo.
- El expediente y la nota anterior son contexto para dar continuidad; no copies de ellos lo que no se trató en esta sesión.
- Nivel de riesgo: "alto" o "medio" solo con indicios explícitos (ideación suicida, autolesiones, violencia, crisis). Justifica citando lo dicho.
- Estado de ánimo (1 = muy bajo, 10 = muy bueno): sugiérelo solo si hay base; si no, null.`;

export type ContextoRedaccion = {
  segmentos: Segmento[];
  escrito: Record<string, string | null>;
  expediente: { label: string; valor: string }[];
  notaAnterior: string | null;
};

/** Pide al modelo los hablantes y la propuesta SOAP. Si falla el principal, AI Gateway usa el respaldo. */
export async function redactarPropuesta(contexto: ContextoRedaccion): Promise<PropuestaIa> {
  const escrito = Object.entries(contexto.escrito)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const expediente = contexto.expediente.map((e) => `- ${e.label}: ${e.valor}`).join("\n");

  const { output } = await generateText({
    model: MODELO_REDACCION,
    system: SISTEMA,
    temperature: 0.2,
    output: Output.object({ schema: propuestaIaSchema, name: "nota_soap" }),
    providerOptions: { gateway: { models: [MODELO_RESPALDO] } },
    prompt: [
      `## Transcripción\n${segmentosParaModelo(contexto.segmentos)}`,
      `## Lo que el psicólogo ya escribió\n${escrito || "(nada)"}`,
      `## Expediente (contexto)\n${expediente || "(sin datos)"}`,
      `## Nota de la sesión anterior (contexto)\n${contexto.notaAnterior || "(es la primera sesión registrada)"}`,
    ].join("\n\n"),
  });
  return output;
}
