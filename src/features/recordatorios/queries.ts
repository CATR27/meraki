import "server-only";
import { and, asc, count, desc, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { db } from "@/db";
import { citas, consultantes, recordatorios } from "@/db/schema";
import { rangoVista } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";

const columnas = {
  id: recordatorios.id,
  titulo: recordatorios.titulo,
  descripcion: recordatorios.descripcion,
  fechaHora: recordatorios.fechaHora,
  completado: recordatorios.completado,
  consultanteId: recordatorios.consultanteId,
  nombre: consultantes.nombre,
  apellidos: consultantes.apellidos,
};

/** Recordatorios agrupados: vencidos, hoy, próximos y completados recientes. */
export async function listarRecordatorios() {
  const user = await requireRole("psicologo");
  const { inicio, fin } = rangoVista("dia", hoyISO(user.zonaHoraria), user.zonaHoraria);

  const [pendientes, completados] = await Promise.all([
    db
      .select(columnas)
      .from(recordatorios)
      .leftJoin(consultantes, eq(consultantes.id, recordatorios.consultanteId))
      .where(and(eq(recordatorios.psicologoId, user.id), eq(recordatorios.completado, false)))
      .orderBy(asc(recordatorios.fechaHora)),
    db
      .select(columnas)
      .from(recordatorios)
      .leftJoin(consultantes, eq(consultantes.id, recordatorios.consultanteId))
      .where(and(eq(recordatorios.psicologoId, user.id), eq(recordatorios.completado, true)))
      .orderBy(desc(recordatorios.fechaHora))
      .limit(20),
  ]);

  const ahora = new Date();
  const conEstado = pendientes.map((r) => ({ ...r, vencido: r.fechaHora < ahora }));
  return {
    vencidos: conEstado.filter((r) => r.fechaHora < inicio),
    hoy: conEstado.filter((r) => r.fechaHora >= inicio && r.fechaHora < fin),
    proximos: conEstado.filter((r) => r.fechaHora >= fin),
    completados: completados.map((r) => ({ ...r, vencido: false })),
  };
}

export type Recordatorio = Awaited<ReturnType<typeof listarRecordatorios>>["hoy"][number];

/**
 * Avisos de la campana: recordatorios pendientes hasta el final de hoy y
 * citas vigentes en las próximas 24 horas.
 */
export async function avisosPendientes() {
  const user = await requireRole("psicologo");
  const { fin } = rangoVista("dia", hoyISO(user.zonaHoraria), user.zonaHoraria);
  const ahora = new Date();
  const en24h = new Date(ahora.getTime() + 24 * 3600_000);

  const [rec, proximas] = await Promise.all([
    db
      .select({
        id: recordatorios.id,
        titulo: recordatorios.titulo,
        fechaHora: recordatorios.fechaHora,
      })
      .from(recordatorios)
      .where(
        and(
          eq(recordatorios.psicologoId, user.id),
          eq(recordatorios.completado, false),
          lt(recordatorios.fechaHora, fin),
        ),
      )
      .orderBy(asc(recordatorios.fechaHora))
      .limit(10),
    db
      .select({
        id: citas.id,
        inicio: citas.inicio,
        nombre: consultantes.nombre,
        apellidos: consultantes.apellidos,
      })
      .from(citas)
      .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
      .where(
        and(
          eq(citas.psicologoId, user.id),
          inArray(citas.estado, ["programada", "confirmada"]),
          gte(citas.inicio, ahora),
          lte(citas.inicio, en24h),
        ),
      )
      .orderBy(asc(citas.inicio))
      .limit(10),
  ]);

  return {
    recordatorios: rec.map((r) => ({ ...r, vencido: r.fechaHora < ahora })),
    citas: proximas,
    total: rec.length + proximas.length,
  };
}

export async function contarRecordatoriosPendientesHoy() {
  const user = await requireRole("psicologo");
  const { fin } = rangoVista("dia", hoyISO(user.zonaHoraria), user.zonaHoraria);
  const [{ total }] = await db
    .select({ total: count() })
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.psicologoId, user.id),
        eq(recordatorios.completado, false),
        lt(recordatorios.fechaHora, fin),
      ),
    );
  return total;
}
