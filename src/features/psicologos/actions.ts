"use server";

import { isAPIError } from "better-auth/api";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/dal";
import { env } from "@/lib/env";
import { enviarCorreo } from "@/lib/mail/send";
import { correoBienvenida, correoContrasenaRestablecida } from "@/lib/mail/templates";
import { generarContrasenaTemporal } from "@/lib/password";
import { psicologoSchema } from "./schemas";

const RUTA = "/admin/psicologos";
const loginUrl = () => new URL("/login", env.BETTER_AUTH_URL).toString();

export type Credenciales = { id: string; contrasenaTemporal: string; correoEnviado: boolean };

async function esPsicologo(id: string) {
  const [fila] = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(and(eq(user.id, id), eq(user.role, "psicologo")))
    .limit(1);
  return fila ?? null;
}

export async function crearPsicologo(
  _prev: ActionState<Credenciales>,
  formData: FormData,
): Promise<ActionState<Credenciales>> {
  await requireRole("admin");
  const values = formValues(formData);
  const parsed = psicologoSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const { email, name, ...profesional } = parsed.data;
  const contrasenaTemporal = generarContrasenaTemporal();

  let id: string;
  try {
    const { user: creado } = await auth.api.createUser({
      body: { email, name, password: contrasenaTemporal, role: "psicologo" },
      headers: await headers(),
    });
    id = creado.id;
  } catch (error) {
    if (isAPIError(error) && String(error.body?.code ?? "").startsWith("USER_ALREADY_EXISTS")) {
      return {
        ok: false,
        message: "Revisa los campos marcados.",
        fieldErrors: { email: ["Ya existe una cuenta con este correo."] },
        values,
      };
    }
    console.error("[psicologos] crear:", error);
    return { ok: false, message: "No pudimos crear la cuenta. Inténtalo de nuevo.", values };
  }

  await db
    .update(user)
    .set({ ...profesional, mustChangePassword: true })
    .where(eq(user.id, id));

  const correo = await enviarCorreo({
    to: email,
    ...correoBienvenida({ nombre: name, email, contrasenaTemporal, loginUrl: loginUrl() }),
  });

  revalidatePath(RUTA);
  return {
    ok: true,
    message: `La cuenta de ${name} quedó creada.`,
    data: { id, contrasenaTemporal, correoEnviado: correo.ok },
  };
}

export async function actualizarPsicologo(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");
  const values = formValues(formData);
  const parsed = psicologoSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  if (!(await esPsicologo(id))) return { ok: false, message: "La cuenta no existe." };

  const [duplicado] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.email, parsed.data.email), ne(user.id, id)))
    .limit(1);
  if (duplicado) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: { email: ["Ya existe otra cuenta con este correo."] },
      values,
    };
  }

  await db.update(user).set(parsed.data).where(eq(user.id, id));

  revalidatePath(RUTA);
  revalidatePath(`${RUTA}/${id}`);
  return { ok: true, message: "Cambios guardados." };
}

export async function suspenderPsicologo(id: string): Promise<ActionState> {
  await requireRole("admin");
  if (!(await esPsicologo(id))) return { ok: false, message: "La cuenta no existe." };

  await auth.api.banUser({
    body: { userId: id, banReason: "Suspendida por la administración" },
    headers: await headers(),
  });
  revalidatePath(RUTA);
  return { ok: true, message: "Cuenta suspendida. Se cerraron sus sesiones activas." };
}

export async function reactivarPsicologo(id: string): Promise<ActionState> {
  await requireRole("admin");
  if (!(await esPsicologo(id))) return { ok: false, message: "La cuenta no existe." };

  await auth.api.unbanUser({ body: { userId: id }, headers: await headers() });
  revalidatePath(RUTA);
  return { ok: true, message: "Cuenta reactivada." };
}

export async function restablecerContrasena(id: string): Promise<ActionState<Credenciales>> {
  await requireRole("admin");
  const psicologo = await esPsicologo(id);
  if (!psicologo) return { ok: false, message: "La cuenta no existe." };

  const contrasenaTemporal = generarContrasenaTemporal();
  const h = await headers();
  await auth.api.setUserPassword({
    body: { userId: id, newPassword: contrasenaTemporal },
    headers: h,
  });
  await auth.api.revokeUserSessions({ body: { userId: id }, headers: h });
  await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, id));

  const correo = await enviarCorreo({
    to: psicologo.email,
    ...correoContrasenaRestablecida({
      nombre: psicologo.name,
      contrasenaTemporal,
      loginUrl: loginUrl(),
    }),
  });

  revalidatePath(RUTA);
  return {
    ok: true,
    message: "Contraseña restablecida.",
    data: { id, contrasenaTemporal, correoEnviado: correo.ok },
  };
}
