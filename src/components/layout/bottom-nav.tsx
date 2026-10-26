"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/db/schema";
import { cn } from "@/lib/utils";
import { isActive, itemsPlanos } from "./nav-items";

/** Barra inferior flotante en móvil (<768px); se oculta durante la sesión para dejar espacio al botón de finalizar. */
export function BottomNav({ role, avisos = false }: { role: Rol; avisos?: boolean }) {
  const pathname = usePathname();
  if (/^\/citas\/[^/]+\/sesion/.test(pathname)) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex h-[68px] items-center justify-around gap-1 rounded-3xl bg-[linear-gradient(165deg,var(--sb1),var(--sb2))] px-2 shadow-[0_20px_40px_-16px_rgba(36,19,63,0.65)] min-[768px]:hidden"
    >
      {itemsPlanos(role).map(({ href, label, corto, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-[54px] max-w-[84px] flex-1 flex-col items-center justify-center gap-[3px] rounded-[18px] text-[11px] font-extrabold transition-colors hover:text-white",
              active ? "bg-white/16 text-white" : "text-lavanda-300",
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
            <span className="whitespace-nowrap">{corto ?? label}</span>
            {avisos && href === "/recordatorios" && (
              <span className="absolute top-1.5 right-[calc(50%-16px)] size-2 rounded-full bg-[#f07a9f]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
