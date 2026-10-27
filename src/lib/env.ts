import { z } from "zod";

// Sin "server-only": también lo usan drizzle.config.ts y el script de seed (Node puro).

/** Variable opcional: vacía (como en .env.example) equivale a no definida. */
const opcional = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined);

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1).default("file:local.db"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  SMTP_HOST: z.string().min(1).default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(1).default("Meraki <no-responder@meraki.local>"),
  APP_TIMEZONE: z.string().min(1).default("America/Mexico_City"),
  // Grabación de sesiones e IA (opcionales: sin ellas la función no se muestra).
  BLOB_STORE_ID: opcional,
  BLOB_READ_WRITE_TOKEN: opcional,
  GROQ_API_KEY: opcional,
  CRON_SECRET: opcional,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Variables de entorno inválidas. Revisa tu archivo .env");
}

export const env = parsed.data;
