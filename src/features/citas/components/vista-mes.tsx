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
    <div className="animate-mk-up overflow-hidden rounded-3xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-tint">
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
                "min-h-16 border-t p-1 @min-[640px]:min-h-28 @min-[640px]:p-1.5",
                i % 7 !== 0 && "border-l",
                fueraDeMes && "bg-muted/40",
              )}
            >
              <Link
                href={agendaHref({ vista: "dia", fecha: d })}
                className={cn(
                  "mx-auto mb-1 flex size-9 items-center justify-center rounded-full @min-[640px]:mx-0 @min-[640px]:size-8 font-heading text-sm font-bold transition-colors hover:bg-tint-2",
                  d === hoy && "rounded-[50%_50%_50%_12%] bg-primary text-primary-foreground hover:bg-primary/90",
                  fueraDeMes && d !== hoy && "text-muted-foreground",
                )}
                aria-label={`Ver el día ${d}`}
              >
                {Number(d.slice(8))}
              </Link>
              {delDia.length > 0 && (
                <div className="flex justify-center gap-0.5 @min-[640px]:hidden" aria-hidden="true">
                  {delDia.slice(0, 3).map((c) => (
                    <span key={c.id} className={cn("size-1.5 rounded-full border", ESTADO_CITA_BLOQUE[c.estado])} />
                  ))}
                </div>
              )}
              <ul className="hidden gap-1 @min-[640px]:grid">
                {delDia.slice(0, MAX_VISIBLES).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={agendaHref({ vista: "mes", fecha, cita: c.id })}
                      scroll={false}
                      className={cn(
                        "block truncate rounded-xl border px-1.5 py-0.5 text-[0.7rem] font-bold @min-[700px]:text-xs",
                        ESTADO_CITA_BLOQUE[c.estado],
                      )}
                    >
                      <span className="hidden @min-[700px]:inline">
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
                      className="block px-1.5 text-xs font-bold text-deep hover:underline"
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
