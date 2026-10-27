"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CloudUploadIcon,
  HistoryIcon,
  LockKeyholeIcon,
  PhoneIcon,
  SaveIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ornamento } from "@/components/brand/ornamento";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Grabador, type GrabadorHandle } from "@/features/grabacion/components/grabador";
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
import { editarNotaCerrada, finalizarSesion, guardarBorradorNota } from "../actions";
import { apartadosVacios, CAMPOS_SOAP, type NivelRiesgo, RIESGO_LABEL } from "../schemas";

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
  /** "sesion": borrador con autoguardado. "edicion": nota ya cerrada, se guarda al confirmar. */
  modo?: "sesion" | "edicion";
  inicial: ValoresNota;
  contactoEmergencia: { nombre: string | null; parentesco: string | null; telefono: string | null };
  /** Identidad del consultante en la tarjeta superior (renderizada en el servidor). */
  cabeceraIzquierda: ReactNode;
  /** Cronómetro, expediente y videollamada, a la izquierda de "Finalizar sesión". */
  cabeceraAcciones: ReactNode;
  /** Columna lateral con contexto (tareas, expediente, sesiones anteriores). */
  lateral: ReactNode;
  /** Solo en sesiones presenciales con el almacenamiento de audio configurado. */
  grabacion?: Omit<ComponentProps<typeof Grabador>, "citaId" | "ref" | "onFragmentos">;
};

