"use server";

import { and, eq, max, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { consultantes, grabacionesSesion, grabacionFragmentos } from "@/db/schema";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { borrarAudio, grabacionDisponible, validarCitaParaGrabar } from "./almacen";

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
