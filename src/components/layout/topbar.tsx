"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/db/schema";
import { tituloDeRuta } from "./nav-items";

/** Migas + título de la pantalla actual. */
export function TopbarTitulo({ role }: { role: Rol }) {
  const [miga, titulo] = tituloDeRuta(usePathname(), role);
  return (
    <div className="grid min-w-0 leading-tight">
      <span className="truncate text-xs font-bold text-muted-foreground">{miga}</span>
      <span className="truncate font-heading text-lg font-bold text-ink">{titulo}</span>
    </div>
  );
}

/** Acceso rápido al buscador de consultantes. */
export function TopbarBuscador() {
  return (
    <Link
      href="/consultantes"
      className="ml-auto hidden h-11 w-80 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-lavanda-300 xl:flex"
    >
      <SearchIcon className="size-[18px]" aria-hidden="true" />
      Buscar consultante…
    </Link>
  );
}
