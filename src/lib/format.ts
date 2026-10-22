import type { Rol } from "@/db/schema";

export const ROL_LABEL: Record<Rol, string> = {
  admin: "Administración",
  psicologo: "Psicología",
};

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0]?.slice(0, 2) ?? "");
  return letras.toUpperCase();
}

export function nombreCompleto(p: { nombre: string; apellidos: string }): string {
  return `${p.nombre} ${p.apellidos}`.trim();
}
