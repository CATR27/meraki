"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CloudUploadIcon,
  LockKeyholeIcon,
  PhoneIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { CabeceraSesion } from "./cabecera-sesion";
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
  bajo: "peer-checked:border-lavanda-500 peer-checked:bg-tint-2 peer-checked:text-lavanda-500",
  medio: "peer-checked:border-warning peer-checked:bg-warning-soft peer-checked:text-warning",
  alto: "peer-checked:border-destructive peer-checked:bg-destructive-soft peer-checked:text-destructive",
};

type Props = {
  citaId: string;
  inicial: ValoresNota;
  contactoEmergencia: { nombre: string | null; parentesco: string | null; telefono: string | null };
  /** Identidad del consultante en la tarjeta superior (renderizada en el servidor). */
  cabeceraIzquierda: ReactNode;
  /** Cronómetro, expediente y videollamada, a la izquierda de "Finalizar sesión". */
  cabeceraAcciones: ReactNode;
  /** Columna lateral con contexto (tareas, expediente, sesiones anteriores). */
  lateral: ReactNode;
};

export function NotaSesionForm({
  citaId,
  inicial,
  contactoEmergencia,
  cabeceraIzquierda,
  cabeceraAcciones,
  lateral,
}: Props) {
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

  const finalizarBoton = (
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
            La nota quedará cerrada y ya no podrá modificarse. La cita se marcará como completada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir escribiendo</AlertDialogCancel>
          <AlertDialogAction onClick={finalizar}>Finalizar y cerrar nota</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="grid gap-6">
      <CabeceraSesion
        izquierda={cabeceraIzquierda}
        acciones={cabeceraAcciones}
        final={finalizarBoton}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px] font-bold">Nota de evolución</h2>
            <EstadoGuardado estado={estado} onReintentar={() => void guardar()} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {CAMPOS_SOAP.map(({ campo, label, guia }, i) => {
              const lleno = valores[campo].trim().length > 0;
              return (
                <section
                  key={campo}
                  style={{ animationDelay: `${100 + i * 70}ms` }}
                  className="animate-mk-up flex min-h-56 flex-col gap-2 rounded-3xl border bg-card px-[22px] py-5 transition-shadow focus-within:border-lavanda-300 focus-within:shadow-[0_0_0_4px_var(--tint-2)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-[42px] shrink-0 items-center justify-center rounded-leaf font-heading text-xl font-bold",
                        lleno ? "bg-primary text-primary-foreground" : "bg-tint-2 text-deep",
                      )}
                    >
                      {label.charAt(0)}
                    </span>
                    <span className="grid">
                      <label htmlFor={campo} className="font-extrabold text-ink">
                        {label}
                      </label>
                      <span id={`${campo}-guia`} className="text-xs leading-snug text-muted-foreground">
                        {guia}
                      </span>
                    </span>
                  </div>
                  <Textarea
                    id={campo}
                    aria-describedby={`${campo}-guia`}
                    value={valores[campo]}
                    onChange={(e) => cambiar(campo, e.target.value)}
                    placeholder="Escribe aquí…"
                    maxLength={20_000}
                    className="min-h-36 flex-1 resize-none rounded-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </section>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <fieldset className="animate-mk-up rounded-3xl border bg-card px-[22px] py-[18px] [animation-delay:400ms]">
              <legend className="sr-only">Estado de ánimo percibido</legend>
              <p className="text-sm font-extrabold text-ink" aria-hidden="true">
                Estado de ánimo percibido{" "}
                <span className="text-xs font-semibold text-muted-foreground">
                  · 1 = muy bajo · 10 = muy bueno
                </span>
              </p>
              <div className="mt-3 flex h-[58px] items-end gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const actual = valores.estadoAnimo === String(n);
                  const menor = Number(valores.estadoAnimo) > n;
                  return (
                    <label key={n} className="flex-1 self-end" style={{ height: `${30 + n * 7}%` }}>
                      <input
                        type="radio"
                        name="estadoAnimo"
                        value={n}
                        checked={actual}
                        onChange={() => cambiar("estadoAnimo", String(n))}
                        onClick={() => actual && cambiar("estadoAnimo", "")}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "flex h-full cursor-pointer items-end justify-center rounded-3xl pb-1.5 font-heading text-[13px] font-bold transition-all peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:-translate-y-[3px]",
                          actual
                            ? "bg-primary text-primary-foreground"
                            : menor
                              ? "bg-tint-3 text-deep"
                              : "bg-tint text-deep",
                        )}
                      >
                        {n}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="animate-mk-up rounded-3xl border bg-card px-[22px] py-[18px] [animation-delay:460ms]">
              <legend className="mb-3 text-sm font-extrabold text-ink">Nivel de riesgo</legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
                        "flex cursor-pointer items-center justify-center rounded-2xl border-[1.5px] border-border px-1 py-3 text-[13px] font-extrabold text-muted-foreground transition-all peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:border-lavanda-400",
                        RIESGO_ESTILO[r],
                      )}
                    >
                      {RIESGO_LABEL[r]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {riesgoAlto && (
            <div
              role="alert"
              className="flex gap-3 rounded-3xl border border-warning-border bg-warning-soft p-4 text-sm text-warning"
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

          <div className="grid gap-4 md:grid-cols-2">
            <section className="animate-mk-up rounded-3xl border bg-card px-[22px] py-5 [animation-delay:520ms]">
              <Field
                id="tareasAsignadas"
                label="Tareas asignadas"
                hint="Lo que el consultante trabajará hasta la próxima sesión. Aparecerá al iniciar la siguiente."
              >
                <Textarea
                  value={valores.tareasAsignadas}
                  onChange={(e) => cambiar("tareasAsignadas", e.target.value)}
                  className="min-h-24"
                  maxLength={5_000}
                />
              </Field>
            </section>
            <section className="animate-mk-up rounded-3xl border bg-card px-[22px] py-5 [animation-delay:580ms]">
              <Field id="observaciones" label="Observaciones adicionales">
                <Textarea
                  value={valores.observaciones}
                  onChange={(e) => cambiar("observaciones", e.target.value)}
                  className="min-h-24"
                  maxLength={5_000}
                />
              </Field>
            </section>
          </div>
        </div>
        {lateral}
      </div>
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
        <span className={cn(base, "text-deep")}>
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
