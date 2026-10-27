import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { grabacionesSesion } from "@/db/schema";
import { borrarAudio } from "@/features/grabacion/almacen";
import { env } from "@/lib/env";

const DIA_MS = 86_400_000;

/**
 * Cron diario (vercel.ts): borra el audio vencido, el de grabaciones abandonadas
 * (nunca finalizadas) y libera las que se quedaron "procesando".
 * Vercel envía `Authorization: Bearer <CRON_SECRET>` en cada ejecución.
 */
export async function GET(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const ahora = Date.now();
  const vencidas = await db
    .select({ id: grabacionesSesion.id })
    .from(grabacionesSesion)
    .where(
      and(
        isNull(grabacionesSesion.audioBorradoAt),
        or(
          lt(grabacionesSesion.audioBorrarEn, new Date(ahora)),
          and(
            eq(grabacionesSesion.estado, "grabando"),
            lt(grabacionesSesion.createdAt, new Date(ahora - 30 * DIA_MS)),
          ),
        ),
      ),
    );

  let borradas = 0;
  for (const { id } of vencidas) {
    try {
      await borrarAudio(id);
      borradas++;
    } catch (error) {
      console.error("[cron grabaciones]", id, error instanceof Error ? error.message : error);
    }
  }

  // Un procesamiento que no terminó en 15 min ya no va a terminar: queda reintentable.
  const atascadas = await db
    .update(grabacionesSesion)
    .set({ estado: "error", error: "El procesamiento tardó demasiado. Vuelve a intentarlo." })
    .where(
      and(
        eq(grabacionesSesion.estado, "procesando"),
        lt(grabacionesSesion.updatedAt, new Date(ahora - 15 * 60_000)),
      ),
    )
    .returning({ id: grabacionesSesion.id });

  return Response.json({ borradas, pendientes: vencidas.length - borradas, atascadas: atascadas.length });
}
