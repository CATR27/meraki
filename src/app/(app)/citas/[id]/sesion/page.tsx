import { ArrowLeftIcon, VideoIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MODALIDAD_LABEL } from "@/features/citas/constantes";
import { agendaHref } from "@/features/citas/urls";
import { SECCIONES_EXPEDIENTE } from "@/features/expediente/secciones";
import { CabeceraSesion } from "@/features/sesiones/components/cabecera-sesion";
import { Cronometro } from "@/features/sesiones/components/cronometro";
import { ExpedienteSheet } from "@/features/sesiones/components/expediente-sheet";
import { NotaLectura } from "@/features/sesiones/components/nota-lectura";
import { NotaSesionForm, type ValoresNota } from "@/features/sesiones/components/nota-sesion-form";
import { ResumenPanel } from "@/features/sesiones/components/resumen-panel";
import { obtenerSesion } from "@/features/sesiones/queries";
import { aLocal } from "@/lib/agenda";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";
import { iniciales, nombreCompleto } from "@/lib/format";

export const metadata: Metadata = { title: "Sesión" };

export default async function SesionPage({ params }: PageProps<"/citas/[id]/sesion">) {
  const { id } = await params;
  const [user, sesion] = await Promise.all([requireRole("psicologo"), obtenerSesion(id)]);
  const { cita, consultante, expediente, nota } = sesion;
  const zona = user.zonaHoraria;
  if (nota) registrarBitacora(user.id, "ver", "nota", nota.id);

  const cerrada = nota?.estado === "cerrada";
  const cancelada = cita.estado === "cancelada";
  const duracion = Math.round((cita.fin.getTime() - cita.inicio.getTime()) / 60_000);
  const numero = nota?.numeroSesion;
  const nombre = nombreCompleto(consultante);

  const inicial: ValoresNota = {
    subjetivo: nota?.subjetivo ?? "",
    objetivo: nota?.objetivo ?? "",
    analisis: nota?.analisis ?? "",
    plan: nota?.plan ?? "",
    tareasAsignadas: nota?.tareasAsignadas ?? "",
    observaciones: nota?.observaciones ?? "",
    estadoAnimo: nota?.estadoAnimo != null ? String(nota.estadoAnimo) : "",
    nivelRiesgo: nota?.nivelRiesgo ?? "ninguno",
  };
  const valoresExpediente = Object.fromEntries(
    SECCIONES_EXPEDIENTE.flatMap((s) => s.campos.map((c) => [c.campo, expediente[c.campo]])),
  );

  const meta = [
    numero ? `Sesión ${numero}` : null,
    MODALIDAD_LABEL[cita.modalidad],
    `${formatEnZona(cita.inicio, "HH:mm", zona)} – ${formatEnZona(cita.fin, "HH:mm", zona)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const izquierda = (
    <>
      <Link
        href={agendaHref({ vista: "dia", fecha: aLocal(cita.inicio, zona).fecha })}
        aria-label="Volver a la agenda"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tint-2 text-deep transition-colors hover:bg-tint-3"
      >
        <ArrowLeftIcon className="size-[18px]" aria-hidden="true" />
      </Link>
      <span
        aria-hidden="true"
        className="hidden size-12 shrink-0 items-center justify-center rounded-avatar @min-[600px]:flex bg-gradient-to-br from-[#c9aef0] to-[#7a45c6] font-heading font-bold text-white"
      >
        {iniciales(nombre)}
      </span>
      <div className="grid min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 text-xl font-bold">
            <Link href={`/consultantes/${consultante.id}`} className="hover:text-deep">
              {nombre}
            </Link>
          </h1>
          {!cerrada && !cancelada && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive-soft px-2.5 py-1 text-[11px] font-extrabold tracking-[0.1em] text-destructive uppercase">
              <span className="animate-mk-pulse size-[7px] rounded-full bg-destructive" />
              En sesión
            </span>
          )}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {meta} · {duracion} min
        </span>
      </div>
    </>
  );

  const acciones = (
    <>
      {!cerrada && !cancelada && <Cronometro citaId={cita.id} duracionMin={duracion} />}
      {cita.enlaceVideollamada && !cerrada && (
        <Button variant="outline" aria-label="Videollamada" className="size-11 px-0 @min-[900px]:size-auto @min-[900px]:px-4" asChild>
          <a href={cita.enlaceVideollamada} target="_blank" rel="noopener noreferrer">
            <VideoIcon /> <span className="sr-only @min-[900px]:not-sr-only">Videollamada</span>
          </a>
        </Button>
      )}
      <ExpedienteSheet consultanteId={consultante.id} valores={valoresExpediente} />
    </>
  );

  if (!cerrada && !cancelada) {
    return (
      <NotaSesionForm
        citaId={cita.id}
        inicial={inicial}
        contactoEmergencia={{
          nombre: consultante.contactoEmergenciaNombre,
          parentesco: consultante.contactoEmergenciaParentesco,
          telefono: consultante.contactoEmergenciaTelefono,
        }}
        cabeceraIzquierda={izquierda}
        cabeceraAcciones={acciones}
        lateral={<ResumenPanel sesion={sesion} zona={zona} />}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <CabeceraSesion izquierda={izquierda} acciones={acciones} />
      <div className="grid gap-6 @min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {cerrada && nota ? (
            <NotaLectura nota={nota} zona={zona} />
          ) : (
            <div className="rounded-3xl border bg-card p-6">
              <StatusBadge tono="neutral">Cita cancelada</StatusBadge>
              <p className="mt-3 text-muted-foreground">
                Esta cita está cancelada. Vuelve a programarla desde la agenda para registrar la
                sesión.
              </p>
            </div>
          )}
        </div>
        <ResumenPanel sesion={sesion} zona={zona} />
      </div>
    </div>
  );
}
