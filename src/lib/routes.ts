import type { Rol } from "@/db/schema";

export function homeFor(role: Rol): string {
  return role === "admin" ? "/admin/psicologos" : "/panel";
}

/** Acepta solo rutas internas para evitar redirecciones abiertas. */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
