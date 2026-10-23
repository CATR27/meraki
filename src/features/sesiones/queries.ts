import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { citas, notasSesion } from "@/db/schema";
import { obtenerCita } from "@/features/citas/queries";
import { obtenerConsultante } from "@/features/consultantes/queries";
import { obtenerExpediente } from "@/features/expediente/queries";

const columnasResumenNota = {
  id: notasSesion.id,
  citaId: notasSesion.citaId,
  numeroSesion: notasSesion.numeroSesion,
  fecha: notasSesion.fecha,
  estadoAnimo: notasSesion.estadoAnimo,
  nivelRiesgo: notasSesion.nivelRiesgo,
  plan: notasSesion.plan,
  tareasAsignadas: notasSesion.tareasAsignadas,
  estado: notasSesion.estado,
};

/** Todo lo necesario para el modo sesión de una cita (404 si no es del psicólogo). */
export async function obtenerSesion(citaId: string) {
  const cita = await obtenerCita(citaId);
  const [consultante, expediente, [nota], anteriores] = await Promise.all([
    obtenerConsultante(cita.consultanteId),
    obtenerExpediente(cita.consultanteId),
    db.select().from(notasSesion).where(eq(notasSesion.citaId, cita.id)).limit(1),
    db
      .select(columnasResumenNota)
      .from(notasSesion)
      .where(
        and(
          eq(notasSesion.consultanteId, cita.consultanteId),
          cita.notaId ? ne(notasSesion.id, cita.notaId) : undefined,
        ),
      )
      .orderBy(desc(notasSesion.fecha))
      .limit(3),
  ]);
  return { cita, consultante, expediente, nota: nota ?? null, anteriores };
}

export type Sesion = Awaited<ReturnType<typeof obtenerSesion>>;

/** Línea de tiempo de notas de un consultante. */
export async function notasDeConsultante(consultanteId: string) {
  const consultante = await obtenerConsultante(consultanteId);
  return db
    .select({ ...columnasResumenNota, subjetivo: notasSesion.subjetivo, citaEstado: citas.estado })
    .from(notasSesion)
    .leftJoin(citas, eq(citas.id, notasSesion.citaId))
    .where(eq(notasSesion.consultanteId, consultante.id))
    .orderBy(desc(notasSesion.fecha));
}

export type NotaResumen = Awaited<ReturnType<typeof notasDeConsultante>>[number];
