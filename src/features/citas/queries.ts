import "server-only";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { citas, consultantes, notasSesion } from "@/db/schema";
import { obtenerConsultante } from "@/features/consultantes/queries";
import { requireRole } from "@/lib/dal";

const columnasCita = {
  id: citas.id,
  consultanteId: citas.consultanteId,
  inicio: citas.inicio,
  fin: citas.fin,
  modalidad: citas.modalidad,
  estado: citas.estado,
  enlaceVideollamada: citas.enlaceVideollamada,
  nombre: consultantes.nombre,
  apellidos: consultantes.apellidos,
};

/** Citas del psicólogo en sesión dentro de [inicio, fin). */
export async function listarCitasRango(inicio: Date, fin: Date) {
  const user = await requireRole("psicologo");
  return db
    .select(columnasCita)
    .from(citas)
    .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
    .where(and(eq(citas.psicologoId, user.id), gte(citas.inicio, inicio), lt(citas.inicio, fin)))
    .orderBy(asc(citas.inicio));
}

export type CitaAgenda = Awaited<ReturnType<typeof listarCitasRango>>[number];

/** Detalle de una cita propia (404 si no existe o es de otra persona). */
export const obtenerCita = cache(async (id: string) => {
  const user = await requireRole("psicologo");
  const [cita] = await db
    .select({
      ...columnasCita,
      notas: citas.notas,
      confirmacionEnviadaAt: citas.confirmacionEnviadaAt,
      email: consultantes.email,
      telefono: consultantes.telefono,
      notaId: notasSesion.id,
      notaEstado: notasSesion.estado,
    })
    .from(citas)
    .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
    .leftJoin(notasSesion, eq(notasSesion.citaId, citas.id))
    .where(and(eq(citas.id, id), eq(citas.psicologoId, user.id)))
    .limit(1);
  if (!cita) notFound();
  return cita;
});

export type CitaDetalle = Awaited<ReturnType<typeof obtenerCita>>;

/** Citas de un consultante separadas en próximas (ascendente) e historial (descendente). */
export async function citasDeConsultante(consultanteId: string) {
  const consultante = await obtenerConsultante(consultanteId);
  const filas = await db
    .select({
      id: citas.id,
      inicio: citas.inicio,
      fin: citas.fin,
      modalidad: citas.modalidad,
      estado: citas.estado,
      notaId: notasSesion.id,
    })
    .from(citas)
    .leftJoin(notasSesion, eq(notasSesion.citaId, citas.id))
    .where(eq(citas.consultanteId, consultante.id))
    .orderBy(desc(citas.inicio));

  const ahora = Date.now();
  return {
    total: filas.length,
    proximas: filas.filter((c) => c.inicio.getTime() >= ahora).reverse(),
    historial: filas.filter((c) => c.inicio.getTime() < ahora),
  };
}

export type CitaConsultante = Awaited<ReturnType<typeof citasDeConsultante>>["historial"][number];
