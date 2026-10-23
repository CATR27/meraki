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
    <div className="overflow-hidden rounded-2xl border bg-card">
      <ScrollAHora
        offsetPx={horaAncla * ALTO_HORA}
        className="max-h-[calc(100svh-15rem)] min-h-96 overflow-auto overscroll-contain"
      >
        <div className={cn(vista === "semana" && "min-w-[46rem]")}>
          {/* Encabezado de días */}
          <div
            className="sticky top-0 z-30 grid border-b bg-lavanda-50/90 backdrop-blur"
            style={{ gridTemplateColumns: `4rem repeat(${dias.length}, minmax(0, 1fr))` }}
          >
            <div />
            {dias.map((d) => {
              const esHoy = d === hoy;
              return (
                <Link
                  key={d}
                  href={agendaHref({ vista: "dia", fecha: d })}
                  className="flex flex-col items-center gap-0.5 border-l py-2.5 transition-colors hover:bg-lavanda-100/60"
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {formatEnZona(inicioDelDia(d, zona), "EEE", zona)}
                  </span>
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full font-heading text-lg font-bold",
                      esHoy ? "bg-lavanda-700 text-white" : "text-lavanda-950",
                    )}
                  >
                    {Number(d.slice(8))}
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
                className={cn("relative border-l", d === hoy && "bg-lavanda-50/50")}
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
                    className="absolute inset-x-0 border-t border-border/60 transition-colors hover:bg-lavanda-100/50 focus-visible:bg-lavanda-100 focus-visible:outline-none"
                    style={{ top: i * ALTO_HORA, height: ALTO_HORA }}
                  />
                ))}

                {d === hoy && ahoraPos > 0 && ahoraPos < 100 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-destructive"
                    style={{ top: `${ahoraPos}%` }}
                  >
                    <span className="absolute -top-[5px] -left-[5px] size-2 rounded-full bg-destructive" />
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
                        "absolute inset-x-1 z-10 overflow-hidden rounded-lg border px-2 py-1 text-xs shadow-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
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
