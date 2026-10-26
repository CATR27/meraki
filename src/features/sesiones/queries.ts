import "server-only";
import { and, desc, eq, getTableColumns, ne, or, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { citas, notasSesion, notasSesionVersiones, user } from "@/db/schema";
import { requireRole } from "@/lib/dal";
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

const vacio = (columna: SQLiteColumn) => sql`coalesce(trim(${columna}), '') = ''`;

/** Sesión finalizada sin S, O, A ni P (equivale a `notaPorCompletar`). */
export const notaPorCompletarSql = and(
  eq(notasSesion.estado, "cerrada"),
  vacio(notasSesion.subjetivo),
  vacio(notasSesion.objetivo),
  vacio(notasSesion.analisis),
  vacio(notasSesion.plan),
);

/** Notas que requieren atención: borradores sin finalizar o finalizadas sin nota. */
export const notaPendiente = or(eq(notasSesion.estado, "borrador"), notaPorCompletarSql);

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
    .select({
      ...columnasResumenNota,
      subjetivo: notasSesion.subjetivo,
      objetivo: notasSesion.objetivo,
      analisis: notasSesion.analisis,
      editadaAt: notasSesion.editadaAt,
      citaEstado: citas.estado,
    })
    .from(notasSesion)
    .leftJoin(citas, eq(citas.id, notasSesion.citaId))
    .where(eq(notasSesion.consultanteId, consultante.id))
    .orderBy(desc(notasSesion.fecha));
}

export type NotaResumen = Awaited<ReturnType<typeof notasDeConsultante>>[number];

/** Versiones anteriores de una nota del psicólogo, de la más reciente a la más antigua. */
export async function historialDeNota(notaId: string) {
  const psicologo = await requireRole("psicologo");
  return db
    .select({ ...getTableColumns(notasSesionVersiones), editor: user.name })
    .from(notasSesionVersiones)
    .innerJoin(notasSesion, eq(notasSesion.id, notasSesionVersiones.notaId))
    .innerJoin(user, eq(user.id, notasSesionVersiones.editadoPor))
    .where(and(eq(notasSesionVersiones.notaId, notaId), eq(notasSesion.psicologoId, psicologo.id)))
    .orderBy(desc(notasSesionVersiones.version));
}

export type VersionNota = Awaited<ReturnType<typeof historialDeNota>>[number];
