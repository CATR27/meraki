import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ROLES, type Rol } from "@/db/schema";
import { auth } from "@/lib/auth";
import { homeFor } from "@/lib/routes";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Rol;
  mustChangePassword: boolean;
};

/** Lee la sesión una sola vez por petición. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

function toRol(value: unknown): Rol {
  return ROLES.includes(value as Rol) ? (value as Rol) : "psicologo";
}

/**
 * Exige una sesión válida. Si el usuario tiene una contraseña temporal, lo envía a cambiarla
 * (salvo en la propia pantalla de cambio).
 */
export async function requireUser(options: { allowPasswordChange?: boolean } = {}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id, name, email, role, mustChangePassword } = session.user;
  if (mustChangePassword && !options.allowPasswordChange) redirect("/cambiar-contrasena");

  return { id, name, email, role: toRol(role), mustChangePassword } satisfies CurrentUser;
}

/** Exige un rol concreto; si no coincide, redirige al inicio de su rol. */
export async function requireRole(role: Rol) {
  const user = await requireUser();
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}
