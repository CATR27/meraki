import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notasSesion, notasSesionVersiones, type ORIGENES_VERSION } from "@/db/schema";
import { registrarBitacora } from "@/lib/bitacora";
import type { NotaDatos } from "./schemas";

export type OrigenVersion = (typeof ORIGENES_VERSION)[number];

export type ResultadoGuardado =
  | { ok: true; guardadoEn: number }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

const CAMPOS_VERSIONADOS = [
  "subjetivo",
  "objetivo",
  "analisis",
  "plan",
  "estadoAnimo",
  "nivelRiesgo",
  "tareasAsignadas",
  "observaciones",
] as const;

/**
 * Reemplaza el contenido de una nota cerrada. La versión vigente pasa antes al
 * historial (notas_sesion_versiones) para conservar la trazabilidad del registro clínico.
 */
export async function reemplazarNotaCerrada(
  psicologoId: string,
  citaId: string,
  datos: NotaDatos,
  origen: OrigenVersion,
): Promise<ResultadoGuardado & { consultanteId?: string }> {
  const [nota] = await db
    .select()
    .from(notasSesion)
    .where(and(eq(notasSesion.citaId, citaId), eq(notasSesion.psicologoId, psicologoId)))
    .limit(1);
  if (!nota) return { ok: false, message: "La nota no existe." };
  if (nota.estado !== "cerrada") return { ok: false, message: "La sesión aún no se finaliza." };

  const sinCambios = CAMPOS_VERSIONADOS.every((c) => (nota[c] ?? null) === (datos[c] ?? null));
  if (sinCambios) return { ok: true, guardadoEn: Date.now(), consultanteId: nota.consultanteId };

  try {
    await db.transaction(async (tx) => {
      await tx.insert(notasSesionVersiones).values({
        ...Object.fromEntries(CAMPOS_VERSIONADOS.map((c) => [c, nota[c]])),
        nivelRiesgo: nota.nivelRiesgo,
        notaId: nota.id,
        version: nota.version,
        origen,
        editadoPor: psicologoId,
      });
      await tx
        .update(notasSesion)
        .set({ ...datos, version: nota.version + 1, editadaAt: new Date() })
        .where(eq(notasSesion.id, nota.id));
    });
  } catch (error) {
    // El índice único (nota, versión) frena dos ediciones simultáneas de la misma versión.
    console.error("[nota]", error instanceof Error ? error.message : error);
    return { ok: false, message: "La nota cambió mientras la editabas. Recarga e inténtalo de nuevo." };
  }

  registrarBitacora(psicologoId, "editar", "nota", nota.id);
  return { ok: true, guardadoEn: Date.now(), consultanteId: nota.consultanteId };
}
