import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  like,
  min,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { consultantes, notasSesion } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { likePattern } from "@/lib/validation";
import { resumenAgenda } from "./resumen-agenda";
import type { FiltroEstado } from "./schemas";

export const POR_PAGINA = 20;

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

/** Conteos para los filtros de la lista (Todos / En proceso / Alta / Baja). */
export async function conteosPorEstado() {
  const user = await requireRole("psicologo");
  const filas = await db
    .select({ estado: consultantes.estado, n: count() })
    .from(consultantes)
    .where(eq(consultantes.psicologoId, user.id))
    .groupBy(consultantes.estado);
  const por = (e: string) => filas.find((f) => f.estado === e)?.n ?? 0;
  return {
    activo: por("activo"),
    alta: por("alta"),
    baja: por("baja"),
    todos: filas.reduce((s, f) => s + f.n, 0),
  };
}

/** Resumen del proceso terapéutico para la tarjeta "Su proceso" de la ficha. */
export async function procesoDelConsultante(id: string, desdeRespaldo: Date) {
  const user = await requireRole("psicologo");
  const donde = and(eq(notasSesion.consultanteId, id), eq(notasSesion.psicologoId, user.id));

  const [[resumen], recientes, [ultimaTarea]] = await Promise.all([
    db
      .select({ sesiones: count(), primera: min(notasSesion.fecha) })
      .from(notasSesion)
      .where(donde),
    db
      .select({
        numeroSesion: notasSesion.numeroSesion,
        estadoAnimo: notasSesion.estadoAnimo,
      })
      .from(notasSesion)
      .where(and(donde, isNotNull(notasSesion.estadoAnimo)))
      .orderBy(desc(notasSesion.fecha))
      .limit(8),
    db
      .select({ tarea: notasSesion.tareasAsignadas })
      .from(notasSesion)
      .where(and(donde, isNotNull(notasSesion.tareasAsignadas), ne(notasSesion.tareasAsignadas, "")))
      .orderBy(desc(notasSesion.fecha))
      .limit(1),
  ]);

  return {
    sesiones: resumen.sesiones,
    desde: resumen.primera ? new Date(Number(resumen.primera)) : desdeRespaldo,
    // De la más antigua a la más reciente, como se dibuja la gráfica.
    animo: recientes
      .reverse()
      .map((n) => ({ numero: n.numeroSesion, valor: n.estadoAnimo as number })),
    tarea: ultimaTarea?.tarea ?? null,
  };
}
