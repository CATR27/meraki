"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CloudUploadIcon,
  LockKeyholeIcon,
  PhoneIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Field } from "@/components/shared/form-field";
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
import { Textarea } from "@/components/ui/textarea";
import { NIVELES_RIESGO } from "@/db/schema";
import { cn } from "@/lib/utils";
import { finalizarSesion, guardarBorradorNota } from "../actions";
import { CAMPOS_SOAP, type NivelRiesgo, RIESGO_LABEL } from "../schemas";

export type ValoresNota = {
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  tareasAsignadas: string;
  observaciones: string;
  estadoAnimo: string;
  nivelRiesgo: NivelRiesgo;
};

type Estado =
  | { tipo: "inicial" }
  | { tipo: "sucio" }
  | { tipo: "guardando" }
  | { tipo: "guardado"; en: number }
  | { tipo: "error"; mensaje: string };

const RETRASO_MS = 1500;

const RIESGO_ESTILO: Record<NivelRiesgo, string> = {
  ninguno: "peer-checked:border-success peer-checked:bg-success-soft peer-checked:text-success",
  bajo: "peer-checked:border-lavanda-500 peer-checked:bg-lavanda-100 peer-checked:text-lavanda-800",
  medio: "peer-checked:border-warning peer-checked:bg-warning-soft peer-checked:text-warning",
  alto: "peer-checked:border-destructive peer-checked:bg-destructive-soft peer-checked:text-destructive",
};

type Props = {
  citaId: string;
  inicial: ValoresNota;
  contactoEmergencia: { nombre: string | null; parentesco: string | null; telefono: string | null };
};

