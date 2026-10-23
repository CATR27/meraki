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

export function SidebarNav({ role, insignias = {} }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {NAV_GROUPS[role].map((grupo) => (
        <div key={grupo.titulo} className="grid gap-2">
          <p className="px-3 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "bg-card font-extrabold text-deep shadow-[0_6px_16px_-10px_rgba(101,52,168,0.5),inset_0_0_0_1px_var(--border)]"
                      : "font-semibold text-sidebar-foreground/80 hover:bg-tint-2",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-[9px]",
                      active ? "bg-primary text-primary-foreground" : "text-lavanda-500",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[17px]" />
                  </span>
                  <span className="flex-1">{label}</span>
                  {insignia > 0 && (
                    <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-destructive-soft px-1.5 text-xs font-extrabold text-destructive">
                      {insignia}
                    </span>
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
