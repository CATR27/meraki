import { CalendarPlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Ornamento } from "@/components/brand/ornamento";
import { navegar, tituloVista, type Vista, VISTAS } from "@/lib/agenda";
import { mayuscula } from "@/lib/format";
import { cn } from "@/lib/utils";
import { agendaHref } from "../urls";

const VISTA_LABEL: Record<Vista, string> = { dia: "Día", semana: "Semana", mes: "Mes" };
const TITULO: Record<Vista, string> = { dia: "Tu día", semana: "Tu semana", mes: "Tu mes" };

const CIRCULO =
  "flex size-11 flex-none items-center justify-center rounded-full border border-border bg-card text-deep transition-colors hover:bg-tint-2";

export function AgendaToolbar({ vista, fecha, hoy }: { vista: Vista; fecha: string; hoy: string }) {
  return (
    <div className="animate-mk-up relative isolate mb-6 grid gap-4 @min-[640px]:flex @min-[640px]:flex-wrap @min-[640px]:items-end @min-[640px]:justify-between">
      <Ornamento n="09_orbitas_serenas" anim="spin" op={0.9} dur={12} className="-top-[46px] right-[clamp(120px,22vw,320px)] -z-10 size-[150px]" />
      <div>
        <p className="font-bold text-lavanda-600" aria-live="polite">
          {mayuscula(tituloVista(vista, fecha))}
        </p>
        <h1 className="mt-0.5 text-[clamp(26px,7vw,34px)] font-bold tracking-[-0.02em]">
          {TITULO[vista]}
        </h1>
      </div>

      <div className="grid gap-2.5 @min-[640px]:flex @min-[640px]:flex-wrap @min-[640px]:items-center">
        <nav aria-label="Vista del calendario" className="flex rounded-full bg-tint-2 p-1 @min-[640px]:inline-flex">
          {VISTAS.map((v) => (
            <Link
              key={v}
              href={agendaHref({ vista: v, fecha })}
              aria-current={v === vista ? "page" : undefined}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-center text-sm transition-colors @min-[640px]:flex-none @min-[640px]:py-2",
                v === vista
                  ? "bg-card font-extrabold text-deep shadow-[0_4px_12px_-6px_rgba(101,52,168,0.4)]"
                  : "font-bold text-muted-foreground hover:text-deep",
              )}
            >
              {VISTA_LABEL[v]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href={agendaHref({ vista, fecha: navegar(vista, fecha, -1) })}
            aria-label="Anterior"
            className={CIRCULO}
          >
            <ChevronLeftIcon className="size-[18px]" />
          </Link>
          <Link
            href={agendaHref({ vista, fecha: hoy })}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-extrabold text-deep transition-colors hover:bg-tint-2 @min-[640px]:flex-none"
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
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 @min-[640px]:py-[11px] text-sm font-extrabold text-primary-foreground shadow-[0_10px_22px_-10px_rgba(101,52,168,0.6)] transition-transform hover:-translate-y-0.5 hover:text-primary-foreground"
        >
          <CalendarPlusIcon className="size-[17px]" aria-hidden="true" /> Nueva cita
        </Link>
      </div>
    </div>
  );
}
