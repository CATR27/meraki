/**
 * Crea la cuenta de administrador inicial.
 * Uso: pnpm db:seed  (lee ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD del .env)
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  // Importaciones dinámicas: deben ocurrir después de cargar el .env
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/db");
  const { user } = await import("@/db/schema");
  const { auth } = await import("@/lib/auth");

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Administración Meraki";

  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD en tu .env");
  }

  const existente = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existente) {
    console.log(`ℹ️  El usuario ${email} ya existe (rol: ${existente.role}). Nada que hacer.`);
    return;
  }

  // Llamada de servidor sin cabeceras: el plugin admin la permite sin sesión.
  const { user: creado } = await auth.api.createUser({
    body: { email, password, name, role: "admin" },
  });

  // El admin definió su contraseña en el .env, no es temporal.
  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, creado.id));

  console.log(`✅ Administrador creado: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  });
