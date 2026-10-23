import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  FilePenLineIcon,
  ListTodoIcon,
  type LucideIcon,
  PlayIcon,
  UserPlusIcon,
  UsersRoundIcon,
  VideoIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ESTADO_CITA_LABEL, ESTADO_CITA_TONO } from "@/features/citas/constantes";
import { agendaHref } from "@/features/citas/urls";
import { resumenDelDia } from "@/features/panel/queries";
import { RecordatorioItem } from "@/features/recordatorios/components/recordatorio-item";
import { inicioDelDia } from "@/lib/agenda";
import { cuandoRelativo, formatEnZona } from "@/lib/dates";
import { mayuscula, nombreCompleto } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inicio" };

export default async function PanelPage() {
  const r = await resumenDelDia();
  const fechaHoy = mayuscula(formatEnZona(inicioDelDia(r.hoy, r.zona), "EEEE d 'de' MMMM", r.zona));

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold text-lavanda-600">{fechaHoy}</p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {r.saludo}, {r.nombre}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {r.pendientesCitas === 0
              ? "No tienes más citas por hoy."
              : `Te ${r.pendientesCitas === 1 ? "queda 1 cita" : `quedan ${r.pendientesCitas} citas`} por hoy.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/consultantes/nuevo">
              <UserPlusIcon /> Nuevo consultante
            </Link>
          </Button>
          <Button asChild>
            <Link href={agendaHref({ nueva: true, fecha: r.hoy })}>
              <CalendarPlusIcon /> Nueva cita
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          icono={CalendarDaysIcon}
          valor={r.citasHoy.length}
          etiqueta="Citas hoy"
          href="/agenda?vista=dia"
        />
        <Indicador
          icono={UsersRoundIcon}
          valor={r.activos}
          etiqueta="Consultantes en proceso"
          href="/consultantes"
        />
        <Indicador
          icono={FilePenLineIcon}
          valor={r.borradores.length}
          etiqueta="Notas por cerrar"
          alerta={r.borradores.length > 0}
        />
        <Indicador
          icono={ListTodoIcon}
          valor={r.recordatorios.length}
          etiqueta="Pendientes para hoy"
          href="/recordatorios"
          alerta={r.recordatorios.some((x) => x.vencido)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <section className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Agenda de hoy</h2>
            <Link
              href="/agenda?vista=dia"
              className="text-sm font-semibold text-lavanda-700 hover:underline"
            >
              Ver agenda
            </Link>
          </div>
          {r.citasHoy.length === 0 ? (
            <div className="rounded-xl bg-lavanda-50 p-6 text-center">
              <p className="font-semibold text-lavanda-900">Día libre de citas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aprovecha para completar expedientes o descansar.
              </p>
            </div>
          ) : (
            <ol className="grid gap-2">
              {r.citasHoy.map((c) => {
                const destacada = c.id === r.siguienteId;
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-xl border p-3.5",
                      destacada ? "border-lavanda-300 bg-lavanda-50" : "bg-card",
                      c.estado === "cancelada" && "opacity-60",
                    )}
                  >
                    <div className="w-16 shrink-0 text-center">
                      <p className="font-heading text-lg font-bold text-lavanda-800">
                        {formatEnZona(c.inicio, "HH:mm", r.zona)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatEnZona(c.fin, "HH:mm", r.zona)}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/consultantes/${c.consultanteId}`}
                        className="flex items-center gap-1.5 truncate font-bold hover:text-lavanda-700"
                      >
                        {c.modalidad === "en_linea" && (
                          <VideoIcon
                            className="size-4 shrink-0 text-lavanda-600"
                            aria-label="En línea"
                          />
                        )}
                        {nombreCompleto(c)}
                      </Link>
                      <StatusBadge tono={ESTADO_CITA_TONO[c.estado]} className="mt-1">
                        {destacada ? "Siguiente · " : ""}
                        {ESTADO_CITA_LABEL[c.estado]}
                      </StatusBadge>
                    </div>
                    {c.estado !== "cancelada" && (
                      <Button size="sm" variant={destacada ? "default" : "outline"} asChild>
                        <Link href={`/citas/${c.id}/sesion`}>
                          <PlayIcon /> {c.estado === "completada" ? "Ver nota" : "Sesión"}
                        </Link>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="grid content-start gap-6">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Pendientes</h2>
              <Link
                href="/recordatorios"
                className="text-sm font-semibold text-lavanda-700 hover:underline"
              >
                Todos
              </Link>
            </div>
            {r.recordatorios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada pendiente para hoy.</p>
            ) : (
              <ul className="grid gap-2">
                {r.recordatorios.map((x) => (
                  <RecordatorioItem
                    key={x.id}
                    id={x.id}
                    titulo={x.titulo}
                    descripcion={null}
                    completado={false}
                    cuando={cuandoRelativo(x.fechaHora, r.zona)}
                    vencido={x.vencido}
                  />
                ))}
              </ul>
            )}
          </section>

          {r.borradores.length > 0 && (
            <section className="rounded-2xl border border-warning/30 bg-warning-soft/40 p-5">
              <h2 className="mb-1 text-lg font-bold">Notas por cerrar</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Sesiones con borrador que aún no finalizas.
              </p>
              <ul className="grid gap-2">
                {r.borradores.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/citas/${b.citaId}/sesion`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-card p-3 text-sm transition-colors hover:bg-lavanda-50"
                    >
                      <span className="truncate font-semibold">{nombreCompleto(b)}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Sesión {b.numeroSesion} · {formatEnZona(b.fecha, "d MMM", r.zona)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Indicador({
  icono: Icono,
  valor,
  etiqueta,
  href,
  alerta,
}: {
  icono: LucideIcon;
  valor: number;
  etiqueta: string;
  href?: string;
  alerta?: boolean;
}) {
  const contenido = (
    <>
      <span
        className={cn(
          "mb-3 flex size-10 items-center justify-center rounded-xl",
          alerta ? "bg-warning-soft text-warning" : "bg-lavanda-100 text-lavanda-700",
        )}
      >
        <Icono className="size-5" aria-hidden="true" />
      </span>
      <span className="block font-heading text-3xl font-bold text-lavanda-950">{valor}</span>
      <span className="block text-sm text-muted-foreground">{etiqueta}</span>
    </>
  );
  const clase = "block rounded-2xl border bg-card p-4 sm:p-5";
  return href ? (
    <Link href={href} className={cn(clase, "transition-colors hover:border-lavanda-300")}>
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}
