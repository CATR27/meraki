import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  FilePenLineIcon,
  FolderOpenIcon,
  ListTodoIcon,
  type LucideIcon,
  PlayIcon,
  SmileIcon,
  SunIcon,
  TargetIcon,
  UserPlusIcon,
  UsersRoundIcon,
  VideoIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Ornamento } from "@/components/brand/ornamento";
import { LogoMark } from "@/components/brand/logo";
import { iniciales } from "@/lib/format";
import { ESTADO_CITA_LABEL, ESTADO_CITA_TONO } from "@/features/citas/constantes";
import { agendaHref } from "@/features/citas/urls";
import { resumenDelDia } from "@/features/panel/queries";
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

/** Rango horario de la barra "Tu día" (08:00 – 18:00). */
const HORA_INI = 8;
const HORA_FIN = 18;

/** Un borrador se continúa en modo sesión; una nota finalizada vacía se completa editándola. */
const notaHref = (n: { citaId: string | null; estado: string }) =>
  `/citas/${n.citaId}/sesion${n.estado === "cerrada" ? "?editar=1" : ""}`;

const posicion = (fecha: Date, zona: string) => {
  const [h, m] = formatEnZona(fecha, "H:m", zona).split(":").map(Number);
  return Math.min(100, Math.max(0, ((h + m / 60 - HORA_INI) / (HORA_FIN - HORA_INI)) * 100));
};

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
            ? `La siguiente es ${siguiente.nombre.split(" ")[0]}, a las ${formatEnZona(siguiente.inicio, "HH:mm", r.zona)}.`
            : "Ya terminaste tus sesiones de hoy. Gracias por tu cuidado."
        }`;
  const ahoraPos = posicion(new Date(), r.zona);
  const p = r.proxima;
  const retomar = p
    ? [
        p.foco && { icono: TargetIcon, etiqueta: "Foco del proceso", valor: p.foco },
        p.tarea && { icono: ListTodoIcon, etiqueta: "Tarea asignada", valor: p.tarea },
        p.animo != null && {
          icono: SmileIcon,
          etiqueta: "Ánimo en la última sesión",
          valor:
            p.animoPrevio != null && p.animoPrevio !== p.animo
              ? `${p.animo} de 10 · ${p.animo > p.animoPrevio ? "subió" : "bajó"} ${Math.abs(p.animo - p.animoPrevio)} ${Math.abs(p.animo - p.animoPrevio) === 1 ? "punto" : "puntos"}`
              : `${p.animo} de 10`,
        },
      ].filter((x): x is { icono: LucideIcon; etiqueta: string; valor: string } => Boolean(x))
    : [];

  return (
    <div className="grid content-start gap-6">
      <div className="grid grid-cols-1 gap-6 @min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
        <section className="animate-mk-up relative flex flex-col overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#9466d9_0%,#6534a8_55%,#3a1f61_100%)] px-[clamp(22px,3vw,36px)] py-[clamp(24px,3vw,32px)] text-white">
          <Ornamento n="01_loto_resplandor" anim="breathe" sobre="oscuro" op={0.85} dur={9} className="-top-[50px] -right-[30px] size-[clamp(200px,26vw,320px)]" />
          <Ornamento n="10_onda_luminosa" anim="bob" sobre="oscuro" op={0.7} dur={11} className="-right-[10%] -bottom-[70px] -left-[10%] h-[220px]" />
          <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-white/16 px-3.5 py-1.5 text-[13px] font-bold whitespace-nowrap">
            <SunIcon className="size-[15px]" aria-hidden="true" />
            {fechaHoy}
          </span>
          <h1 className="relative mt-4 mb-2 text-[30px] leading-[1.05] font-bold tracking-[-0.025em] text-white @min-[700px]:text-[40px]">
            {r.saludo}, {r.nombre}
          </h1>
          <p className="relative max-w-[460px] text-base leading-normal text-pretty text-lavanda-100">
            {resumen}
          </p>
          <div className="relative mt-[22px] flex flex-wrap gap-2.5">
            <Link
              href={agendaHref({ nueva: true, fecha: r.hoy })}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-lavanda-800 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-0.5 hover:text-lavanda-800"
            >
              <CalendarPlusIcon className="size-[17px]" aria-hidden="true" /> Nueva cita
            </Link>
            <Link
              href="/consultantes/nuevo"
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-white/40 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/12 hover:text-white"
            >
              <UserPlusIcon className="size-[17px]" aria-hidden="true" /> Nuevo consultante
            </Link>
          </div>
          <div className="relative mt-auto grid gap-2.5 pt-7">
            <div className="flex justify-between text-xs font-bold text-lavanda-200">
              <span>0{HORA_INI}:00</span>
              <span className="tracking-[0.14em] uppercase">Tu día</span>
              <span>{HORA_FIN}:00</span>
            </div>
            <div className="relative h-2 rounded-full bg-white/16">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/30 to-white"
                style={{ width: `${ahoraPos}%` }}
              />
              {vigentes.concat(r.citasHoy.filter((c) => c.estado === "cancelada")).map((c) => (
                <span
                  key={c.id}
                  title={`${formatEnZona(c.inicio, "HH:mm", r.zona)} · ${nombreCompleto(c)}`}
                  className={cn(
                    "absolute top-1/2 -mt-2 -ml-2 size-4 -rotate-45 rounded-leaf border-2 border-[#5a2f96]",
                    c.estado === "completada"
                      ? "bg-[#9ee0bf]"
                      : c.estado === "cancelada"
                        ? "bg-white/35 opacity-60"
                        : "bg-white",
                  )}
                  style={{ left: `${posicion(c.inicio, r.zona)}%` }}
                />
              ))}
              <span
                className="absolute -top-2 -bottom-2 -ml-px w-0.5 rounded-sm bg-white"
                style={{ left: `${ahoraPos}%` }}
              />
            </div>
          </div>
        </section>

        <section
          aria-label="Próxima sesión"
          className="animate-mk-up relative flex flex-col gap-[18px] overflow-hidden rounded-3xl border bg-card p-6 [animation-delay:80ms]"
        >
          <Ornamento n="18_loto_en_halo" anim="breathe" op={0.85} dur={10} className="-top-11 -right-10 size-[170px]" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase">
              Próxima sesión
            </p>
            {p && (
              <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-tint-2 px-3 py-[5px] whitespace-nowrap text-xs font-extrabold text-deep">
                <span className="size-[7px] animate-mk-pulse rounded-full bg-primary" />
                {p.minutos > 0 ? `en ${p.minutos} min` : "ahora"}
              </span>
            )}
          </div>
          {p ? (
            <>
              <div className="relative flex items-center gap-3.5">
                <span className="flex size-[54px] flex-none items-center justify-center rounded-[50%_50%_50%_16%] bg-gradient-to-br from-lavanda-300 to-lavanda-600 font-heading text-lg font-bold text-white">
                  {iniciales(p.nombre)}
                </span>
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate font-heading text-[19px] font-bold text-ink">{p.nombre}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {formatEnZona(p.inicio, "HH:mm", r.zona)} · Sesión {p.numeroSesion} ·{" "}
                    {p.modalidad === "en_linea" ? "En línea" : "Presencial"}
                  </span>
                </span>
              </div>
              {retomar.length > 0 && (
                <div className="grid gap-1">
                  <p className="mb-1.5 text-[13px] font-extrabold text-ink">Para retomar</p>
                  {retomar.map(({ icono: Icono, etiqueta, valor }) => (
                    <div key={etiqueta} className="flex items-start gap-3 rounded-[14px] bg-tint px-3 py-2.5">
                      <span className="flex size-7 flex-none items-center justify-center rounded-[9px] bg-card text-accent">
                        <Icono className="size-[15px]" aria-hidden="true" />
                      </span>
                      <span className="grid min-w-0 gap-px">
                        <span className="text-xs font-bold text-muted-foreground">{etiqueta}</span>
                        <span className="text-sm font-bold text-foreground">{valor}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-auto grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2.5">
                <Link
                  href={`/consultantes/${p.consultanteId}/expediente`}
                  className="flex h-[46px] items-center justify-center gap-1.5 rounded-[14px] border bg-card text-sm font-extrabold text-deep transition-colors hover:bg-tint-2"
                >
                  <FolderOpenIcon className="size-4" aria-hidden="true" /> Expediente
                </Link>
                <Link
                  href={`/citas/${p.citaId}/sesion`}
                  className="flex h-[46px] items-center justify-center gap-1.5 rounded-[14px] bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_12px_24px_-12px_rgba(101,52,168,0.7)] transition-transform hover:-translate-y-px hover:text-primary-foreground"
                >
                  <PlayIcon className="size-4" aria-hidden="true" /> Iniciar sesión
                </Link>
              </div>
            </>
          ) : (
            <div className="relative grid flex-1 content-center justify-items-center gap-2 py-6 text-center">
              <LogoMark className="size-12 text-lavanda-400" />
              <p className="font-heading text-lg font-bold text-ink">Sin sesiones pendientes</p>
              <p className="text-[13px] text-muted-foreground">Un buen momento para respirar y cerrar tus notas.</p>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-2 gap-[clamp(12px,2vw,24px)] @min-[1000px]:grid-cols-4">
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
          etiqueta="Notas pendientes"
          href={r.borradores[0] ? notaHref(r.borradores[0]) : undefined}
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

      <div className="grid grid-cols-1 items-start gap-6 @min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
        <section className="animate-mk-up flex min-w-0 flex-col rounded-3xl border bg-card px-[clamp(18px,2.5vw,28px)] py-6 [animation-delay:300ms]">
          <div className="mb-4 flex items-center justify-between gap-3">
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
                      "relative flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border px-4 py-3",
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
                    <span className="grid w-[52px] text-center">
                      <span className="font-heading text-[19px] font-bold text-deep">
                        {formatEnZona(c.inicio, "HH:mm", r.zona)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatEnZona(c.fin, "HH:mm", r.zona)}
                      </span>
                    </span>
                    <span className="grid min-w-[140px] flex-1 gap-1">
                      <span className="flex items-center gap-1.5 font-extrabold text-foreground">
                        {nombreCompleto(c)}
                        {c.modalidad === "en_linea" && (
                          <VideoIcon className="size-[15px] shrink-0 text-accent" aria-label="En línea" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "justify-self-start rounded-full px-2.5 py-[3px] text-xs font-bold",
                          TONO_BADGE[ESTADO_CITA_TONO[c.estado]],
                        )}
                      >
                        {destacada ? "Siguiente · " : ""}
                        {ESTADO_CITA_LABEL[c.estado]}
                      </span>
                    </span>
                    {!cancelada && (
                      <Link
                        href={`/citas/${c.id}/sesion`}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-extrabold transition-colors",
                          destacada
                            ? "border-primary bg-primary text-primary-foreground hover:text-primary-foreground"
                            : "border-border bg-card text-deep hover:bg-tint-2",
                        )}
                      >
                        <PlayIcon className="size-3.5" aria-hidden="true" />
                        {completada ? "Ver nota" : "Sesión"}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="grid min-w-0 content-start gap-6">
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
                  <li key={x.id} className="flex items-start gap-3 rounded-2xl bg-tint px-3 py-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 size-[18px] flex-none rounded-leaf border-2",
                        x.vencido ? "border-destructive" : "border-accent",
                      )}
                    />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="text-sm font-bold text-foreground">{x.titulo}</span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          x.vencido ? "text-destructive" : "text-accent",
                        )}
                      >
                        {x.vencido ? "Vencido · " : ""}
                        {cuandoRelativo(x.fechaHora, r.zona)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="animate-mk-up rounded-3xl border border-warning-border bg-warning-soft p-[22px] [animation-delay:420ms]">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
              <FilePenLineIcon className="size-[18px] text-warning" aria-hidden="true" />
              Notas pendientes
            </h2>
            <p className="mb-3 text-[13px] text-muted-foreground">
              Borradores sin finalizar y sesiones finalizadas sin nota.
            </p>
            {r.borradores.length === 0 ? (
              <p className="rounded-2xl bg-card px-3.5 py-3 text-sm text-muted-foreground">
                Todo al día: no tienes notas pendientes.
              </p>
            ) : (
              <ul className="grid gap-2">
                {r.borradores.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={notaHref(b)}
                      className="flex flex-wrap justify-between gap-x-2 gap-y-1 rounded-2xl bg-card px-3.5 py-3 text-sm transition-colors hover:bg-tint"
                    >
                      <span className="font-bold text-foreground">{nombreCompleto(b)}</span>
                      <span className="text-xs text-muted-foreground">
                        {b.estado === "borrador" ? "Borrador" : "Por completar"} · Sesión{" "}
                        {b.numeroSesion} · {formatEnZona(b.fecha, "d MMM", r.zona)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
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
          "flex size-[50px] shrink-0 items-center justify-center rounded-leaf",
          alerta ? "bg-warning-soft text-warning" : "bg-tint-2 text-deep",
        )}
      >
        <Icono className="size-[22px]" aria-hidden="true" />
      </span>
      <span className="grid min-w-0">
        <span className="font-heading text-[30px] leading-none font-bold text-ink">{valor}</span>
        <span className="mt-1 text-[13px] text-muted-foreground">{etiqueta}</span>
      </span>
    </>
  );
  const clase =
    "animate-mk-up flex min-w-0 items-center gap-3.5 rounded-3xl border bg-card px-5 py-[18px] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-20px_rgba(101,52,168,0.45)]";
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
