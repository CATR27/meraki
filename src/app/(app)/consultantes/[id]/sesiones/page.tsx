import { CalendarPlusIcon, NotebookTextIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { agendaHref } from "@/features/citas/urls";
import { notasDeConsultante, type NotaResumen } from "@/features/sesiones/queries";
import { RIESGO_LABEL } from "@/features/sesiones/schemas";
import { requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";
import { mayuscula } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sesiones" };

export default async function SesionesPage({ params }: PageProps<"/consultantes/[id]/sesiones">) {
  const { id } = await params;
  const [user, notas] = await Promise.all([requireRole("psicologo"), notasDeConsultante(id)]);

  if (notas.length === 0) {
    return (
      <EmptyState
        icon={NotebookTextIcon}
        title="Aún no hay sesiones registradas"
        description="Las notas se crean al iniciar la sesión desde una cita de la agenda."
        action={
          <Button asChild>
            <Link href={agendaHref({ nueva: true, consultante: id })}>
              <CalendarPlusIcon /> Agendar cita
            </Link>
          </Button>
        }
      />
    );
  }

  const conAnimo = [...notas].reverse().filter((n) => n.estadoAnimo != null);

  return (
    <div className="grid gap-6">
      {conAnimo.length >= 2 && <EvolucionAnimo notas={conAnimo} />}
      <ol className="relative grid gap-4 border-l-2 border-lavanda-200 pl-6">
        {notas.map((n) => (
          <li key={n.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-5 -left-[33px] size-4 rounded-full border-4 border-background",
                n.estado === "cerrada" ? "bg-lavanda-600" : "bg-warning",
              )}
            />
            <article className="rounded-2xl border bg-card p-5">
              <header className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold">Sesión {n.numeroSesion}</h2>
                <span className="text-sm text-muted-foreground">
                  {mayuscula(formatEnZona(n.fecha, "EEEE d 'de' MMMM yyyy", user.zonaHoraria))}
                </span>
                <span className="ml-auto flex flex-wrap gap-1.5">
                  {n.estado === "borrador" && <StatusBadge tono="warning">Borrador</StatusBadge>}
                  {n.estadoAnimo != null && (
                    <StatusBadge tono="primary">Ánimo {n.estadoAnimo}/10</StatusBadge>
                  )}
                  {n.nivelRiesgo !== "ninguno" && (
                    <StatusBadge tono={n.nivelRiesgo === "bajo" ? "neutral" : "danger"}>
                      Riesgo {RIESGO_LABEL[n.nivelRiesgo].toLowerCase()}
                    </StatusBadge>
                  )}
                </span>
              </header>
              {(n.subjetivo || n.plan) && (
                <p className="line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">
                  {n.subjetivo || n.plan}
                </p>
              )}
              {n.citaId && (
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <Link href={`/citas/${n.citaId}/sesion`}>
                    {n.estado === "borrador" ? "Continuar nota" : "Ver nota completa"}
                  </Link>
                </Button>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Gráfica ligera (SVG) del estado de ánimo a lo largo de las sesiones. */
function EvolucionAnimo({ notas }: { notas: NotaResumen[] }) {
  const ancho = 600;
  const alto = 120;
  const pad = 16;
  const x = (i: number) => pad + (i * (ancho - pad * 2)) / (notas.length - 1);
  const y = (v: number) => alto - pad - ((v - 1) * (alto - pad * 2)) / 9;
  const puntos = notas.map((n, i) => `${x(i)},${y(n.estadoAnimo!)}`).join(" ");
  const ultimo = notas.at(-1)!.estadoAnimo!;
  const primero = notas[0].estadoAnimo!;

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">Evolución del estado de ánimo</h2>
        <p className="text-sm text-muted-foreground">
          De {primero}/10 a <span className="font-bold text-lavanda-800">{ultimo}/10</span> en{" "}
          {notas.length} sesiones
        </p>
      </div>
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="h-28 w-full"
        role="img"
        aria-label={`Estado de ánimo por sesión: ${notas.map((n) => n.estadoAnimo).join(", ")}`}
        preserveAspectRatio="none"
      >
        {[1, 5, 10].map((v) => (
          <line
            key={v}
            x1={pad}
            x2={ancho - pad}
            y1={y(v)}
            y2={y(v)}
            className="stroke-lavanda-100"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={puntos}
          fill="none"
          className="stroke-lavanda-600"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {notas.map((n, i) => (
          <circle key={n.id} cx={x(i)} cy={y(n.estadoAnimo!)} r="5" className="fill-lavanda-700" />
        ))}
      </svg>
    </section>
  );
}
