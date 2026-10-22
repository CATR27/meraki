import {
  BellRingIcon,
  CalendarDaysIcon,
  HouseIcon,
  type LucideIcon,
  UserRoundCogIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { Rol } from "@/db/schema";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: Record<Rol, NavItem[]> = {
  admin: [
    { href: "/admin/psicologos", label: "Psicólogos", icon: UsersRoundIcon },
    { href: "/perfil", label: "Mi cuenta", icon: UserRoundCogIcon },
  ],
  psicologo: [
    { href: "/panel", label: "Inicio", icon: HouseIcon },
    { href: "/agenda", label: "Agenda", icon: CalendarDaysIcon },
    { href: "/consultantes", label: "Consultantes", icon: UsersRoundIcon },
    { href: "/recordatorios", label: "Recordatorios", icon: BellRingIcon },
    { href: "/perfil", label: "Mi perfil", icon: UserRoundCogIcon },
  ],
};

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
