import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  FilePenLineIcon,
  ListTodoIcon,
  type LucideIcon,
  PlayIcon,
  SunIcon,
  UserPlusIcon,
  UsersRoundIcon,
  VideoIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
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

const TONO_BADGE = {
  primary: "bg-tint-2 text-soft-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
} as const;

export default async function PanelPage() {
  const r = await resumenDelDia();
  const fechaHoy = mayuscula(formatEnZona(inicioDelDia(r.hoy, r.zona), "EEEE d 'de' MMMM", r.zona));
  const vigentes = r.citasHoy.filter((c) => c.estado !== "cancelada");
  const siguiente = r.citasHoy.find((c) => c.id === r.siguienteId);
  const resumen =
    vigentes.length === 0
      ? "Hoy no tienes citas. Aprovecha para completar expedientes o descansar."
      : `Hoy acompañas a ${vigentes.length} ${vigentes.length === 1 ? "persona" : "personas"}. ${
          siguiente
            ? `La siguiente es ${siguiente.nombre.split(" ")[0]}, a las ${formatEnZona(siguiente.inicio, "HH:mm", r.zona)}. Tómate tu tiempo entre cada sesión.`
            : "Ya terminaste tus sesiones de hoy. Gracias por tu cuidado."
        }`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="animate-mk-up relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#9466d9_0%,#6534a8_55%,#3a1f61_100%)] px-6 py-8 text-white sm:px-9 lg:col-span-1">
        <LogoMark className="animate-mk-float pointer-events-none absolute -top-10 right-8 size-64 opacity-[0.12]" />
        <LogoMark className="animate-mk-float pointer-events-none absolute right-60 -bottom-8 hidden size-[90px] text-lavanda-300 opacity-35 [animation-delay:-3s] sm:block" />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-bold">
          <SunIcon className="size-[15px]" aria-hidden="true" />
          {fechaHoy}
        </span>
        <h1 className="relative mt-4 mb-2 text-[32px] leading-[1.05] font-bold tracking-[-0.025em] text-white sm:text-[40px]">
          {r.saludo}, {r.nombre}
        </h1>
        <p className="relative max-w-[440px] text-base leading-normal text-pretty text-lavanda-100 sm:text-[17px]">
          {resumen}
        </p>
        <div className="relative mt-6 flex flex-wrap gap-2.5">
          <Link
            href={agendaHref({ nueva: true, fecha: r.hoy })}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-lavanda-800 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-0.5"
          >
            <CalendarPlusIcon className="size-[17px]" aria-hidden="true" /> Nueva cita
          </Link>
          <Link
            href="/consultantes/nuevo"
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-white/40 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <UserPlusIcon className="size-[17px]" aria-hidden="true" /> Nuevo consultante
          </Link>
        </div>
      </section>

      <section
        aria-label="Un minuto para ti"
        className="animate-mk-up relative hidden flex-col items-center overflow-hidden rounded-3xl border bg-card p-6 text-center [animation-delay:80ms] lg:flex"
      >
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          Un minuto para ti
        </p>
        <div className="relative my-3.5 flex size-[150px] items-center justify-center" aria-hidden="true">
          <span className="animate-mk-breath absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--tint-3)_0%,transparent_70%)]" />
          <span className="animate-mk-spin absolute inset-[18px] rounded-full border-[1.5px] border-dashed border-lavanda-300 [animation-duration:40s]" />
          <LogoMark className="animate-mk-breath relative size-[84px] text-lavanda-500" />
        </div>
        <div className="relative h-7 w-full font-heading text-[22px] font-bold text-ink">
          <span className="animate-mk-in absolute inset-0">Inhala…</span>
          <span className="animate-mk-out absolute inset-0">Exhala…</span>
        </div>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Sigue el ritmo del loto entre sesiones.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4 lg:gap-6">
        <Indicador
          icono={CalendarDaysIcon}
          valor={r.citasHoy.length}
          etiqueta="Citas hoy"
          href="/agenda?vista=dia"
          retraso={140}
        />
        <Indicador
          icono={UsersRoundIcon}
          valor={r.activos}
          etiqueta="Consultantes en proceso"
          href="/consultantes"
          retraso={180}
        />
        <Indicador
          icono={FilePenLineIcon}
          valor={r.totalBorradores}
          etiqueta="Notas por cerrar"
          alerta
          retraso={220}
        />
        <Indicador
          icono={ListTodoIcon}
          valor={r.recordatorios.length}
          etiqueta="Pendientes para hoy"
          href="/recordatorios"
          alerta
          retraso={260}
        />
      </div>

      <section className="animate-mk-up rounded-3xl border bg-card px-5 py-6 [animation-delay:300ms] sm:px-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Agenda de hoy</h2>
          <Link
            href="/agenda?vista=dia"
            className="inline-flex items-center gap-1 text-sm font-bold text-deep hover:underline"
          >
            Ver agenda <ArrowRightIcon className="size-[15px]" aria-hidden="true" />
          </Link>
        </div>
        {r.citasHoy.length === 0 ? (
          <div className="rounded-2xl bg-tint p-6 text-center">
            <p className="font-bold text-ink">Día libre de citas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aprovecha para completar expedientes o descansar.
            </p>
          </div>
        ) : (
          <ol className="relative grid gap-2.5 pl-7">
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-2 w-0.5 rounded-sm bg-gradient-to-b from-lavanda-300 to-border"
            />
            {r.citasHoy.map((c) => {
              const destacada = c.id === r.siguienteId;
              const cancelada = c.estado === "cancelada";
              const completada = c.estado === "completada";
              return (
                <li
                  key={c.id}
                  className={cn(
                    "relative flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-4 py-3",
                    destacada ? "border-lavanda-300 bg-tint" : "border-border bg-card",
                    cancelada && "opacity-55",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-1/2 -left-[26px] -mt-[7px] size-3.5 -rotate-45 rounded-leaf",
                      destacada
                        ? "animate-mk-pulse bg-primary"
                        : completada
                          ? "bg-success"
                          : "bg-lavanda-300",
                    )}
                  />
                  <div className="grid w-14 text-center">
                    <span className="font-heading text-[19px] font-bold text-deep">
                      {formatEnZona(c.inicio, "HH:mm", r.zona)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatEnZona(c.fin, "HH:mm", r.zona)}
                    </span>
                  </div>
                  <div className="grid min-w-0 flex-1 gap-1">
                    <Link
                      href={`/consultantes/${c.consultanteId}`}
                      className="flex items-center gap-1.5 truncate font-extrabold hover:text-deep"
                    >
                      {nombreCompleto(c)}
                      {c.modalidad === "en_linea" && (
                        <VideoIcon
                          className="size-[15px] shrink-0 text-lavanda-500"
                          aria-label="En línea"
                        />
                      )}
                    </Link>
                    <span
                      className={cn(
                        "justify-self-start rounded-full px-2.5 py-[3px] text-xs font-bold",
                        TONO_BADGE[ESTADO_CITA_TONO[c.estado]],
                      )}
                    >
                      {destacada ? "Siguiente · " : ""}
                      {ESTADO_CITA_LABEL[c.estado]}
                    </span>
                  </div>
                  {!cancelada && (
                    <Button size="sm" variant={destacada ? "default" : "outline"} asChild>
                      <Link href={`/citas/${c.id}/sesion`}>
                        <PlayIcon /> {completada ? "Ver nota" : "Sesión"}
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid content-start gap-4">
        <section className="animate-mk-up rounded-3xl border bg-card p-[22px] [animation-delay:360ms]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Pendientes</h2>
            <Link href="/recordatorios" className="text-[13px] font-bold text-deep hover:underline">
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
                  variante="compacto"
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
          <section className="animate-mk-up rounded-3xl border border-warning-border bg-warning-soft p-[22px] [animation-delay:420ms]">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
              <FilePenLineIcon className="size-[18px] text-warning" aria-hidden="true" />
              Notas por cerrar
            </h2>
            <p className="mb-3 text-[13px] text-muted-foreground">
              Sesiones con borrador que aún no finalizas.
            </p>
            <ul className="grid gap-2">
              {r.borradores.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/citas/${b.citaId}/sesion`}
                    className="flex justify-between gap-2 rounded-2xl bg-card px-3.5 py-3 text-sm transition-colors hover:bg-tint"
                  >
                    <span className="truncate font-bold">{nombreCompleto(b)}</span>
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
  );
}

function Indicador({
  icono: Icono,
  valor,
  etiqueta,
  href,
  alerta,
  retraso,
}: {
  icono: LucideIcon;
  valor: number;
  etiqueta: string;
  href?: string;
  alerta?: boolean;
  retraso: number;
}) {
  const contenido = (
    <>
      <span
        className={cn(
          "flex size-[52px] shrink-0 items-center justify-center rounded-leaf",
          alerta ? "bg-warning-soft text-warning" : "bg-tint-2 text-deep",
        )}
      >
        <Icono className="size-[22px]" aria-hidden="true" />
      </span>
      <span className="grid">
        <span className="font-heading text-[32px] leading-none font-bold text-ink">{valor}</span>
        <span className="mt-1 text-[13px] text-muted-foreground">{etiqueta}</span>
      </span>
    </>
  );
  const clase =
    "animate-mk-up flex items-center gap-4 rounded-3xl border bg-card px-5 py-[18px] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-20px_rgba(101,52,168,0.45)]";
  const estilo = { animationDelay: `${retraso}ms` };
  return href ? (
    <Link href={href} className={clase} style={estilo}>
      {contenido}
    </Link>
  ) : (
    <div className={clase} style={estilo}>
      {contenido}
    </div>
  );
}
