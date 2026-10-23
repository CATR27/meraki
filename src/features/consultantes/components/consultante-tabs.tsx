"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ConsultanteTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/consultantes/${id}`;
  const tabs = [
    { href: base, label: "Datos generales", exact: true },
    { href: `${base}/expediente`, label: "Expediente" },
    { href: `${base}/sesiones`, label: "Sesiones" },
    { href: `${base}/citas`, label: "Citas" },
  ];

  return (
    <nav
      aria-label="Secciones del consultante"
      className="animate-mk-up mb-6 max-w-full overflow-x-auto [animation-delay:60ms]"
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
                  "block rounded-full px-[18px] py-[9px] text-sm transition-colors",
                  active
                    ? "bg-card font-extrabold text-deep shadow-[0_4px_12px_-6px_rgba(101,52,168,0.45)]"
                    : "font-bold text-muted-foreground hover:text-deep",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
