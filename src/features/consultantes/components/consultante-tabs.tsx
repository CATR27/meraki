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
      className="-mx-4 mb-8 overflow-x-auto overflow-y-hidden border-b border-border/80 px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
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
                  "-mb-px block border-b-2 px-4 py-3 text-sm font-bold transition-colors",
                  active
                    ? "border-lavanda-700 text-lavanda-800"
                    : "border-transparent text-muted-foreground hover:border-lavanda-300 hover:text-lavanda-800",
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
