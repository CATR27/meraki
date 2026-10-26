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
    <div className="grid min-w-0 flex-1 leading-tight min-[768px]:min-w-max min-[768px]:flex-none">
      <span className="truncate text-xs font-bold text-muted-foreground">{miga}</span>
      <span className="truncate font-heading text-lg font-bold whitespace-nowrap text-ink">{titulo}</span>
    </div>
  );
}

/** Acceso rápido al buscador de consultantes (campo desde tablet, botón en móvil). */
export function TopbarBuscador() {
  return (
    <>
      <Link
        href="/consultantes"
        className="ml-auto hidden h-11 max-w-[340px] min-w-11 flex-1 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-lavanda-300 min-[768px]:flex"
      >
        <SearchIcon className="size-[18px] flex-none" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Buscar consultante, cita o nota…</span>
        <kbd className="flex-none rounded-lg bg-muted px-2 py-0.5 font-sans text-[11px] font-bold">⌘K</kbd>
      </Link>
      <Link
        href="/consultantes"
        aria-label="Buscar consultante"
        className="ml-auto flex size-11 flex-none items-center justify-center rounded-[14px] border border-border bg-card text-deep min-[768px]:hidden"
      >
        <SearchIcon className="size-[19px]" aria-hidden="true" />
      </Link>
    </>
  );
}
