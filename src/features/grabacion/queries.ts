import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { grabacionesSesion, grabacionFragmentos } from "@/db/schema";
import { requireRole } from "@/lib/dal";

/** Grabación de una cita del psicólogo, con cuántos fragmentos de audio conserva. */
export async function obtenerGrabacion(citaId: string) {
  const user = await requireRole("psicologo");
  const [fila] = await db
    .select({
      id: grabacionesSesion.id,
      estado: grabacionesSesion.estado,
      duracionMs: grabacionesSesion.duracionMs,
      error: grabacionesSesion.error,
      audioBorrarEn: grabacionesSesion.audioBorrarEn,
      audioBorradoAt: grabacionesSesion.audioBorradoAt,
      fragmentos: count(grabacionFragmentos.id),
    })
    .from(grabacionesSesion)
    .leftJoin(grabacionFragmentos, eq(grabacionFragmentos.grabacionId, grabacionesSesion.id))
    .where(and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, user.id)))
    .groupBy(grabacionesSesion.id)
    .limit(1);
  return fila ?? null;
}

export type GrabacionResumen = NonNullable<Awaited<ReturnType<typeof obtenerGrabacion>>>;
