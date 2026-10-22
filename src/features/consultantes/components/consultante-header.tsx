import { ArrowLeftIcon, CalendarPlusIcon, PencilIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <header className="mb-6">
      <Link
        href="/consultantes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-lavanda-700"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" /> Consultantes
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-gradient-to-br from-lavanda-200 to-lavanda-300 font-heading text-lg font-bold text-lavanda-800">
              {iniciales(nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{nombre}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
                <span className="capitalize">
                  Próxima cita: {formatEnZona(c.proximaCita, "EEE d MMM, HH:mm", user.zonaHoraria)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
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
