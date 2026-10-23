import Link from "next/link";
import { formatEnZona } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ESTADO_CITA_BLOQUE } from "../constantes";
import type { CitaAgenda } from "../queries";
import { agendaHref } from "../urls";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_VISIBLES = 3;

export function VistaMes({
  fecha,
  dias,
  citas,
  zona,
  hoy,
}: {
  fecha: string;
  dias: string[];
  citas: CitaAgenda[];
  zona: string;
  hoy: string;
}) {
  const mes = fecha.slice(0, 7);
  const porDia = new Map<string, CitaAgenda[]>();
  for (const c of citas) {
    const d = formatEnZona(c.inicio, "yyyy-MM-dd", zona);
    porDia.set(d, [...(porDia.get(d) ?? []), c]);
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-lavanda-50/80">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-bold text-muted-foreground uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d, i) => {
          const delDia = (porDia.get(d) ?? []).filter((c) => c.estado !== "cancelada");
          const fueraDeMes = !d.startsWith(mes);
          return (
            <div
              key={d}
              className={cn(
                "min-h-24 border-t p-1.5 sm:min-h-28",
                i % 7 !== 0 && "border-l",
                fueraDeMes && "bg-muted/40",
              )}
            >
              <Link
                href={agendaHref({ vista: "dia", fecha: d })}
                className={cn(
                  "mb-1 flex size-7 items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-lavanda-100",
                  d === hoy && "bg-lavanda-700 text-white hover:bg-lavanda-800",
                  fueraDeMes && d !== hoy && "text-muted-foreground",
                )}
                aria-label={`Ver el día ${d}`}
              >
                {Number(d.slice(8))}
              </Link>
              <ul className="grid gap-1">
                {delDia.slice(0, MAX_VISIBLES).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={agendaHref({ vista: "mes", fecha, cita: c.id })}
                      scroll={false}
                      className={cn(
                        "block truncate rounded-md border px-1.5 py-0.5 text-[0.7rem] font-semibold sm:text-xs",
                        ESTADO_CITA_BLOQUE[c.estado],
                      )}
                    >
                      <span className="hidden sm:inline">
                        {formatEnZona(c.inicio, "HH:mm", zona)}{" "}
                      </span>
                      {c.nombre}
                    </Link>
                  </li>
                ))}
                {delDia.length > MAX_VISIBLES && (
                  <li>
                    <Link
                      href={agendaHref({ vista: "dia", fecha: d })}
                      className="block px-1.5 text-xs font-semibold text-lavanda-700 hover:underline"
                    >
                      +{delDia.length - MAX_VISIBLES} más
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
