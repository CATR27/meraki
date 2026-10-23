"use client";

import {
  BanIcon,
  CalendarCheck2Icon,
  CalendarClockIcon,
  CheckCheckIcon,
  FileTextIcon,
  MailCheckIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PlayIcon,
  UserRoundXIcon,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ActionState } from "@/lib/action-state";
import { formatEnZona } from "@/lib/dates";
import { cambiarEstadoCita, reenviarConfirmacion } from "../actions";
import {
  ESTADO_CITA_LABEL,
  ESTADO_CITA_TONO,
  type EstadoCita,
  MODALIDAD_LABEL,
} from "../constantes";
import type { CitaDetalle } from "../queries";

type Props = { cita: CitaDetalle; zona: string; cerrarHref: string; editarHref: string };

export function CitaDetalleDialog({ cita, zona, cerrarHref, editarHref }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const cerrar = () => router.replace(cerrarHref, { scroll: false });

  function ejecutar(fn: () => Promise<ActionState>) {
    startTransition(async () => {
      try {
        const res = await fn();
        if (res?.ok) toast.success(res.message);
        else toast.error(res?.message ?? "Algo salió mal.");
      } catch {
        toast.error("No pudimos completar la acción. Inténtalo de nuevo.");
      }
    });
  }
  const estado = (e: EstadoCita) => ejecutar(() => cambiarEstadoCita(cita.id, e));

  const vigente = cita.estado === "programada" || cita.estado === "confirmada";
  const nombre = `${cita.nombre} ${cita.apellidos}`;
  const duracion = Math.round((cita.fin.getTime() - cita.inicio.getTime()) / 60_000);

  return (
    <Dialog open onOpenChange={(open) => !open && cerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tono={ESTADO_CITA_TONO[cita.estado]}>
              {ESTADO_CITA_LABEL[cita.estado]}
            </StatusBadge>
            <StatusBadge tono="neutral">
              {cita.modalidad === "en_linea" ? (
                <VideoIcon className="size-3" aria-hidden="true" />
              ) : (
                <MapPinIcon className="size-3" aria-hidden="true" />
              )}
              {MODALIDAD_LABEL[cita.modalidad]}
            </StatusBadge>
          </div>
          <DialogTitle className="font-heading text-2xl">{nombre}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-base capitalize">
            <CalendarClockIcon className="size-4 text-lavanda-600" aria-hidden="true" />
            {formatEnZona(cita.inicio, "EEEE d 'de' MMMM, HH:mm", zona)} ·{" "}
            <span className="normal-case">{duracion} min</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 text-sm">
          {cita.enlaceVideollamada && (
            <a
              href={cita.enlaceVideollamada}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold break-all text-lavanda-700 hover:underline"
            >
              <VideoIcon className="size-4 shrink-0" aria-hidden="true" /> Abrir videollamada
            </a>
          )}
          {cita.notas && (
            <p className="rounded-xl bg-muted p-3 whitespace-pre-line text-muted-foreground">
              {cita.notas}
            </p>
          )}
          <p className="flex items-center gap-2 text-muted-foreground">
            {cita.confirmacionEnviadaAt ? (
              <>
                <MailCheckIcon className="size-4 text-success" aria-hidden="true" />
                Confirmación enviada el{" "}
                {formatEnZona(cita.confirmacionEnviadaAt, "d MMM, HH:mm", zona)}
              </>
            ) : cita.email ? (
              <>
                <MailIcon className="size-4" aria-hidden="true" /> Confirmación no enviada
              </>
            ) : (
              <>
                <MailIcon className="size-4" aria-hidden="true" /> El consultante no tiene correo
              </>
            )}
          </p>
        </div>

        <div className="grid gap-2">
          {cita.estado !== "cancelada" && (
            <Button size="lg" asChild>
              <Link href={`/citas/${cita.id}/sesion`}>
                {cita.notaId ? <FileTextIcon /> : <PlayIcon />}
                {cita.notaId
                  ? cita.notaEstado === "cerrada"
                    ? "Ver nota de sesión"
                    : "Continuar sesión"
                  : "Iniciar sesión"}
              </Link>
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <Link href={`/consultantes/${cita.consultanteId}/expediente`}>
                <FileTextIcon /> Expediente
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={editarHref} scroll={false}>
                <PencilIcon /> Editar / reprogramar
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {cita.estado === "programada" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => estado("confirmada")}
            >
              <CalendarCheck2Icon /> Marcar confirmada
            </Button>
          )}
          {vigente && (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={() => estado("completada")}
              >
                <CheckCheckIcon /> Completada
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={() => estado("no_asistio")}
              >
                <UserRoundXIcon /> No asistió
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => estado("cancelada")}
              >
                <BanIcon /> Cancelar cita
              </Button>
            </>
          )}
          {!vigente && cita.estado !== "completada" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => estado("programada")}
            >
              <CalendarClockIcon /> Volver a programar
            </Button>
          )}
          {vigente && cita.email && (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => ejecutar(() => reenviarConfirmacion(cita.id))}
            >
              <MailIcon /> {cita.confirmacionEnviadaAt ? "Reenviar" : "Enviar"} confirmación
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
