import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/db/schema";

/** BD SQLite en memoria con las migraciones reales del proyecto, para pruebas de integración. */
export async function crearDbPrueba() {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  return db;
}

export async function sembrarPsicologo(
  db: Awaited<ReturnType<typeof crearDbPrueba>>,
  id = "psi-1",
) {
  await db.insert(schema.user).values({ id, name: "Psic. Prueba", email: `${id}@test.mx` });
  return id;
}
