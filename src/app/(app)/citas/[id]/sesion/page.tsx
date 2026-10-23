import { ArrowLeftIcon, VideoIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { agendaHref } from "@/features/citas/urls";
import { SECCIONES_EXPEDIENTE } from "@/features/expediente/secciones";
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
import { mayuscula, nombreCompleto } from "@/lib/format";

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

  return (
    <>
      <Link
        href={agendaHref({ vista: "dia", fecha: aLocal(cita.inicio, zona).fecha })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-lavanda-700"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" /> Agenda
      </Link>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-lavanda-700">
            {cerrada ? "Nota de sesión" : "Sesión en curso"}
            {numero ? ` · Sesión ${numero}` : ""}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            <Link href={`/consultantes/${consultante.id}`} className="hover:text-lavanda-700">
              {nombreCompleto(consultante)}
            </Link>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mayuscula(formatEnZona(cita.inicio, "EEEE d 'de' MMMM, HH:mm", zona))} · {duracion} min
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!cerrada && !cancelada && <Cronometro citaId={cita.id} duracionMin={duracion} />}
          {cita.enlaceVideollamada && !cerrada && (
            <Button variant="outline" asChild>
              <a href={cita.enlaceVideollamada} target="_blank" rel="noopener noreferrer">
                <VideoIcon /> Videollamada
              </a>
            </Button>
          )}
          <ExpedienteSheet consultanteId={consultante.id} valores={valoresExpediente} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {cerrada && nota ? (
            <NotaLectura nota={nota} zona={zona} />
          ) : cancelada ? (
            <div className="rounded-2xl border bg-card p-6">
              <StatusBadge tono="neutral">Cita cancelada</StatusBadge>
              <p className="mt-3 text-muted-foreground">
                Esta cita está cancelada. Vuelve a programarla desde la agenda para registrar la
                sesión.
              </p>
            </div>
          ) : (
            <NotaSesionForm
              citaId={cita.id}
              inicial={inicial}
              contactoEmergencia={{
                nombre: consultante.contactoEmergenciaNombre,
                parentesco: consultante.contactoEmergenciaParentesco,
                telefono: consultante.contactoEmergenciaTelefono,
              }}
            />
          )}
        </div>
        <ResumenPanel sesion={sesion} zona={zona} />
      </div>
    </>
  );
}
