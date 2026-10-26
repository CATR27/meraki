import {
  BellRingIcon,
  CalendarDaysIcon,
  HouseIcon,
  type LucideIcon,
  UserRoundCogIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { Rol } from "@/db/schema";

export type NavItem = { href: string; label: string; icon: LucideIcon; corto?: string };
export type NavGroup = { titulo: string; items: NavItem[] };

export const NAV_GROUPS: Record<Rol, NavGroup[]> = {
  admin: [
    {
      titulo: "Administración",
      items: [{ href: "/admin/psicologos", label: "Psicólogos", icon: UsersRoundIcon }],
    },
    {
      titulo: "Cuenta",
      items: [{ href: "/perfil", label: "Mi cuenta", icon: UserRoundCogIcon, corto: "Cuenta" }],
    },
  ],
  psicologo: [
    {
      titulo: "Consultorio",
      items: [
        { href: "/panel", label: "Inicio", icon: HouseIcon },
        { href: "/agenda", label: "Agenda", icon: CalendarDaysIcon },
        { href: "/consultantes", label: "Consultantes", icon: UsersRoundIcon, corto: "Personas" },
        { href: "/recordatorios", label: "Recordatorios", icon: BellRingIcon, corto: "Avisos" },
      ],
    },
    {
      titulo: "Cuenta",
      items: [{ href: "/perfil", label: "Mi perfil", icon: UserRoundCogIcon, corto: "Perfil" }],
    },
  ],
};

export function itemsPlanos(role: Rol): NavItem[] {
  return NAV_GROUPS[role].flatMap((g) => g.items);
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Migas y título de la barra superior según la ruta. */
export function tituloDeRuta(pathname: string, role: Rol): [miga: string, titulo: string] {
  if (pathname.startsWith("/panel")) return ["Consultorio", "Inicio"];
  if (pathname.startsWith("/agenda")) return ["Consultorio", "Agenda"];
  if (pathname.startsWith("/recordatorios")) return ["Consultorio", "Recordatorios"];
  if (pathname.startsWith("/citas/")) return ["Inicio", "Sesión en curso"];
  if (pathname === "/consultantes/nuevo") return ["Consultantes", "Nuevo consultante"];
  if (pathname.startsWith("/consultantes/")) {
    if (pathname.endsWith("/expediente")) return ["Consultantes", "Expediente clínico"];
    if (pathname.endsWith("/editar")) return ["Consultantes", "Editar datos"];
    return ["Consultantes", "Ficha del consultante"];
  }
  if (pathname.startsWith("/consultantes")) return ["Consultorio", "Consultantes"];
  if (pathname.startsWith("/perfil")) return ["Cuenta", role === "admin" ? "Mi cuenta" : "Mi perfil"];
  if (pathname.startsWith("/admin/psicologos/nuevo")) return ["Administración", "Nueva cuenta"];
  if (pathname.startsWith("/admin")) return ["Administración", "Psicólogos"];
  return ["Meraki", "Inicio"];
}
