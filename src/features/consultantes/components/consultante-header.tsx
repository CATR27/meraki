import { ArrowLeftIcon, CalendarClockIcon, CalendarPlusIcon, PencilIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/dal";
import { edad, formatEnZona, hoyISO } from "@/lib/dates";
import { iniciales, nombreCompleto } from "@/lib/format";
import { obtenerConsultante } from "../queries";
import { EstadoConsultanteBadge } from "./estado-badge";

export async function ConsultanteHeader({ id }: { id: string }) {
  const [user, c] = await Promise.all([requireRole("psicologo"), obtenerConsultante(id)]);
  const nombre = nombreCompleto(c);

  return (
    <header className="mb-5 grid gap-4">
      <Link
        href="/consultantes"
        className="-my-2 inline-flex min-h-11 items-center gap-1.5 justify-self-start text-sm font-bold text-muted-foreground hover:text-deep"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" /> Consultantes
      </Link>
      <div className="animate-mk-up flex flex-wrap items-center gap-5">
        <div className="relative size-[76px] shrink-0">
          <span
            aria-hidden="true"
            className="animate-mk-spin absolute -inset-1.5 rounded-[50%_50%_50%_16%] border-2 border-dashed border-lavanda-300"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-[50%_50%_50%_16%] bg-gradient-to-br from-[#c9aef0] to-[#7a45c6] font-heading text-[26px] font-bold text-white">
            {iniciales(nombre)}
          </span>
        </div>
        <div className="min-w-0 flex-1 basis-[200px]">
          <h1 className="text-[clamp(26px,4vw,34px)] leading-tight font-bold tracking-[-0.02em]">{nombre}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
            <EstadoConsultanteBadge estado={c.estado} />
            {c.fechaNacimiento && (
              <span>{edad(c.fechaNacimiento, hoyISO(user.zonaHoraria))} años</span>
            )}
            {!c.consentimientoInformado && (
              <StatusBadge tono="warning">
                <ShieldAlertIcon className="size-3" aria-hidden="true" /> Sin consentimiento
              </StatusBadge>
            )}
            {c.proximaCita && (
              <>
                <span aria-hidden="true" className="size-1 rounded-full bg-lavanda-300" />
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClockIcon className="size-[15px]" aria-hidden="true" />
                  Próxima cita: {formatEnZona(c.proximaCita, "EEE d MMM, HH:mm", user.zonaHoraria)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="grid w-full shrink-0 grid-cols-2 gap-2.5 @min-[640px]:flex @min-[640px]:w-auto @min-[640px]:flex-wrap max-sm:[&>*]:h-11">
          <Button variant="outline" asChild>
            <Link href={`/consultantes/${c.id}/editar`}>
              <PencilIcon /> Editar datos
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/agenda?nueva=1&consultante=${c.id}`}>
              <CalendarPlusIcon /> Agendar cita
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
