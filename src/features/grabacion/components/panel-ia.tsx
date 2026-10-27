"use client";

import { CircleAlertIcon, LoaderCircleIcon, MicIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RIESGO_LABEL } from "@/features/sesiones/schemas";
import type { NivelRiesgo } from "@/features/sesiones/schemas";
import {
  aplicarPropuesta,
  descartarPropuesta,
  eliminarAudioGrabacion,
  generarPropuestaIA,
  type SeleccionPropuesta,
} from "../actions";
import { CAMPOS_PROPUESTA, type PropuestaGuardada, type Transcripcion } from "../schemas";
import { TranscripcionSheet } from "./transcripcion-sheet";

type CampoTexto = SeleccionPropuesta["campos"][number];

type Props = {
  citaId: string;
  iaDisponible: boolean;
  estado: "finalizada" | "procesando" | "lista" | "error";
  error: string | null;
  /** Texto ya formateado, p. ej. "12 min · se borra el 26 nov". */
  resumenAudio: string | null;
  tieneAudio: boolean;
  propuesta: PropuestaGuardada | null;
  revisada: boolean;
  transcripcion: Transcripcion | null;
  nota: Record<CampoTexto, string | null> & { estadoAnimo: number | null; nivelRiesgo: NivelRiesgo };
};

/** Audio, procesamiento y propuesta de la IA para una sesión ya finalizada. */
export function PanelIa({
  citaId,
  iaDisponible,
  estado,
  error,
  resumenAudio,
  tieneAudio,
  propuesta,
  revisada,
  transcripcion,
  nota,
}: Props) {
  const router = useRouter();
  const [pendiente, start] = useTransition();

  // Mientras la IA trabaja, se consulta el estado sin recargar la página.
  useEffect(() => {
    if (estado !== "procesando") return;
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [estado, router]);

  const ejecutar = (accion: () => Promise<{ ok: boolean; message?: string } | null>, exito?: string) =>
    start(async () => {
      const r = await accion().catch(() => null);
      if (!r?.ok) toast.error(r?.message ?? "Sin conexión con el servidor.");
      else if (exito) toast.success(exito);
    });

  const mostrarPropuesta = estado === "lista" && propuesta && !revisada;

  return (
    <section className="grid gap-3 rounded-3xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-leaf bg-tint-2 text-deep">
          <MicIcon className="size-5" aria-hidden="true" />
        </span>
        <span className="grid min-w-[160px] flex-1">
          <span className="font-extrabold text-ink">Audio de la sesión</span>
          <span className="text-xs text-muted-foreground">
            {tieneAudio ? resumenAudio : "El audio ya se eliminó; la transcripción se conserva."}
          </span>
        </span>
        <span className="flex flex-wrap gap-2">
          {transcripcion && <TranscripcionSheet citaId={citaId} transcripcion={transcripcion} />}
          {iaDisponible && tieneAudio && estado !== "procesando" && (
            <Button
              size="sm"
              variant={estado === "lista" ? "outline" : "default"}
              className="max-sm:h-11"
              disabled={pendiente}
              onClick={() => ejecutar(() => generarPropuestaIA(citaId))}
            >
              <SparklesIcon /> {estado === "lista" ? "Volver a generar" : "Generar propuesta con IA"}
            </Button>
          )}
          {tieneAudio && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-destructive max-sm:h-11" disabled={pendiente}>
                  <Trash2Icon /> Eliminar audio
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar el audio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borra de forma definitiva. La nota y la transcripción se conservan, pero ya
                    no podrás volver a generar la propuesta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Conservar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => ejecutar(() => eliminarAudioGrabacion(citaId), "Audio eliminado.")}
                  >
                    Eliminar audio
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </span>
      </div>

      {estado === "procesando" && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-2xl bg-tint p-4 text-sm text-deep"
        >
          <LoaderCircleIcon className="mt-0.5 size-5 shrink-0 animate-spin" aria-hidden="true" />
          <span>
            <span className="font-bold">La IA está escuchando la sesión y redactando la propuesta.</span>{" "}
            Puedes seguir usando la plataforma; te avisaremos en la campana cuando esté lista.
          </span>
        </p>
      )}

      {estado === "error" && error && !revisada && (
        <div role="alert" className="flex flex-wrap items-start gap-3 rounded-2xl bg-destructive-soft p-4 text-sm text-destructive">
          <CircleAlertIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="min-w-[180px] flex-1">{error}</p>
          <Button
            size="sm"
            variant="ghost"
            className="max-sm:h-11"
            disabled={pendiente}
            onClick={() => ejecutar(() => descartarPropuesta(citaId))}
          >
            Ocultar aviso
          </Button>
        </div>
      )}

      {mostrarPropuesta && (
        <RevisionPropuesta
          key={citaId}
          propuesta={propuesta}
          nota={nota}
          pendiente={pendiente}
          onAplicar={(seleccion) =>
            ejecutar(
              () => aplicarPropuesta(citaId, seleccion),
              "Propuesta aplicada. La versión anterior quedó en el historial.",
            )
          }
          onDescartar={() => ejecutar(() => descartarPropuesta(citaId))}
        />
      )}
    </section>
  );
}

