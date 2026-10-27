"use server";

import { and, eq, inArray, max, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { consultantes, grabacionesSesion, grabacionFragmentos, notasSesion } from "@/db/schema";
import { reemplazarNotaCerrada } from "@/features/sesiones/edicion";
import type { NotaDatos } from "@/features/sesiones/schemas";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { borrarAudio, grabacionDisponible, validarCitaParaGrabar } from "./almacen";
import { iaDisponible } from "./ia";
import { encolarProcesamiento } from "./procesar";
import { grabacionConAudio } from "./queries";
import type { Hablante, PropuestaGuardada, Transcripcion } from "./schemas";

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; message: string };

/** El psicólogo confirma que el consultante aceptó que se graben sus sesiones. */
export async function registrarConsentimientoGrabacion(consultanteId: string): Promise<Resultado> {
  const user = await requireRole("psicologo");
  const [actualizado] = await db
    .update(consultantes)
    .set({ consentimientoGrabacionAt: new Date() })
    .where(and(eq(consultantes.id, consultanteId), eq(consultantes.psicologoId, user.id)))
    .returning({ id: consultantes.id });
  if (!actualizado) return { ok: false, message: "El consultante no existe." };

  registrarBitacora(user.id, "editar", "consultante", consultanteId);
  revalidatePath(`/consultantes/${consultanteId}`, "layout");
  return { ok: true };
}

/**
 * Abre (o retoma, si la página se recargó) la grabación de una cita. Devuelve desde qué
 * fragmento y en qué segundo de la sesión continuar.
 */
export async function iniciarGrabacion(
  citaId: string,
): Promise<Resultado<{ siguienteIndice: number; inicioMs: number }>> {
  const user = await requireRole("psicologo");
  if (!grabacionDisponible) return { ok: false, message: "La grabación no está configurada." };

  const apta = await validarCitaParaGrabar(user.id, citaId);
  if (!apta.ok) return apta;

  await db
    .insert(grabacionesSesion)
    .values({ citaId, psicologoId: user.id, consultanteId: apta.consultanteId })
    .onConflictDoNothing({ target: grabacionesSesion.citaId });

  const [grabacion] = await db
    .select({ id: grabacionesSesion.id, estado: grabacionesSesion.estado })
    .from(grabacionesSesion)
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, user.id)))
    .limit(1);
  if (grabacion?.estado !== "grabando") {
    return { ok: false, message: "La grabación de esta sesión ya se cerró." };
  }

  const [ultimo] = await db
    .select({ indice: max(grabacionFragmentos.indice), total: sum(grabacionFragmentos.duracionMs) })
    .from(grabacionFragmentos)
    .where(eq(grabacionFragmentos.grabacionId, grabacion.id));

  registrarBitacora(user.id, "crear", "grabacion", grabacion.id);
  return {
    ok: true,
    siguienteIndice: (ultimo?.indice ?? -1) + 1,
    inicioMs: Number(ultimo?.total ?? 0),
  };
}

/** Manda (o vuelve a mandar) el audio de una sesión finalizada a la IA. */
export async function generarPropuestaIA(citaId: string): Promise<Resultado> {
  const user = await requireRole("psicologo");
  if (!iaDisponible) return { ok: false, message: "La IA no está configurada." };

  const grabacion = await grabacionConAudio(user.id, citaId);
  if (!grabacion) return { ok: false, message: "Esta sesión ya no tiene audio para procesar." };
  if (grabacion.estado === "grabando") return { ok: false, message: "Finaliza la sesión primero." };

  await encolarProcesamiento(grabacion.id);
  revalidatePath(`/citas/${citaId}/sesion`);
  return { ok: true };
}

const CAMPOS_TEXTO = [
  "subjetivo",
  "objetivo",
  "analisis",
  "plan",
  "tareasAsignadas",
  "observaciones",
] as const;

export type SeleccionPropuesta = {
  campos: (typeof CAMPOS_TEXTO)[number][];
  animo: boolean;
  riesgo: boolean;
};

async function grabacionLista(psicologoId: string, citaId: string) {
  const [g] = await db
    .select()
    .from(grabacionesSesion)
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, psicologoId)))
    .limit(1);
  return g?.estado === "lista" ? g : null;
}

/**
 * Pasa a la nota los apartados elegidos de la propuesta. La versión anterior de la nota
 * queda en el historial con origen "ia".
 */
