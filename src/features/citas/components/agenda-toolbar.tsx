import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navegar, tituloVista, type Vista, VISTAS } from "@/lib/agenda";
import { cn } from "@/lib/utils";
import { agendaHref } from "../urls";

const VISTA_LABEL: Record<Vista, string> = { dia: "Día", semana: "Semana", mes: "Mes" };

export function AgendaToolbar({ vista, fecha, hoy }: { vista: Vista; fecha: string; hoy: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={agendaHref({ vista, fecha: navegar(vista, fecha, -1) })}
              aria-label="Anterior"
            >
              <ChevronLeftIcon />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={agendaHref({ vista, fecha: hoy })}>Hoy</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={agendaHref({ vista, fecha: navegar(vista, fecha, 1) })}
              aria-label="Siguiente"
            >
              <ChevronRightIcon />
            </Link>
          </Button>
        </div>
        <h2 className="font-heading text-xl font-bold capitalize sm:text-2xl" aria-live="polite">
          {tituloVista(vista, fecha)}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Vista del calendario" className="flex rounded-xl bg-lavanda-100/80 p-1">
          {VISTAS.map((v) => (
            <Link
              key={v}
              href={agendaHref({ vista: v, fecha })}
              aria-current={v === vista ? "page" : undefined}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-bold transition-colors",
                v === vista
                  ? "bg-card text-lavanda-800 shadow-sm"
                  : "text-lavanda-800/70 hover:text-lavanda-900",
              )}
            >
              {VISTA_LABEL[v]}
            </Link>
          ))}
        </nav>
        <Button asChild size="lg">
          <Link href={agendaHref({ vista, fecha, nueva: true })} scroll={false}>
            <PlusIcon /> Nueva cita
          </Link>
        </Button>
      </div>
    </div>
  );
}
