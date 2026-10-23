"use client";

import { LogOutIcon, UserRoundCogIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cerrarSesion } from "@/features/auth/actions";
import { iniciales } from "@/lib/format";

type UserMenuProps = { name: string; email: string; roleLabel: string };

export function UserMenu({ name, email, roleLabel }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-11 items-center gap-2.5 rounded-[14px] pr-3 pl-1 transition-colors outline-none hover:bg-tint-2 focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Menú de usuario"
      >
        <span className="flex size-9 items-center justify-center rounded-avatar bg-gradient-to-br from-lavanda-300 to-lavanda-500 font-heading text-sm font-bold text-white">
          {iniciales(name)}
        </span>
        <span className="hidden text-left leading-[1.15] sm:grid">
          <span className="text-sm font-bold text-ink">{name}</span>
          <span className="text-xs text-muted-foreground">{roleLabel}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold text-foreground">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <UserRoundCogIcon /> Mi perfil y seguridad
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={cerrarSesion}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOutIcon /> Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
