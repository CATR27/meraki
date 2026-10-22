"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@/db/schema";
import { cn } from "@/lib/utils";
import { isActive, NAV_ITEMS } from "./nav-items";

export function SidebarNav({ role, onNavigate }: { role: Rol; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="grid gap-1">
      {NAV_ITEMS[role].map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-lavanda-700 text-white shadow-md shadow-lavanda-700/25"
                : "text-lavanda-900/80 hover:bg-lavanda-100 hover:text-lavanda-800",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-5 shrink-0",
                active ? "text-lavanda-100" : "text-lavanda-500 group-hover:text-lavanda-700",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
