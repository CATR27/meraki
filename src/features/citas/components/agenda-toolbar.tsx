import { CalendarPlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { navegar, tituloVista, type Vista, VISTAS } from "@/lib/agenda";
import { mayuscula } from "@/lib/format";
import { cn } from "@/lib/utils";
import { agendaHref } from "../urls";

const VISTA_LABEL: Record<Vista, string> = { dia: "Día", semana: "Semana", mes: "Mes" };
const TITULO: Record<Vista, string> = { dia: "Tu día", semana: "Tu semana", mes: "Tu mes" };

const CIRCULO =
  "flex size-10 items-center justify-center rounded-full border border-border bg-card text-deep transition-colors hover:bg-tint-2";

export function AgendaToolbar({ vista, fecha, hoy }: { vista: Vista; fecha: string; hoy: string }) {
  return (
    <div className="animate-mk-up mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-bold text-lavanda-600" aria-live="polite">
          {mayuscula(tituloVista(vista, fecha))}
        </p>
        <h1 className="mt-0.5 text-3xl font-bold tracking-[-0.02em] sm:text-[34px]">
          {TITULO[vista]}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <nav aria-label="Vista del calendario" className="flex rounded-full bg-tint-2 p-1">
          {VISTAS.map((v) => (
            <Link
              key={v}
              href={agendaHref({ vista: v, fecha })}
              aria-current={v === vista ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                v === vista
                  ? "bg-card font-extrabold text-deep shadow-[0_4px_12px_-6px_rgba(101,52,168,0.4)]"
                  : "font-bold text-muted-foreground hover:text-deep",
              )}
            >
              {VISTA_LABEL[v]}
            </Link>
          ))}
        </nav>
        <div className="flex gap-1.5">
          <Link
            href={agendaHref({ vista, fecha: navegar(vista, fecha, -1) })}
            aria-label="Anterior"
            className={CIRCULO}
          >
            <ChevronLeftIcon className="size-[18px]" />
          </Link>
          <Link
            href={agendaHref({ vista, fecha: hoy })}
            className="flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-extrabold text-deep transition-colors hover:bg-tint-2"
          >
            Hoy
          </Link>
          <Link
            href={agendaHref({ vista, fecha: navegar(vista, fecha, 1) })}
            aria-label="Siguiente"
            className={CIRCULO}
          >
            <ChevronRightIcon className="size-[18px]" />
          </Link>
        </div>
        <Link
          href={agendaHref({ vista, fecha, nueva: true })}
          scroll={false}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-[11px] text-sm font-extrabold text-primary-foreground shadow-[0_10px_22px_-10px_rgba(101,52,168,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <CalendarPlusIcon className="size-[17px]" aria-hidden="true" /> Nueva cita
        </Link>
      </div>
    </div>
  );
}
