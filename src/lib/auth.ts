import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
import { ac, roles } from "@/lib/permissions";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // las cuentas solo las crea el admin
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 12, // 12 h
    updateAge: 60 * 60, // renueva cada hora de uso
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      mustChangePassword: { type: "boolean", defaultValue: true, input: false },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "psicologo",
      adminRoles: ["admin"],
      bannedUserMessage: "Tu cuenta está suspendida. Contacta al administrador.",
    }),
    nextCookies(), // debe ir al final
  ],
});

export type Session = typeof auth.$Infer.Session;
