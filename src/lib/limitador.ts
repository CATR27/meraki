import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { limites } from "@/db/schema";

type Regla = { window: number; max: number }; // window en segundos

/**
 * Límite de intentos persistido en la BD. Cada consumo es un único UPSERT … RETURNING,
 * atómico incluso con varias instancias del servidor (compatible con Better Auth `customStorage`).
 */
export function crearLimitador<T extends Record<string, unknown>>(db: LibSQLDatabase<T>) {
  async function consume(key: string, { window, max }: Regla) {
    const ahora = Date.now();
    const nuevoReset = ahora + window * 1000;
    const [fila] = await db
      .insert(limites)
      .values({ key, count: 1, resetAt: nuevoReset })
      .onConflictDoUpdate({
        target: limites.key,
        set: {
          count: sql`case when ${limites.resetAt} <= ${ahora} then 1 else ${limites.count} + 1 end`,
          resetAt: sql`case when ${limites.resetAt} <= ${ahora} then ${nuevoReset} else ${limites.resetAt} end`,
        },
      })
      .returning({ count: limites.count, resetAt: limites.resetAt });

    const allowed = fila.count <= max;
    return {
      allowed,
      retryAfter: allowed ? null : Math.max(1, Math.ceil((fila.resetAt - ahora) / 1000)),
    };
  }

  async function limpiar(key: string) {
    await db.delete(limites).where(eq(limites.key, key));
  }

  return { consume, limpiar };
}

/** Clave estable sin guardar datos personales en claro. */
export function claveLimite(prefijo: string, valor: string) {
  return `${prefijo}:${createHash("sha256").update(valor.trim().toLowerCase()).digest("hex").slice(0, 32)}`;
}

/** IP del cliente detrás del proxy de Vercel (primer valor de x-forwarded-for). */
export function ipCliente(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}
