import { CalendarPlusIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { inicioDelDia, type Vista } from "@/lib/agenda";
import { formatEnZona } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ESTADO_CITA_LABEL, ESTADO_CITA_TONO } from "../constantes";
import type { CitaAgenda } from "../queries";
import { agendaHref } from "../urls";

/** Agenda en lista agrupada por día: usada en móvil en lugar de la rejilla. */
export function VistaLista({
  vista,
  fecha,
  dias,
  citas,
  zona,
  hoy,
}: {
  vista: Vista;
  fecha: string;
  dias: string[];
  citas: CitaAgenda[];
  zona: string;
  hoy: string;
}) {
  return (
    <ol className="grid gap-4">
      {dias.map((d) => {
        const delDia = citas.filter((c) => formatEnZona(c.inicio, "yyyy-MM-dd", zona) === d);
        return (
          <li key={d} className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3
                className={cn(
                  "font-heading font-bold capitalize",
                  d === hoy ? "text-lavanda-700" : "text-lavanda-950",
                )}
              >
                {formatEnZona(inicioDelDia(d, zona), "EEEE d 'de' MMMM", zona)}
                {d === hoy && " · Hoy"}
              </h3>
              <Link
                href={agendaHref({ vista, fecha, nueva: true, hora: `${d}T09:00` })}
                scroll={false}
                className="rounded-lg p-1.5 text-lavanda-600 hover:bg-lavanda-100"
                aria-label={`Agendar el ${d}`}
              >
                <CalendarPlusIcon className="size-5" />
              </Link>
            </div>
            {delDia.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin citas.</p>
            ) : (
              <ul className="grid gap-2">
                {delDia.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={agendaHref({ vista, fecha, cita: c.id })}
                      scroll={false}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-lavanda-100 bg-lavanda-50/60 p-3 transition-colors hover:border-lavanda-300",
                        c.estado === "cancelada" && "opacity-60",
                      )}
                    >
                      <span className="w-12 shrink-0 font-heading font-bold text-lavanda-800">
                        {formatEnZona(c.inicio, "HH:mm", zona)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 truncate font-semibold">
                          {c.modalidad === "en_linea" && (
                            <VideoIcon className="size-3.5 shrink-0" aria-label="En línea" />
                          )}
                          {c.nombre} {c.apellidos}
                        </span>
                      </span>
                      <StatusBadge tono={ESTADO_CITA_TONO[c.estado]}>
                        {ESTADO_CITA_LABEL[c.estado]}
                      </StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
