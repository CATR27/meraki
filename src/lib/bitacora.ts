import "server-only";
import { after } from "next/server";
import { db } from "@/db";
import { bitacora } from "@/db/schema";

export type AccionBitacora = "ver" | "crear" | "editar" | "cerrar" | "estado" | "eliminar";

/**
 * Registra quién consultó o modificó información clínica.
 * Se ejecuta después de responder (after) para no añadir latencia.
 */
export function registrarBitacora(
  userId: string,
  accion: AccionBitacora,
  entidad: "consultante" | "expediente" | "nota" | "cita" | "grabacion",
  entidadId: string,
) {
  after(async () => {
    try {
      await db.insert(bitacora).values({ userId, accion, entidad, entidadId });
    } catch (error) {
      console.error("[bitacora]", error instanceof Error ? error.message : error);
    }
  });
}
