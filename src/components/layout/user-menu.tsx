"use client";

import { LogOutIcon, UserRoundCogIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
        className="flex items-center gap-3 rounded-full py-1 pr-1 pl-3 transition-colors outline-none hover:bg-lavanda-100 focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Menú de usuario"
      >
        <span className="hidden text-right leading-tight sm:block">
          <span className="block text-sm font-bold text-lavanda-950">{name}</span>
          <span className="block text-xs text-muted-foreground">{roleLabel}</span>
        </span>
        <Avatar className="size-9">
          <AvatarFallback className="bg-lavanda-200 font-heading font-bold text-lavanda-800">
            {iniciales(name)}
          </AvatarFallback>
        </Avatar>
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
