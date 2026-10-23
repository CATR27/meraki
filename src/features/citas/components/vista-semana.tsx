import { VideoIcon } from "lucide-react";
import Link from "next/link";
import { HORA_FIN, HORA_INICIO, inicioDelDia, posicionEnDia, type Vista } from "@/lib/agenda";
import { formatEnZona } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ScrollAHora } from "./scroll-a-hora";
import { ESTADO_CITA_BLOQUE } from "../constantes";
import type { CitaAgenda } from "../queries";
import { agendaHref } from "../urls";

type Props = {
  vista: Vista;
  fecha: string;
  dias: string[];
  citas: CitaAgenda[];
  zona: string;
  hoy: string;
  ahora: Date;
};

const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
const ALTO_HORA = 56; // px

/** Vista de día/semana: rejilla horaria con citas posicionadas por minuto. */
export function VistaSemana({ vista, fecha, dias, citas, zona, hoy, ahora }: Props) {
  const citasPorDia = new Map<string, CitaAgenda[]>();
  for (const c of citas) {
    const dia = formatEnZona(c.inicio, "yyyy-MM-dd", zona);
    citasPorDia.set(dia, [...(citasPorDia.get(dia) ?? []), c]);
  }
  // Las canceladas se dibujan primero para que las activas queden encima.
  for (const lista of citasPorDia.values()) {
    lista.sort((a, b) => Number(b.estado === "cancelada") - Number(a.estado === "cancelada"));
  }
  const ahoraPos = posicionEnDia(ahora, ahora, zona).top;

  // Al abrir, muestra desde una hora antes de "ahora" si hoy está visible; si no, desde las 8:00.
  const horaAncla = dias.includes(hoy)
    ? Math.floor((ahoraPos / 100) * HORAS.length) - 1
    : 8 - HORA_INICIO;

  return (
    <div className="animate-mk-up overflow-hidden rounded-3xl border bg-card [animation-delay:100ms]">
      <ScrollAHora
        offsetPx={horaAncla * ALTO_HORA}
        className="max-h-[calc(100svh-15rem)] min-h-96 overflow-auto overscroll-contain"
      >
        <div className={cn(vista === "semana" && "min-w-[46rem]")}>
          {/* Encabezado de días */}
          <div
            className="sticky top-0 z-30 grid border-b bg-card/95 backdrop-blur"
            style={{ gridTemplateColumns: `4rem repeat(${dias.length}, minmax(0, 1fr))` }}
          >
            <div />
            {dias.map((d) => {
              const esHoy = d === hoy;
              return (
                <Link
                  key={d}
                  href={agendaHref({ vista: "dia", fecha: d })}
                  className={cn(
                    "flex items-center justify-center gap-2.5 border-l px-2 py-3 transition-colors hover:bg-tint-2/60",
                    esHoy && "bg-tint",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center font-heading text-lg font-bold",
                      esHoy
                        ? "rounded-[50%_50%_50%_12%] bg-primary text-primary-foreground"
                        : "rounded-full text-ink",
                    )}
                  >
                    {Number(d.slice(8))}
                  </span>
                  <span className="hidden text-sm font-extrabold capitalize sm:block">
                    {formatEnZona(inicioDelDia(d, zona), "EEE", zona)}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Rejilla */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `4rem repeat(${dias.length}, minmax(0, 1fr))` }}
          >
            <div className="relative" style={{ height: HORAS.length * ALTO_HORA }}>
              {HORAS.map((h, i) => (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
                  style={{ top: i * ALTO_HORA }}
                >
                  {i === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                </span>
              ))}
            </div>

            {dias.map((d) => (
              <div
                key={d}
                className={cn("relative border-l", d === hoy && "bg-tint")}
                style={{ height: HORAS.length * ALTO_HORA }}
              >
                {/* Huecos por hora: crean una cita con fecha y hora prellenadas */}
                {HORAS.map((h, i) => (
                  <Link
                    key={h}
                    href={agendaHref({
                      vista,
                      fecha,
                      nueva: true,
                      hora: `${d}T${String(h).padStart(2, "0")}:00`,
                    })}
                    scroll={false}
                    aria-label={`Agendar el ${d} a las ${h}:00`}
                    className="absolute inset-x-0 border-t border-border/60 transition-colors hover:bg-tint-2/60 focus-visible:bg-tint-2 focus-visible:outline-none"
                    style={{ top: i * ALTO_HORA, height: ALTO_HORA }}
                  />
                ))}

                {d === hoy && ahoraPos > 0 && ahoraPos < 100 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-destructive"
                    style={{ top: `${ahoraPos}%` }}
                  >
                    <span className="animate-mk-pulse absolute -top-[6px] -left-[5px] size-2.5 rounded-full bg-destructive" />
                  </div>
                )}

                {(citasPorDia.get(d) ?? []).map((c) => {
                  const { top, height } = posicionEnDia(c.inicio, c.fin, zona);
                  return (
                    <Link
                      key={c.id}
                      href={agendaHref({ vista, fecha, cita: c.id })}
                      scroll={false}
                      className={cn(
                        "absolute inset-x-1.5 z-10 overflow-hidden rounded-2xl border px-2.5 py-2 text-xs transition-[transform,box-shadow] hover:z-20 hover:scale-[1.03] hover:shadow-[0_14px_24px_-14px_rgba(58,31,97,0.5)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        ESTADO_CITA_BLOQUE[c.estado],
                      )}
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <span className="flex items-center gap-1 font-bold">
                        {c.modalidad === "en_linea" && (
                          <VideoIcon className="size-3 shrink-0" aria-label="En línea" />
                        )}
                        <span className="truncate">
                          {c.nombre} {c.apellidos}
                        </span>
                      </span>
                      <span className="block opacity-85">
                        {formatEnZona(c.inicio, "HH:mm", zona)} –{" "}
                        {formatEnZona(c.fin, "HH:mm", zona)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollAHora>
    </div>
  );
}
