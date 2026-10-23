import "server-only";
import { and, asc, count, eq, getTableColumns, like, or, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { citas, consultantes, notasSesion } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { likePattern } from "@/lib/validation";
import type { FiltroEstado } from "./schemas";

export const POR_PAGINA = 20;

/** Próxima cita vigente y última sesión registrada, como subconsultas correlacionadas. */
function resumenAgenda(ahora: number) {
  return {
    proximaCita: sql<number | null>`(
      select min(${citas.inicio}) from ${citas}
      where ${citas.consultanteId} = ${consultantes.id}
        and ${citas.inicio} >= ${ahora}
        and ${citas.estado} in ('programada', 'confirmada')
    )`,
    ultimaSesion: sql<number | null>`(
      select max(${notasSesion.fecha}) from ${notasSesion}
      where ${notasSesion.consultanteId} = ${consultantes.id}
    )`,
  };
}

const toDate = (ms: number | null) => (ms == null ? null : new Date(Number(ms)));

export async function listarConsultantes({
  q,
  estado = "activo",
  pagina = 1,
}: {
  q?: string;
  estado?: FiltroEstado;
  pagina?: number;
}) {
  const user = await requireRole("psicologo");
  const busqueda = q?.trim() ? likePattern(q) : null;

  const where = and(
    eq(consultantes.psicologoId, user.id),
    estado !== "todos" ? eq(consultantes.estado, estado) : undefined,
    busqueda
      ? or(
          like(sql`${consultantes.nombre} || ' ' || ${consultantes.apellidos}`, busqueda),
          like(consultantes.telefono, busqueda),
          like(consultantes.email, busqueda),
        )
      : undefined,
  );

  const [filas, [{ total }]] = await Promise.all([
    db
      .select({
        id: consultantes.id,
        nombre: consultantes.nombre,
        apellidos: consultantes.apellidos,
        fechaNacimiento: consultantes.fechaNacimiento,
        telefono: consultantes.telefono,
        estado: consultantes.estado,
        consentimientoInformado: consultantes.consentimientoInformado,
        ...resumenAgenda(Date.now()),
      })
      .from(consultantes)
      .where(where)
      .orderBy(asc(consultantes.apellidos), asc(consultantes.nombre))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),
    db.select({ total: count() }).from(consultantes).where(where),
  ]);

  return {
    consultantes: filas.map((f) => ({
      ...f,
      proximaCita: toDate(f.proximaCita),
      ultimaSesion: toDate(f.ultimaSesion),
    })),
    total,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  };
}

export type ConsultanteListado = Awaited<
  ReturnType<typeof listarConsultantes>
>["consultantes"][number];

/**
 * Consultante del psicólogo en sesión. Si no existe o pertenece a otra persona → 404
 * (no se revela su existencia). Deduplicado por petición para layout + página.
 */
export const obtenerConsultante = cache(async (id: string) => {
  const user = await requireRole("psicologo");
  const [fila] = await db
    .select({ ...getTableColumns(consultantes), ...resumenAgenda(Date.now()) })
    .from(consultantes)
    .where(and(eq(consultantes.id, id), eq(consultantes.psicologoId, user.id)))
    .limit(1);
  if (!fila) notFound();

  return {
    ...fila,
    proximaCita: toDate(fila.proximaCita),
    ultimaSesion: toDate(fila.ultimaSesion),
  };
});

export type Consultante = Awaited<ReturnType<typeof obtenerConsultante>>;

/** Opciones ligeras para selectores (p. ej. al agendar una cita). */
export async function opcionesConsultantes() {
  const user = await requireRole("psicologo");
  return db
    .select({
      id: consultantes.id,
      nombre: consultantes.nombre,
      apellidos: consultantes.apellidos,
      tieneEmail: sql<boolean>`${consultantes.email} is not null`.mapWith(Boolean),
    })
    .from(consultantes)
    .where(and(eq(consultantes.psicologoId, user.id), eq(consultantes.estado, "activo")))
    .orderBy(asc(consultantes.apellidos), asc(consultantes.nombre));
}
