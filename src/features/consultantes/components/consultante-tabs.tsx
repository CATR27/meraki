"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ConsultanteTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  // En pantallas angostas la pestaña activa puede quedar fuera de vista.
  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);
  const base = `/consultantes/${id}`;
  const tabs = [
    { href: base, label: "Datos generales", corto: "Datos", exact: true },
    { href: `${base}/expediente`, label: "Expediente" },
    { href: `${base}/sesiones`, label: "Sesiones" },
    { href: `${base}/citas`, label: "Citas" },
  ];

  return (
    <nav
      ref={nav}
      aria-label="Secciones del consultante"
      className="animate-mk-up mb-6 max-w-full overflow-x-auto [scrollbar-width:none] [animation-delay:60ms]"
    >
      <ul className="flex w-max gap-1 rounded-full bg-tint-2 p-[5px]">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.href || pathname === `${base}/editar`
            : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-full px-[18px] py-2.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-card font-extrabold text-deep shadow-[0_4px_12px_-6px_rgba(101,52,168,0.45)]"
                    : "font-bold text-muted-foreground hover:text-deep",
                )}
              >
                {t.corto ? (
                  <>
                    <span className="@min-[520px]:hidden">{t.corto}</span>
                    <span className="hidden @min-[520px]:inline">{t.label}</span>
                  </>
                ) : (
                  t.label
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