export function NotaSesionForm({ citaId, inicial, contactoEmergencia }: Props) {
  const [valores, setValores] = useState(inicial);
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });
  const [finalizando, startFinalizar] = useTransition();

  // Cola de guardado: nunca hay dos guardados simultáneos y siempre se guarda lo último.
  const valoresRef = useRef(valores);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enCurso = useRef(false);
  const pendiente = useRef(false);

  const guardar = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (enCurso.current) {
      pendiente.current = true;
      return;
    }
    enCurso.current = true;
    setEstado({ tipo: "guardando" });
    try {
      const res = await guardarBorradorNota(citaId, valoresRef.current);
      setEstado(
        res.ok ? { tipo: "guardado", en: res.guardadoEn } : { tipo: "error", mensaje: res.message },
      );
    } catch {
      setEstado({ tipo: "error", mensaje: "Sin conexión con el servidor." });
    } finally {
      enCurso.current = false;
      if (pendiente.current) {
        pendiente.current = false;
        void guardar();
      }
    }
  }, [citaId]);

  function cambiar<K extends keyof ValoresNota>(campo: K, valor: ValoresNota[K]) {
    const nuevos = { ...valoresRef.current, [campo]: valor };
    valoresRef.current = nuevos;
    setValores(nuevos);
    setEstado({ tipo: "sucio" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void guardar(), RETRASO_MS);
  }

  // Advierte si se intenta salir con cambios sin guardar.
  const hayPendientes =
    estado.tipo === "sucio" || estado.tipo === "guardando" || estado.tipo === "error";
  useEffect(() => {
    if (!hayPendientes) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayPendientes]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function finalizar() {
    if (timer.current) clearTimeout(timer.current);
    startFinalizar(async () => {
      try {
        const res = await finalizarSesion(citaId, valoresRef.current);
        if (res && !res.ok) toast.error(res.message);
      } catch (error) {
        // redirect() viaja como un error especial que Next maneja; solo avisamos de errores reales.
        const digest = (error as { digest?: unknown } | null)?.digest;
        if (!(typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))) {
          toast.error("No pudimos finalizar la sesión. Inténtalo de nuevo.");
        }
      }
    });
  }

  const riesgoAlto = valores.nivelRiesgo === "medio" || valores.nivelRiesgo === "alto";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-3">
        <EstadoGuardado estado={estado} onReintentar={() => void guardar()} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={finalizando}>
              <LockKeyholeIcon /> {finalizando ? "Finalizando…" : "Finalizar sesión"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar la sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                La nota quedará cerrada y ya no podrá modificarse. La cita se marcará como
                completada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Seguir escribiendo</AlertDialogCancel>
              <AlertDialogAction onClick={finalizar}>Finalizar y cerrar nota</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <section className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">Nota de evolución (SOAP)</h2>
        {CAMPOS_SOAP.map(({ campo, label, guia }) => (
          <Field key={campo} id={campo} label={label} hint={guia}>
            <Textarea
              value={valores[campo]}
              onChange={(e) => cambiar(campo, e.target.value)}
              className="min-h-32 leading-relaxed"
              maxLength={20_000}
            />
          </Field>
        ))}
      </section>

      <section className="grid gap-6 rounded-2xl border bg-card p-5 sm:p-6">
        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-lavanda-950">
            Estado de ánimo percibido
          </legend>
          <p className="mb-3 text-xs text-muted-foreground">1 = muy bajo · 10 = muy bueno</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
              <label key={n}>
                <input
                  type="radio"
                  name="estadoAnimo"
                  value={n}
                  checked={valores.estadoAnimo === n}
                  onChange={() => cambiar("estadoAnimo", n)}
                  onClick={() => valores.estadoAnimo === n && cambiar("estadoAnimo", "")}
                  className="peer sr-only"
                />
                <span className="flex size-10 cursor-pointer items-center justify-center rounded-xl border font-heading font-bold transition-colors peer-checked:border-lavanda-700 peer-checked:bg-lavanda-700 peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:border-lavanda-400">
                  {n}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-lavanda-950">Nivel de riesgo</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {NIVELES_RIESGO.map((r) => (
              <label key={r}>
                <input
                  type="radio"
                  name="nivelRiesgo"
                  value={r}
                  checked={valores.nivelRiesgo === r}
                  onChange={() => cambiar("nivelRiesgo", r)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:border-lavanda-400",
                    RIESGO_ESTILO[r],
                  )}
                >
                  {RIESGO_LABEL[r]}
                </span>
              </label>
            ))}
          </div>
          {riesgoAlto && (
            <div
              role="alert"
              className="mt-4 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning"
            >
              <TriangleAlertIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="grid gap-1">
                <p className="font-bold">Documenta el plan de seguridad en “Plan”.</p>
                {contactoEmergencia.telefono ? (
                  <p className="flex flex-wrap items-center gap-1">
                    <PhoneIcon className="size-3.5" aria-hidden="true" />
                    Contacto de emergencia: {contactoEmergencia.nombre ?? "Sin nombre"}
                    {contactoEmergencia.parentesco && ` (${contactoEmergencia.parentesco})`} ·{" "}
                    <a href={`tel:${contactoEmergencia.telefono}`} className="font-bold underline">
                      {contactoEmergencia.telefono}
                    </a>
                  </p>
                ) : (
                  <p>Este consultante no tiene contacto de emergencia registrado.</p>
                )}
              </div>
            </div>
          )}
        </fieldset>

        <Field
          id="tareasAsignadas"
          label="Tareas asignadas"
          hint="Lo que el consultante trabajará hasta la próxima sesión. Aparecerá al iniciar la siguiente."
        >
          <Textarea
            value={valores.tareasAsignadas}
            onChange={(e) => cambiar("tareasAsignadas", e.target.value)}
            className="min-h-20"
            maxLength={5_000}
          />
        </Field>
        <Field id="observaciones" label="Observaciones adicionales">
          <Textarea
            value={valores.observaciones}
            onChange={(e) => cambiar("observaciones", e.target.value)}
            className="min-h-20"
            maxLength={5_000}
          />
        </Field>
      </section>
    </div>
  );
}

function EstadoGuardado({ estado, onReintentar }: { estado: Estado; onReintentar: () => void }) {
  const base = "inline-flex items-center gap-1.5 text-sm font-semibold";
  return (
    <span aria-live="polite">
      {estado.tipo === "inicial" && (
        <span className={cn(base, "text-muted-foreground")}>
          <CloudUploadIcon className="size-4" aria-hidden="true" /> Se guarda automáticamente
        </span>
      )}
      {estado.tipo === "sucio" && (
        <span className={cn(base, "text-muted-foreground")}>Cambios sin guardar…</span>
      )}
      {estado.tipo === "guardando" && (
        <span className={cn(base, "text-lavanda-700")}>
          <CloudUploadIcon className="size-4 animate-pulse" aria-hidden="true" /> Guardando…
        </span>
      )}
      {estado.tipo === "guardado" && (
        <span className={cn(base, "text-success")}>
          <CircleCheckIcon className="size-4" aria-hidden="true" /> Borrador guardado a las{" "}
          {new Date(estado.en).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      )}
      {estado.tipo === "error" && (
        <span className={cn(base, "text-destructive")}>
          <CircleAlertIcon className="size-4" aria-hidden="true" /> {estado.mensaje}
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onReintentar}>
            Reintentar
          </Button>
        </span>
      )}
    </span>
  );
}