export function NotaSesionForm({
  citaId,
  modo = "sesion",
  inicial,
  contactoEmergencia,
  cabeceraIzquierda,
  cabeceraAcciones,
  lateral,
  grabacion,
}: Props) {
  const router = useRouter();
  const grabador = useRef<GrabadorHandle>(null);
  const edicion = modo === "edicion";
  const [valores, setValores] = useState(inicial);
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });
  const [finalizando, startFinalizar] = useTransition();
  // En pantallas angostas solo se muestra una letra del SOAP a la vez.
  const [activo, setActivo] = useState(0);

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
    // En edición no hay autoguardado: cada guardado crea una versión en el historial.
    if (edicion) return;
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
        // El audio debe terminar de subirse antes de cerrar: después ya no se aceptan fragmentos.
        const audio = await grabador.current?.detener();
        if (audio && audio.pendientes > 0) {
          toast.error("Falta subir parte del audio. Revisa tu conexión y vuelve a finalizar.");
          return;
        }
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

  function guardarEdicion() {
    startFinalizar(async () => {
      try {
        const res = await editarNotaCerrada(citaId, valoresRef.current);
        if (!res.ok) {
          setEstado({ tipo: "error", mensaje: res.message });
          return;
        }
        setEstado({ tipo: "guardado", en: res.guardadoEn });
        toast.success("Nota actualizada. La versión anterior quedó en el historial.");
        router.push(`/citas/${citaId}/sesion`);
      } catch {
        setEstado({ tipo: "error", mensaje: "Sin conexión con el servidor." });
      }
    });
  }

  const riesgoAlto = valores.nivelRiesgo === "medio" || valores.nivelRiesgo === "alto";
  const faltantes = apartadosVacios(valores);

  const finalizarBoton = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={finalizando}>
          <LockKeyholeIcon /> {finalizando ? "Finalizando…" : "Finalizar sesión"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {faltantes.length > 0 ? "Faltan apartados por llenar" : "¿Finalizar la sesión?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {faltantes.length > 0
              ? `Sin texto en ${faltantes.map((c) => c.label).join(", ")}. Puedes finalizar ahora y completarlos después desde la nota.`
              : "La cita se marcará como completada. Podrás editar la nota después; cada cambio queda en el historial."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir escribiendo</AlertDialogCancel>
          <AlertDialogAction onClick={finalizar}>
            {faltantes.length > 0 ? "Finalizar, lo lleno después" : "Finalizar sesión"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const accionPrincipal = edicion ? (
    <div className="flex gap-2 max-sm:[&>*]:flex-1">
      <Button variant="outline" asChild>
        <Link href={`/citas/${citaId}/sesion`}>Cancelar</Link>
      </Button>
      <Button onClick={guardarEdicion} disabled={finalizando || estado.tipo === "inicial"}>
        <SaveIcon /> {finalizando ? "Guardando…" : "Guardar cambios"}
      </Button>
    </div>
  ) : (
    finalizarBoton
  );

  return (
    <div data-sesion className="relative isolate grid gap-6">
      <Ornamento n="14_ola_botanica" anim="breathe" op={0.55} dur={14} origen="0% 100%" className="bottom-0 left-0 -z-10 hidden size-[440px] [mask-image:linear-gradient(90deg,#000_55%,transparent)] @min-[900px]:block" />
      <CabeceraSesion
        izquierda={cabeceraIzquierda}
        acciones={
          <>
            {grabacion && !edicion && <Grabador ref={grabador} citaId={citaId} {...grabacion} />}
            {cabeceraAcciones}
          </>
        }
        final={accionPrincipal}
      />

      <div className="relative grid gap-6 @min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px] font-bold">
              {edicion ? "Editar nota de evolución" : "Nota de evolución"}
            </h2>
            <EstadoGuardado
              estado={estado}
              edicion={edicion}
              onReintentar={() => void (edicion ? guardarEdicion() : guardar())}
            />
          </div>

          <div role="tablist" aria-label="Secciones de la nota" className="sticky top-0 z-10 -mx-1 flex gap-1.5 bg-background/95 px-1 py-2 backdrop-blur @min-[600px]:hidden">
            {CAMPOS_SOAP.map(({ campo, label }, i) => (
              <button
                key={campo}
                type="button"
                role="tab"
                aria-selected={i === activo}
                aria-label={label}
                onClick={() => setActivo(i)}
                className={cn(
                  "flex h-[46px] flex-1 items-center justify-center rounded-leaf font-heading text-lg font-bold transition-colors",
                  i === activo
                    ? "bg-primary text-primary-foreground"
                    : valores[campo].trim()
                      ? "bg-tint-3 text-deep"
                      : "bg-tint text-deep",
                )}
              >
                {label.charAt(0)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 @min-[600px]:grid-cols-2">
            {CAMPOS_SOAP.map(({ campo, label, guia }, i) => {
              const lleno = valores[campo].trim().length > 0;
              return (
                <section
                  key={campo}
                  style={{ animationDelay: `${100 + i * 70}ms` }}
                  className={cn(
                    "animate-mk-up flex min-h-56 flex-col gap-2 rounded-3xl border bg-card px-[22px] py-5 transition-shadow focus-within:border-lavanda-300 focus-within:shadow-[0_0_0_4px_var(--tint-2)]",
                    i !== activo && "hidden @min-[600px]:flex",
                  )}
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
                    className="min-h-[calc(100dvh-24rem)] flex-1 resize-none rounded-none @min-[600px]:min-h-36 border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </section>
              );
            })}
          </div>

          <div className="grid gap-4 @min-[700px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <fieldset className="animate-mk-up rounded-3xl border bg-card px-[22px] py-[18px] [animation-delay:400ms]">
              <legend className="sr-only">Estado de ánimo percibido</legend>
              <p className="text-sm font-extrabold text-ink" aria-hidden="true">
                Estado de ánimo percibido{" "}
                <span className="block text-xs font-semibold text-muted-foreground @min-[600px]:inline">
                  <span className="hidden @min-[600px]:inline">· </span>1 = muy bajo · 10 = muy bueno
                </span>
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2 @min-[600px]:flex @min-[600px]:h-[58px] @min-[600px]:items-end @min-[600px]:gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const actual = valores.estadoAnimo === String(n);
                  const menor = Number(valores.estadoAnimo) > n;
                  return (
                    <label
                      key={n}
                      className="h-12 self-end @min-[600px]:h-[var(--h)] @min-[600px]:flex-1"
                      style={{ "--h": `${30 + n * 7}%` } as React.CSSProperties}
                    >
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
              <div className="grid grid-cols-2 gap-1.5 @min-[420px]:grid-cols-4">
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
                    <a href={`tel:${contactoEmergencia.telefono}`} className="inline-flex min-h-11 items-center font-bold underline">
                      {contactoEmergencia.telefono}
                    </a>
                  </p>
                ) : (
                  <p>Este consultante no tiene contacto de emergencia registrado.</p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 @min-[600px]:grid-cols-2">
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

      <div className="sticky bottom-0 z-20 -mx-[clamp(16px,3vw,32px)] border-t bg-background/95 px-[clamp(16px,3vw,32px)] pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur @min-[600px]:hidden [&_button]:h-[52px] [&_button]:w-full">
        {accionPrincipal}
      </div>
    </div>
  );
}

function EstadoGuardado({
  estado,
  edicion,
  onReintentar,
}: {
  estado: Estado;
  edicion: boolean;
  onReintentar: () => void;
}) {
  const base = "inline-flex items-center gap-1.5 text-sm font-semibold";
  return (
    <span aria-live="polite">
      {estado.tipo === "inicial" &&
        (edicion ? (
          <span className={cn(base, "text-muted-foreground")}>
            <HistoryIcon className="size-4" aria-hidden="true" /> La versión actual se guardará en
            el historial
          </span>
        ) : (
          <span className={cn(base, "text-muted-foreground")}>
            <CloudUploadIcon className="size-4" aria-hidden="true" /> Se guarda automáticamente
          </span>
        ))}
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
          <CircleCheckIcon className="size-4" aria-hidden="true" />{" "}
          {edicion ? "Guardado a las" : "Borrador guardado a las"}{" "}
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
