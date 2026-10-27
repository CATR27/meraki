import "server-only";
import { get } from "@vercel/blob";
import { and, asc, desc, eq, lt } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { expedientes, grabacionesSesion, grabacionFragmentos, notasSesion } from "@/db/schema";
import { type CampoExpediente, SECCIONES_EXPEDIENTE } from "@/features/expediente/secciones";
import { CAMPOS_SOAP } from "@/features/sesiones/schemas";
import { redactarPropuesta, transcribirFragmento } from "./ia";
import {
  construirTurnos,
  type PropuestaGuardada,
  type Transcripcion,
  unirFragmentos,
} from "./schemas";

/** Lo del expediente que da continuidad clínica sin inflar el contexto. */
const CAMPOS_CONTEXTO: CampoExpediente[] = [
  "motivoConsulta",
  "padecimientoActual",
  "impresionDiagnostica",
  "objetivosTerapeuticos",
  "planTratamiento",
  "medicacionActual",
];
const LABELS = new Map(SECCIONES_EXPEDIENTE.flatMap((s) => s.campos.map((c) => [c.campo, c.label])));
const recortar = (texto: string, max = 1500) => (texto.length > max ? `${texto.slice(0, max)}…` : texto);

/** Marca la grabación como "procesando" y la procesa después de responder al psicólogo. */
export async function encolarProcesamiento(grabacionId: string) {
  await db
    .update(grabacionesSesion)
    .set({ estado: "procesando", error: null, revisadaAt: null })
    .where(eq(grabacionesSesion.id, grabacionId));
  after(() => procesarGrabacion(grabacionId));
}

async function procesarGrabacion(grabacionId: string) {
  try {
    const [grabacion] = await db
      .select()
      .from(grabacionesSesion)
      .where(eq(grabacionesSesion.id, grabacionId))
      .limit(1);
    if (!grabacion || grabacion.audioBorradoAt) {
      throw new Error("El audio de esta sesión ya no está disponible.");
    }

    const fragmentos = await db
      .select()
      .from(grabacionFragmentos)
      .where(eq(grabacionFragmentos.grabacionId, grabacionId))
      .orderBy(asc(grabacionFragmentos.indice));
    if (fragmentos.length === 0) throw new Error("La sesión no tiene audio grabado.");

    // En serie: respeta el límite por minuto de la capa gratis de Groq.
    const transcritos = [];
    for (const f of fragmentos) {
      const blob = await get(f.pathname, { access: "private" });
      if (blob?.statusCode !== 200) throw new Error("No se encontró parte del audio.");
      const audio = new Uint8Array(await new Response(blob.stream).arrayBuffer());
      transcritos.push({ inicioMs: f.inicioMs, segmentos: await transcribirFragmento(audio) });
    }
    const segmentos = unirFragmentos(transcritos);
    if (segmentos.length === 0) throw new Error("No se detectó voz en la grabación.");

    const [[nota], [expediente]] = await Promise.all([
      db.select().from(notasSesion).where(eq(notasSesion.citaId, grabacion.citaId)).limit(1),
      db
        .select()
        .from(expedientes)
        .where(eq(expedientes.consultanteId, grabacion.consultanteId))
        .limit(1),
    ]);
    const [anterior] = nota
      ? await db
          .select({ subjetivo: notasSesion.subjetivo, analisis: notasSesion.analisis, plan: notasSesion.plan })
          .from(notasSesion)
          .where(
            and(
              eq(notasSesion.consultanteId, grabacion.consultanteId),
              eq(notasSesion.estado, "cerrada"),
              lt(notasSesion.fecha, nota.fecha),
            ),
          )
          .orderBy(desc(notasSesion.fecha))
          .limit(1)
      : [];

    const { turnos, ...propuesta } = await redactarPropuesta({
      segmentos,
      escrito: Object.fromEntries(
        [...CAMPOS_SOAP.map((c) => c.campo), "tareasAsignadas", "observaciones"].map((c) => [
          c,
          nota?.[c as keyof typeof nota] as string | null,
        ]),
      ),
      expediente: CAMPOS_CONTEXTO.flatMap((c) =>
        expediente?.[c] ? [{ label: LABELS.get(c) ?? c, valor: recortar(expediente[c]) }] : [],
      ),
      notaAnterior: anterior
        ? recortar(
            [
              anterior.subjetivo && `S: ${anterior.subjetivo}`,
              anterior.analisis && `A: ${anterior.analisis}`,
              anterior.plan && `P: ${anterior.plan}`,
            ]
              .filter(Boolean)
              .join("\n"),
            2000,
          )
        : null,
    });

    const transcripcion: Transcripcion = { segmentos: construirTurnos(segmentos, turnos) };
    await db
      .update(grabacionesSesion)
      .set({
        estado: "lista",
        transcripcion,
        propuesta: propuesta satisfies PropuestaGuardada,
        error: null,
        procesadaAt: new Date(),
        revisadaAt: null,
      })
      .where(eq(grabacionesSesion.id, grabacionId));
  } catch (error) {
    console.error("[ia]", grabacionId, error);
    await db
      .update(grabacionesSesion)
      .set({ estado: "error", error: mensajeAmigable(error) })
      .where(eq(grabacionesSesion.id, grabacionId));
  }
}

function mensajeAmigable(error: unknown): string {
  const texto = error instanceof Error ? error.message : String(error);
  if (/429|rate limit|too many/i.test(texto)) {
    return "El servicio de IA está saturado en este momento. Vuelve a intentarlo en unos minutos.";
  }
  if (/402|quota|budget|credit/i.test(texto)) {
    return "Se alcanzó el límite mensual de uso de IA. La nota puede completarse a mano.";
  }
  // Mensajes propios (en español) se muestran tal cual; los técnicos, no.
  if (/^(El audio|La sesión|No se)/.test(texto)) return texto;
  return "No pudimos procesar la grabación. Vuelve a intentarlo.";
}