function RevisionPropuesta({
  propuesta,
  nota,
  pendiente,
  onAplicar,
  onDescartar,
}: {
  propuesta: PropuestaGuardada;
  nota: Props["nota"];
  pendiente: boolean;
  onAplicar: (s: SeleccionPropuesta) => void;
  onDescartar: () => void;
}) {
  const campos = CAMPOS_PROPUESTA.filter(({ campo }) => propuesta[campo].trim());
  // Por defecto se marcan los apartados que siguen vacíos en la nota.
  const [elegidos, setElegidos] = useState<Set<CampoTexto>>(
    () => new Set(campos.filter(({ campo }) => !nota[campo]?.trim()).map((c) => c.campo)),
  );
  const [animo, setAnimo] = useState(false);
  const [riesgo, setRiesgo] = useState(false);

  const alternar = (campo: CampoTexto, valor: boolean) =>
    setElegidos((prev) => {
      const s = new Set(prev);
      if (valor) s.add(campo);
      else s.delete(campo);
      return s;
    });

  const nada = elegidos.size === 0 && !animo && !riesgo;

  return (
    <div className="grid gap-3 rounded-2xl border border-lavanda-300 bg-tint p-4">
      <div>
        <p className="flex items-center gap-2 font-extrabold text-ink">
          <SparklesIcon className="size-4 text-accent" aria-hidden="true" /> Propuesta de la IA
        </p>
        <p className="text-xs text-muted-foreground">
          Revísala antes de usarla: la IA puede equivocarse. Marca lo que quieras pasar a la nota;
          después puedes editarla como cualquier otra.
        </p>
      </div>

      {campos.map(({ campo, label }) => (
        <label key={campo} className="flex cursor-pointer gap-3 rounded-2xl bg-card p-3.5">
          <Checkbox
            className="mt-0.5"
            checked={elegidos.has(campo)}
            onCheckedChange={(v) => alternar(campo, v === true)}
          />
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-extrabold text-ink">{label}</span>
            <span className="text-sm leading-relaxed whitespace-pre-line">{propuesta[campo]}</span>
            {nota[campo]?.trim() && (
              <span className="text-xs text-muted-foreground">
                Reemplaza lo que ya escribiste: “{nota[campo]!.slice(0, 120)}
                {nota[campo]!.length > 120 ? "…" : ""}”
              </span>
            )}
          </span>
        </label>
      ))}

      <div className="grid gap-2 @min-[600px]:grid-cols-2">
        {propuesta.estadoAnimoSugerido != null && (
          <label className="flex cursor-pointer gap-3 rounded-2xl bg-card p-3.5">
            <Checkbox className="mt-0.5" checked={animo} onCheckedChange={(v) => setAnimo(v === true)} />
            <span className="grid gap-0.5 text-sm">
              <span className="font-extrabold text-ink">
                Ánimo sugerido: {propuesta.estadoAnimoSugerido}/10
              </span>
              <span className="text-xs text-muted-foreground">
                Actual: {nota.estadoAnimo != null ? `${nota.estadoAnimo}/10` : "sin registrar"}
              </span>
            </span>
          </label>
        )}
        <label className="flex cursor-pointer gap-3 rounded-2xl bg-card p-3.5">
          <Checkbox className="mt-0.5" checked={riesgo} onCheckedChange={(v) => setRiesgo(v === true)} />
          <span className="grid gap-0.5 text-sm">
            <span className="font-extrabold text-ink">
              Riesgo sugerido: {RIESGO_LABEL[propuesta.nivelRiesgoSugerido]}
            </span>
            <span className="text-xs text-muted-foreground">{propuesta.justificacionRiesgo}</span>
            <span className="text-xs text-muted-foreground">
              Actual: {RIESGO_LABEL[nota.nivelRiesgo]}
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2 max-sm:[&>*]:flex-1">
        <Button variant="outline" disabled={pendiente} onClick={onDescartar}>
          Descartar
        </Button>
        <Button
          disabled={pendiente || nada}
          onClick={() => onAplicar({ campos: [...elegidos], animo, riesgo })}
        >
          <SparklesIcon /> Pasar a la nota
        </Button>
      </div>
    </div>
  );
}
