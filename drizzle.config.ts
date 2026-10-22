import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const common = {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  strict: true,
  verbose: true,
} as const;

// Archivo local en desarrollo; Turso (libSQL remoto) en producción.
export default url.startsWith("file:")
  ? defineConfig({ ...common, dialect: "sqlite", dbCredentials: { url } })
  : defineConfig({ ...common, dialect: "turso", dbCredentials: { url, authToken } });
