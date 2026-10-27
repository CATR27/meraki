import "server-only";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { grabacionesSesion, grabacionFragmentos } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import type { PropuestaGuardada, Transcripcion } from "./schemas";

/** Grabación de una cita del psicólogo, con cuántos fragmentos de audio conserva. */
export async function obtenerGrabacion(citaId: string) {
  const user = await requireRole("psicologo");
  const [fila] = await db
    .select({
      id: grabacionesSesion.id,
      estado: grabacionesSesion.estado,
      duracionMs: grabacionesSesion.duracionMs,
      error: grabacionesSesion.error,
      transcripcion: grabacionesSesion.transcripcion,
      propuesta: grabacionesSesion.propuesta,
      procesadaAt: grabacionesSesion.procesadaAt,
      revisadaAt: grabacionesSesion.revisadaAt,
      updatedAt: grabacionesSesion.updatedAt,
      audioBorrarEn: grabacionesSesion.audioBorrarEn,
      audioBorradoAt: grabacionesSesion.audioBorradoAt,
      fragmentos: count(grabacionFragmentos.id),
    })
    .from(grabacionesSesion)
    .leftJoin(grabacionFragmentos, eq(grabacionFragmentos.grabacionId, grabacionesSesion.id))
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, user.id)))
    .groupBy(grabacionesSesion.id)
    .limit(1);
  if (!fila) return null;
  return {
    ...fila,
    // Un procesamiento de más de 15 min ya no va a terminar: se ofrece reintentar.
    atascada: fila.estado === "procesando" && Date.now() - fila.updatedAt.getTime() > 15 * 60_000,
    transcripcion: fila.transcripcion as Transcripcion | null,
    propuesta: fila.propuesta as PropuestaGuardada | null,
  };
}

export type GrabacionResumen = NonNullable<Awaited<ReturnType<typeof obtenerGrabacion>>>;

/** Grabación de la cita que todavía conserva audio para procesar (o null). */
export async function grabacionConAudio(psicologoId: string, citaId: string) {
  const [fila] = await db
    .select({ id: grabacionesSesion.id, estado: grabacionesSesion.estado })
    .from(grabacionesSesion)
    .innerJoin(grabacionFragmentos, eq(grabacionFragmentos.grabacionId, grabacionesSesion.id))
    .where(
      and(
        eq(grabacionesSesion.citaId, citaId),
        eq(grabacionesSesion.psicologoId, psicologoId),
        isNull(grabacionesSesion.audioBorradoAt),
      ),
    )
    .limit(1);
  return fila ?? null;
}
