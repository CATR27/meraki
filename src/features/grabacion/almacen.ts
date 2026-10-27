import "server-only";
import { del } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  citas,
  consultantes,
  grabacionesSesion,
  grabacionFragmentos,
  notasSesion,
} from "@/db/schema";
import { env } from "@/lib/env";
import { RETENCION_AUDIO_DIAS } from "./formato";

/** En Vercel el Blob se autentica con OIDC + BLOB_STORE_ID; en local, con el token. */
export const grabacionDisponible = Boolean(env.BLOB_STORE_ID || env.BLOB_READ_WRITE_TOKEN);

/**
 * Comprueba que una cita del psicólogo admita grabación: presencial, vigente, con la
 * nota aún abierta y con consentimiento de grabación del consultante.
 */
export async function validarCitaParaGrabar(psicologoId: string, citaId: string) {
  const [fila] = await db
    .select({
      consultanteId: citas.consultanteId,
      modalidad: citas.modalidad,
      estado: citas.estado,
      notaEstado: notasSesion.estado,
      consentimiento: consultantes.consentimientoGrabacionAt,
    })
    .from(citas)
    .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
    .leftJoin(notasSesion, eq(notasSesion.citaId, citas.id))
    .where(and(eq(citas.id, citaId), eq(citas.psicologoId, psicologoId)))
    .limit(1);

  if (!fila) return { ok: false as const, message: "La cita no existe." };
  if (fila.modalidad !== "presencial") {
    return { ok: false as const, message: "Por ahora solo se graban sesiones presenciales." };
  }
  if (fila.estado === "cancelada") return { ok: false as const, message: "La cita está cancelada." };
  if (fila.notaEstado === "cerrada") return { ok: false as const, message: "La sesión ya finalizó." };
  if (!fila.consentimiento) {
    return { ok: false as const, message: "Falta el consentimiento del consultante para grabar." };
  }
  return { ok: true as const, consultanteId: fila.consultanteId };
}

/** Borra del Blob todos los fragmentos de una grabación (la transcripción se conserva). */
export async function borrarAudio(grabacionId: string) {
  const fragmentos = await db
    .select({ pathname: grabacionFragmentos.pathname })
    .from(grabacionFragmentos)
    .where(eq(grabacionFragmentos.grabacionId, grabacionId));
  if (fragmentos.length > 0) await del(fragmentos.map((f) => f.pathname));

  await db.delete(grabacionFragmentos).where(eq(grabacionFragmentos.grabacionId, grabacionId));
  await db
    .update(grabacionesSesion)
    .set({ audioBorradoAt: new Date(), audioBorrarEn: null })
    .where(eq(grabacionesSesion.id, grabacionId));
}

/** Al finalizar la sesión la grabación deja de aceptar audio y empieza su retención. */
export async function cerrarGrabacion(citaId: string) {
  await db
    .update(grabacionesSesion)
    .set({
      estado: "finalizada",
      audioBorrarEn: new Date(Date.now() + RETENCION_AUDIO_DIAS * 86_400_000),
    })
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.estado, "grabando")));
}