export async function aplicarPropuesta(
  citaId: string,
  seleccion: SeleccionPropuesta,
): Promise<Resultado> {
  const user = await requireRole("psicologo");
  const grabacion = await grabacionLista(user.id, citaId);
  const propuesta = grabacion?.propuesta as PropuestaGuardada | null;
  if (!grabacion || !propuesta) return { ok: false, message: "No hay una propuesta lista." };

  const [nota] = await db.select().from(notasSesion).where(eq(notasSesion.citaId, citaId)).limit(1);
  if (!nota) return { ok: false, message: "La nota no existe." };

  const datos: NotaDatos = {
    subjetivo: nota.subjetivo,
    objetivo: nota.objetivo,
    analisis: nota.analisis,
    plan: nota.plan,
    tareasAsignadas: nota.tareasAsignadas,
    observaciones: nota.observaciones,
    estadoAnimo: nota.estadoAnimo,
    nivelRiesgo: nota.nivelRiesgo,
  };
  for (const campo of seleccion.campos) {
    if (CAMPOS_TEXTO.includes(campo) && propuesta[campo].trim()) datos[campo] = propuesta[campo].trim();
  }
  if (seleccion.animo && propuesta.estadoAnimoSugerido != null) {
    datos.estadoAnimo = propuesta.estadoAnimoSugerido;
  }
  if (seleccion.riesgo) datos.nivelRiesgo = propuesta.nivelRiesgoSugerido;

  const r = await reemplazarNotaCerrada(user.id, citaId, datos, "ia");
  if (!r.ok) return r;

  await db
    .update(grabacionesSesion)
    .set({ revisadaAt: new Date() })
    .where(eq(grabacionesSesion.id, grabacion.id));
  revalidatePath("/panel");
  revalidatePath(`/citas/${citaId}/sesion`);
  revalidatePath(`/consultantes/${nota.consultanteId}`, "layout");
  return { ok: true };
}

/** Oculta la propuesta (o el aviso de error) sin tocar la nota; la transcripción se conserva. */
export async function descartarPropuesta(citaId: string): Promise<Resultado> {
  const user = await requireRole("psicologo");
  await db
    .update(grabacionesSesion)
    .set({ revisadaAt: new Date() })
    .where(
      and(
        eq(grabacionesSesion.citaId, citaId),
        eq(grabacionesSesion.psicologoId, user.id),
        inArray(grabacionesSesion.estado, ["lista", "error"]),
      ),
    );
  revalidatePath(`/citas/${citaId}/sesion`);
  return { ok: true };
}

/** Corrige quién habla en un turno de la transcripción, o intercambia a ambos ("todos"). */
export async function cambiarHablante(citaId: string, indice: number | "todos"): Promise<Resultado> {
  const user = await requireRole("psicologo");
  const grabacion = await grabacionLista(user.id, citaId);
  const transcripcion = grabacion?.transcripcion as Transcripcion | null;
  if (!grabacion || !transcripcion) return { ok: false, message: "No hay transcripción." };

  const otro = (h: Hablante | null): Hablante => (h === "psicologo" ? "consultante" : "psicologo");
  const segmentos = transcripcion.segmentos.map((s, i) =>
    indice === "todos" || i === indice ? { ...s, hablante: otro(s.hablante) } : s,
  );
  await db
    .update(grabacionesSesion)
    .set({ transcripcion: { segmentos } satisfies Transcripcion })
    .where(eq(grabacionesSesion.id, grabacion.id));
  revalidatePath(`/citas/${citaId}/sesion`);
  return { ok: true };
}

/** Elimina el audio de una sesión antes de que venza su retención. */
export async function eliminarAudioGrabacion(citaId: string): Promise<Resultado> {
  const user = await requireRole("psicologo");
  const [grabacion] = await db
    .select({ id: grabacionesSesion.id, consultanteId: grabacionesSesion.consultanteId })
    .from(grabacionesSesion)
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, user.id)))
    .limit(1);
  if (!grabacion) return { ok: false, message: "Esta sesión no tiene grabación." };

  try {
    await borrarAudio(grabacion.id);
  } catch (error) {
    console.error("[grabacion]", error instanceof Error ? error.message : error);
    return { ok: false, message: "No pudimos eliminar el audio. Inténtalo de nuevo." };
  }

  registrarBitacora(user.id, "eliminar", "grabacion", grabacion.id);
  revalidatePath(`/citas/${citaId}/sesion`);
  return { ok: true };
}
