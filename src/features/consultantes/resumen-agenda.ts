import { type Column, sql } from "drizzle-orm";
import { citas, consultantes, notasSesion } from "@/db/schema";

/**
 * Próxima cita vigente y última sesión de cada consultante (subconsultas correlacionadas).
 *
 * Drizzle no califica las columnas en un select de una sola tabla ("id" en vez de
 * "consultantes"."id"), y dentro de la subconsulta "id" se resolvería como citas.id.
 * Por eso aquí todas las referencias van calificadas explícitamente.
 */
const col = (tabla: string, columna: Column) =>
  sql`${sql.identifier(tabla)}.${sql.identifier(columna.name)}`;

export function resumenAgenda(ahora: number) {
  const consultanteId = col("consultantes", consultantes.id);
  return {
    proximaCita: sql<number | null>`(
      select min(${col("ci", citas.inicio)}) from ${citas} as ${sql.identifier("ci")}
      where ${col("ci", citas.consultanteId)} = ${consultanteId}
        and ${col("ci", citas.inicio)} >= ${ahora}
        and ${col("ci", citas.estado)} in ('programada', 'confirmada')
    )`,
    ultimaSesion: sql<number | null>`(
      select max(${col("ns", notasSesion.fecha)}) from ${notasSesion} as ${sql.identifier("ns")}
      where ${col("ns", notasSesion.consultanteId)} = ${consultanteId}
    )`,
  };
}
