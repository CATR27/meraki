"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/db/schema";
import { cn } from "@/lib/utils";
import { isActive, NAV_GROUPS } from "./nav-items";

type SidebarNavProps = {
  role: Rol;
  /** Contadores por ruta (p. ej. recordatorios pendientes). */
  insignias?: Record<string, number>;
};

/** Navegación lateral: completa desde 1200px, solo iconos (riel) entre 768 y 1199px. */
export function SidebarNav({ role, insignias = {} }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 min-[1200px]:gap-5">
      {NAV_GROUPS[role].map((grupo) => (
        <div key={grupo.titulo} className="grid gap-1.5">
          <p className="hidden px-3 text-[11px] font-extrabold tracking-[0.14em] text-lavanda-300 uppercase min-[1200px]:block">
            {grupo.titulo}
          </p>
          <nav aria-label={grupo.titulo} className="grid gap-1">
            {grupo.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              const insignia = insignias[href] ?? 0;
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center justify-center gap-3 rounded-2xl text-[15px] transition-[transform,background-color] duration-200 outline-none hover:translate-x-[3px] focus-visible:ring-3 focus-visible:ring-white/40 min-[1200px]:h-12 min-[1200px]:justify-start min-[1200px]:px-2.5",
                    active
                      ? "bg-white font-extrabold text-lavanda-800 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.5)]"
                      : "font-semibold text-lavanda-200 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-[50%_50%_50%_12px]",
                      active
                        ? "bg-gradient-to-br from-lavanda-500 to-lavanda-700 text-white"
                        : "bg-white/8 text-lavanda-300",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[17px]" />
                  </span>
                  <span className="hidden flex-1 whitespace-nowrap min-[1200px]:block">{label}</span>
                  {insignia > 0 && (
                    <>
                      <span className="hidden h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#f07a9f] px-1.5 text-xs font-extrabold text-lavanda-950 min-[1200px]:flex">
                        {insignia}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute top-2 right-4 size-[9px] rounded-full border-2 border-sb2 bg-[#f07a9f] min-[1200px]:hidden"
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
