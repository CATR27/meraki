"use server";

import { isAPIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/dal";
import { homeFor, safeRedirectPath } from "@/lib/routes";
import { cambiarContrasenaSchema, loginSchema } from "./schemas";

const MENSAJES_AUTH: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  INVALID_PASSWORD: "La contraseña actual no es correcta.",
  BANNED_USER: "Tu cuenta está suspendida. Contacta al administrador.",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
};

function mensajeDeError(error: unknown, porDefecto: string): string {
  if (isAPIError(error)) {
    if (error.statusCode === 429)
      return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code && MENSAJES_AUTH[code]) return MENSAJES_AUTH[code];
  }
  console.error("[auth]", error);
  return porDefecto;
}

export async function iniciarSesion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = formValues(formData, ["password"]);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorState(parsed.error, values);

  let destino: string;
  try {
    const { user } = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: await headers(),
    });
    const rol = user.role === "admin" ? "admin" : "psicologo";
    destino = user.mustChangePassword
      ? "/cambiar-contrasena"
      : (safeRedirectPath(formData.get("desde")) ?? homeFor(rol));
  } catch (error) {
    return { ok: false, message: mensajeDeError(error, "No pudimos iniciar sesión."), values };
  }

  redirect(destino);
}

export async function cambiarContrasena(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser({ allowPasswordChange: true });
  const parsed = cambiarContrasenaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.actual,
        newPassword: parsed.data.nueva,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    const message = mensajeDeError(error, "No pudimos cambiar la contraseña.");
    return {
      ok: false,
      message,
      fieldErrors: message.includes("actual") ? { actual: [message] } : undefined,
    };
  }

  if (user.mustChangePassword) {
    await db.update(userTable).set({ mustChangePassword: false }).where(eq(userTable.id, user.id));
  }

  redirect(homeFor(user.role));
}

export async function cerrarSesion() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
