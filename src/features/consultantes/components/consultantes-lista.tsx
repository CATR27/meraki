import { CalendarClockIcon, ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { edad, formatEnZona, formatFecha } from "@/lib/dates";
import { mayuscula, nombreCompleto } from "@/lib/format";
import type { ConsultanteListado } from "../queries";
import { EstadoConsultanteBadge } from "./estado-badge";

type Props = { consultantes: ConsultanteListado[]; zona: string; hoy: string };

const COLUMNAS = "@min-[820px]:grid-cols-[minmax(0,2.2fr)_1.1fr_1.3fr_1fr_32px]";

function Persona({ c, hoy }: { c: ConsultanteListado; hoy: string }) {
  const nombre = nombreCompleto(c);
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <PersonAvatar nombre={nombre} />
      <div className="grid min-w-0">
        <p className="truncate font-extrabold text-ink">{nombre}</p>
        <p className="truncate text-[13px] text-muted-foreground">
          {[c.fechaNacimiento && `${edad(c.fechaNacimiento, hoy)} años`, c.telefono]
            .filter(Boolean)
            .join(" · ") || "Sin datos de contacto"}
        </p>
      </div>
    </div>
  );
}

function SinConsentimiento() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold text-warning"
      title="Falta registrar el consentimiento informado"
    >
      <ShieldAlertIcon className="size-[13px]" aria-hidden="true" /> Sin consentimiento
    </span>
  );
}

export function ConsultantesLista({ consultantes, zona, hoy }: Props) {
  const proxima = (d: Date | null) =>
    d ? (
      mayuscula(formatEnZona(d, "EEE d MMM · HH:mm", zona))
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <>
      <div
        className={`hidden gap-4 px-6 pb-2 text-xs font-extrabold tracking-[0.1em] text-muted-foreground uppercase @min-[820px]:grid ${COLUMNAS}`}
      >
        <span>Consultante</span>
        <span>Estado</span>
        <span>Próxima cita</span>
        <span>Última sesión</span>
        <span />
      </div>

      <ul className="hidden gap-2.5 @min-[820px]:grid">
        {consultantes.map((c, i) => (
          <li
            key={c.id}
            style={{ animationDelay: `${100 + i * 50}ms` }}
            className={`group animate-mk-up relative items-center gap-4 rounded-2xl border bg-card px-6 py-3.5 transition-[transform,border-color,box-shadow] hover:translate-x-1 hover:border-lavanda-300 hover:shadow-[0_14px_28px_-22px_rgba(101,52,168,0.6)] @min-[820px]:grid ${COLUMNAS}`}
          >
            {/* El enlace cubre toda la fila (after:inset-0) */}
            <Link
              href={`/consultantes/${c.id}`}
              className="min-w-0 outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              <Persona c={c} hoy={hoy} />
            </Link>
            <div className="grid justify-items-start gap-1">
              <EstadoConsultanteBadge estado={c.estado} />
              {!c.consentimientoInformado && <SinConsentimiento />}
            </div>
            <span className="text-sm font-semibold">{proxima(c.proximaCita)}</span>
            <span className="text-sm text-muted-foreground">
              {c.ultimaSesion ? formatFecha(c.ultimaSesion, zona) : "—"}
            </span>
            <ChevronRightIcon className="size-[18px] text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-deep" />
          </li>
        ))}
      </ul>

      <ul className="grid gap-3 @min-[820px]:hidden">
        {consultantes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/consultantes/${c.id}`}
              className="block rounded-2xl border bg-card p-4 transition-colors hover:border-lavanda-300"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Persona c={c} hoy={hoy} />
                </div>
                <ChevronRightIcon className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <EstadoConsultanteBadge estado={c.estado} />
                {!c.consentimientoInformado && <SinConsentimiento />}
                {c.proximaCita && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <CalendarClockIcon className="size-3.5" aria-hidden="true" />
                    {proxima(c.proximaCita)}
                  </span>
                )}
                {c.ultimaSesion && (
                  <span className="text-muted-foreground">Última: {formatFecha(c.ultimaSesion, zona)}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
