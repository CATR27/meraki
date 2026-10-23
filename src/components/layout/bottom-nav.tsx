"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/db/schema";
import { cn } from "@/lib/utils";
import { isActive, itemsPlanos } from "./nav-items";

/** Navegación inferior en móvil; se oculta durante la sesión para dejar espacio al botón de finalizar. */
export function BottomNav({ role }: { role: Rol }) {
  const pathname = usePathname();
  if (/^\/citas\/[^/]+\/sesion/.test(pathname)) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-card px-3 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {itemsPlanos(role).map(({ href, label, corto, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "grid min-w-14 justify-items-center gap-1 text-[11px] font-extrabold",
              active ? "text-deep" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded-full",
                active && "bg-tint-2",
              )}
            >
              <Icon aria-hidden="true" className="size-[19px]" />
            </span>
            {corto ?? label}
          </Link>
        );
      })}
    </nav>
  );
}
