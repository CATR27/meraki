import { Ornamento } from "@/components/brand/ornamento";
import {
  HeartHandshakeIcon,
  IdCardIcon,
  ListTodoIcon,
  type LucideIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { obtenerConsultante, procesoDelConsultante } from "@/features/consultantes/queries";
import { SEXO_LABEL } from "@/features/consultantes/schemas";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { formatEnZona, formatFecha, formatFechaISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultante" };

const TARJETA = "animate-mk-up rounded-3xl border bg-card px-7 py-6";

export default async function ConsultantePage({ params }: PageProps<"/consultantes/[id]">) {
  const { id } = await params;
  const [user, c] = await Promise.all([requireRole("psicologo"), obtenerConsultante(id)]);
  registrarBitacora(user.id, "ver", "consultante", c.id);
  const proceso = await procesoDelConsultante(c.id, c.createdAt);

  const identificacion: [string, ReactNode][] = [
    ["Fecha de nacimiento", c.fechaNacimiento && formatFechaISO(c.fechaNacimiento)],
    ["Sexo", c.sexo && SEXO_LABEL[c.sexo]],
    ["Estado civil", c.estadoCivil],
    ["Ocupación", c.ocupacion],
    ["Escolaridad", c.escolaridad],
    ["Dirección", c.direccion],
  ];

  return (
    <div className="grid gap-5 @min-[640px]:grid-cols-2 @min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] @min-[1100px]:grid-rows-[auto_1fr]">
      <section className={cn(TARJETA, "[animation-delay:120ms] @min-[640px]:col-span-2")}>
        <Titulo icono={IdCardIcon}>Ficha de identificación</Titulo>
        <dl className="grid gap-x-6 gap-y-[18px] @min-[520px]:grid-cols-2 @min-[900px]:grid-cols-3">
          {identificacion.map(([etiqueta, valor]) => (
            <Dato key={etiqueta} etiqueta={etiqueta} valor={valor} />
          ))}
        </dl>
      </section>

      <SuProceso proceso={proceso} zona={user.zonaHoraria} />

      <section className={cn(TARJETA, "[animation-delay:240ms]")}>
        <Titulo icono={PhoneIcon}>Contacto</Titulo>
        <dl className="grid gap-3.5">
          <Dato
            etiqueta="Teléfono"
            valor={
              c.telefono && (
                <a href={`tel:${c.telefono}`} className="inline-flex min-h-11 items-center text-deep hover:underline">
                  {c.telefono}
                </a>
              )
            }
          />
          <Dato
            etiqueta="Correo"
            valor={
              c.email && (
                <a href={`mailto:${c.email}`} className="inline-flex min-h-11 items-center break-all text-deep hover:underline">
                  {c.email}
                </a>
              )
            }
          />
          <Dato etiqueta="Referido por" valor={c.referidoPor} />
          <Dato etiqueta="Registrado" valor={formatFecha(c.createdAt, user.zonaHoraria)} />
        </dl>
      </section>

      <div className="grid content-start gap-[18px] @min-[640px]:col-span-2 @min-[640px]:grid-cols-2 @min-[1100px]:col-span-1 @min-[1100px]:grid-cols-1">
        <section className="animate-mk-up rounded-3xl border bg-destructive-soft px-6 py-[22px] [animation-delay:300ms]">
          <h2 className="mb-2.5 flex items-center gap-2.5 text-[17px] font-bold">
            <HeartHandshakeIcon className="size-[18px] text-destructive" aria-hidden="true" />
            Contacto de emergencia
          </h2>
          {c.contactoEmergenciaNombre || c.contactoEmergenciaTelefono ? (
            <>
              <p className="font-extrabold text-foreground">
                {c.contactoEmergenciaNombre ?? "—"}
                {c.contactoEmergenciaParentesco && (
                  <span className="font-semibold text-muted-foreground">
                    {" "}
                    · {c.contactoEmergenciaParentesco}
                  </span>
                )}
              </p>
              {c.contactoEmergenciaTelefono && (
                <a
                  href={`tel:${c.contactoEmergenciaTelefono}`}
                  className="mt-1 flex min-h-11 items-center font-bold text-destructive hover:underline"
                >
                  {c.contactoEmergenciaTelefono}
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no registras un contacto.</p>
          )}
        </section>

        {c.consentimientoInformado ? (
          <section className="animate-mk-up flex items-center gap-3.5 rounded-2xl bg-success-soft px-[22px] py-[18px] [animation-delay:360ms]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-leaf bg-success text-white">
              <ShieldCheckIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="grid">
              <span className="font-extrabold text-success">Consentimiento informado</span>
              <span className="text-[13px] text-muted-foreground">
                {c.consentimientoFecha
                  ? `Firmado el ${formatFechaISO(c.consentimientoFecha, "d MMM yyyy")}`
                  : "Firmado"}
              </span>
            </span>
          </section>
        ) : (
          <section className="animate-mk-up flex items-center gap-3.5 rounded-2xl bg-warning-soft px-[22px] py-[18px] [animation-delay:360ms]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-leaf bg-warning text-white">
              <ShieldAlertIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="grid">
              <span className="font-extrabold text-warning">Consentimiento informado</span>
              <span className="text-[13px] text-muted-foreground">Pendiente de firma</span>
            </span>
          </section>
        )}
      </div>
    </div>
  );
}

function Titulo({ icono: Icono, children }: { icono: LucideIcon; children: ReactNode }) {
  return (
    <h2 className="mb-[18px] flex items-center gap-2.5 text-[19px] font-bold">
      <span className="flex size-[34px] items-center justify-center rounded-leaf bg-tint-2 text-deep">
        <Icono className="size-[17px]" aria-hidden="true" />
      </span>
      {children}
    </h2>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
        {etiqueta}
      </dt>
      <dd className="mt-1 font-semibold break-words text-foreground">
        {valor === null || valor === undefined || valor === "" || valor === false ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          valor
        )}
      </dd>
    </div>
  );
}

function SuProceso({
  proceso,
  zona,
}: {
  proceso: Awaited<ReturnType<typeof procesoDelConsultante>>;
  zona: string;
}) {
  const ultimo = proceso.animo.length - 1;
  return (
    <section className="animate-mk-up relative flex flex-col overflow-hidden rounded-3xl border bg-tint p-6 [animation-delay:180ms] @min-[1100px]:row-span-2">
      <Ornamento n="15_brote_crecimiento" anim="sway" op={0.9} dur={12} className="-top-5 -right-[30px] size-[180px]" />
      <p className="relative text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
        Su proceso
      </p>
      <p className="relative mt-2.5 font-heading text-[44px] leading-none font-bold text-ink">
        {proceso.sesiones}{" "}
        <span className="text-lg text-muted-foreground">
          {proceso.sesiones === 1 ? "sesión" : "sesiones"}
        </span>
      </p>
      <p className="relative mt-1.5 text-sm text-muted-foreground">
        {proceso.sesiones > 0
          ? `Acompañándose desde el ${formatEnZona(proceso.desde, "d 'de' MMMM 'de' yyyy", zona)}`
          : "Aún no hay sesiones registradas."}
      </p>

      <h3 className="relative mt-7 mb-1 text-base font-bold">Ánimo percibido</h3>
      <p className="relative mb-4 text-xs text-muted-foreground">
        {proceso.animo.length > 0
          ? `Últimas ${proceso.animo.length} sesiones · 1 a 10`
          : "Se mostrará al registrar el ánimo en una sesión."}
      </p>
      {proceso.animo.length > 0 && (
        <div className="relative flex min-h-[150px] flex-1 items-end gap-1.5 @min-[640px]:gap-2.5">
          {proceso.animo.map((a, i) => (
            <div
              key={a.numero}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-xs font-extrabold text-deep">{a.valor}</span>
              <span
                className={cn(
                  "animate-mk-grow w-full rounded-3xl",
                  i === ultimo
                    ? "bg-gradient-to-b from-lavanda-500 to-primary"
                    : "bg-gradient-to-b from-tint-3 to-lavanda-300",
                )}
                style={{ height: `${a.valor * 10}%`, animationDelay: `${300 + i * 70}ms` }}
              />
              <span className="text-[11px] text-muted-foreground">S{a.numero}</span>
            </div>
          ))}
        </div>
      )}

      {proceso.tarea && (
        <div className="relative mt-5 rounded-2xl border bg-card px-4 py-3.5">
          <p className="flex items-center gap-2 text-[13px] font-extrabold">
            <ListTodoIcon className="size-4 text-lavanda-500" aria-hidden="true" />
            Tarea en curso
          </p>
          <p className="mt-1.5 text-[13px] leading-normal whitespace-pre-line">{proceso.tarea}</p>
        </div>
      )}
    </section>
  );
}
