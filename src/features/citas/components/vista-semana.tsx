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
        className="h-[calc(100dvh-17rem)] max-h-[720px] min-h-[360px] overflow-auto overscroll-contain"
      >
        <div className={cn(vista === "semana" && "min-w-[720px]")}>
          {/* Encabezado de días */}
          <div
            className="sticky top-0 z-30 grid border-b bg-card"
            style={{ gridTemplateColumns: `4rem repeat(${dias.length}, minmax(0, 1fr))` }}
          >
            <div className="sticky left-0 z-10 bg-card" />
            {dias.map((d) => {
              const esHoy = d === hoy;
              const total = citasPorDia.get(d)?.filter((c) => c.estado !== "cancelada").length ?? 0;
              return (
                <Link
                  key={d}
                  href={agendaHref({ vista: "dia", fecha: d })}
                  className={cn(
                    "flex items-center gap-2 border-l px-2 pt-3.5 pb-3 transition-colors @min-[900px]:gap-2.5 @min-[900px]:px-3 hover:bg-tint-2/60",
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
                  <span className="grid min-w-0 leading-tight">
                    <span className="truncate text-sm font-extrabold text-foreground capitalize">
                      {formatEnZona(inicioDelDia(d, zona), "EEE", zona)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {total} {total === 1 ? "cita" : "citas"}
                    </span>
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
            <div className="sticky left-0 z-10 bg-card" style={{ height: HORAS.length * ALTO_HORA }}>
              {HORAS.map((h, i) => (
                <span
                  key={h}
                  className="absolute right-2.5 pt-1 text-xs font-bold text-muted-foreground"
                  style={{ top: i * ALTO_HORA }}
                >
                  {`${String(h).padStart(2, "0")}:00`}
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
                    className="absolute inset-x-0 border-t border-muted transition-colors hover:bg-tint-2/60 focus-visible:bg-tint-2 focus-visible:outline-none"
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
                  const pos = posicionEnDia(c.inicio, c.fin, zona);
                  // Una cita fuera del horario visible se ancla al borde en vez de salirse de la rejilla.
                  const { height } = pos;
                  const top = Math.min(pos.top, 100 - height);
                  return (
                    <Link
                      key={c.id}
                      href={agendaHref({ vista, fecha, cita: c.id })}
                      scroll={false}
                      className={cn(
                        "absolute inset-x-1.5 z-10 overflow-hidden rounded-2xl border px-2 py-1 transition-[transform,box-shadow] @min-[640px]:px-2.5 @min-[640px]:py-2 [@media(hover:hover)]:hover:z-20 [@media(hover:hover)]:hover:scale-[1.03] [@media(hover:hover)]:hover:shadow-[0_14px_24px_-14px_rgba(58,31,97,0.5)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        ESTADO_CITA_BLOQUE[c.estado],
                      )}
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <span className="block text-xs font-bold opacity-85">
                        {formatEnZona(c.inicio, "HH:mm", zona)}
                        <span className={cn(vista === "semana" && "hidden @min-[1000px]:inline")}>
                          {" – "}
                          {formatEnZona(c.fin, "HH:mm", zona)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[13px] leading-tight font-extrabold">
                        {c.modalidad === "en_linea" && (
                          <VideoIcon className="size-3 shrink-0" aria-label="En línea" />
                        )}
                        <span className="truncate">
                          {c.nombre} {c.apellidos}
                        </span>
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
