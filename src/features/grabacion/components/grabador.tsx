"use client";

import { CloudAlertIcon, MicIcon, PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { iniciarGrabacion, registrarConsentimientoGrabacion } from "../actions";
import { BITS_POR_SEGUNDO, elegirFormato, FRAGMENTO_MS } from "../formato";

export type GrabadorHandle = {
  /** Detiene la grabación y espera a que todos los fragmentos se suban. */
  detener: () => Promise<{ fragmentos: number; pendientes: number }>;
};

type Estado = "inactivo" | "iniciando" | "grabando" | "pausado" | "interrumpido";

type Fragmento = { indice: number; inicioMs: number; duracionMs: number; audio: Blob };

type Props = {
  citaId: string;
  consultanteId: string;
  consultanteNombre: string;
  consentimiento: boolean;
  /** Lo ya grabado si la página se recargó a mitad de la sesión. */
  inicial: { fragmentos: number; duracionMs: number };
  onFragmentos?: (total: number) => void;
  ref?: Ref<GrabadorHandle>;
};

const reloj = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Graba la sesión presencial en fragmentos independientes de ~3 min que se suben en cuanto
 * terminan: si la app se cierra o iOS la suspende, como mucho se pierde el fragmento en curso.
 */
export function Grabador({
  citaId,
  consultanteId,
  consultanteNombre,
  consentimiento,
  inicial,
  onFragmentos,
  ref,
}: Props) {
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [consentido, setConsentido] = useState(consentimiento);
  const [pedirConsentimiento, setPedirConsentimiento] = useState(false);
  const [msGrabados, setMsGrabados] = useState(inicial.duracionMs);
  const [subidos, setSubidos] = useState(inicial.fragmentos);
  const [pendientes, setPendientes] = useState(0);
  const [falloSubida, setFalloSubida] = useState(false);

  const estadoRef = useRef<Estado>("inactivo");
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const alDetener = useRef<Promise<void> | null>(null);
  const rotacion = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const indice = useRef(inicial.fragmentos);
  const posicionMs = useRef(inicial.duracionMs);
  const inicioSegmento = useRef(0);
  const cola = useRef<Fragmento[]>([]);
  const subiendo = useRef<Promise<void> | null>(null);

  const cambiarEstado = useCallback((e: Estado) => {
    estadoRef.current = e;
    setEstado(e);
  }, []);

  // ── Subida en cola: un fragmento a la vez, con reintentos y espera creciente.
  const vaciarCola = useCallback(() => {
    if (subiendo.current) return subiendo.current;
    subiendo.current = (async () => {
      while (cola.current.length > 0) {
        const f = cola.current[0];
        let subido = false;
        for (let intento = 0; intento < 5 && !subido; intento++) {
          if (intento > 0) await espera(2 ** intento * 1000);
          const datos = new FormData();
          datos.set("audio", f.audio);
          datos.set("indice", String(f.indice));
          datos.set("inicioMs", String(f.inicioMs));
          datos.set("duracionMs", String(f.duracionMs));
          try {
            const res = await fetch(`/api/grabaciones/${citaId}/fragmentos`, { method: "POST", body: datos });
            // 4xx (salvo 408/429) no se arregla reintentando.
            if (res.ok || (res.status >= 400 && res.status < 500 && ![408, 429].includes(res.status))) {
              subido = true;
              if (!res.ok) {
                const { message } = await res.json().catch(() => ({ message: null }));
                toast.error(message ?? "No se pudo guardar un fragmento de audio.");
              } else {
                setSubidos((n) => n + 1);
              }
            }
          } catch {
            // Sin conexión: se reintenta.
          }
        }
        if (!subido) {
          setFalloSubida(true);
          break;
        }
        cola.current.shift();
        setPendientes(cola.current.length);
      }
      subiendo.current = null;
    })();
    return subiendo.current;
  }, [citaId]);

  const detenerSegmento = useCallback(async () => {
    if (rotacion.current) clearTimeout(rotacion.current);
    rotacion.current = null;
    const rec = recorder.current;
    if (rec && rec.state !== "inactive") rec.stop();
    await alDetener.current;
  }, []);

  // ── Segmentos: cada uno es un MediaRecorder nuevo, así cada archivo trae su encabezado.
  const iniciarSegmento = useCallback(() => {
    const flujo = stream.current;
    const formato = elegirFormato((t) => MediaRecorder.isTypeSupported(t));
    if (!flujo || !formato) return;

    const rec = new MediaRecorder(flujo, { mimeType: formato, audioBitsPerSecond: BITS_POR_SEGUNDO });
    const partes: Blob[] = [];
    let listo: () => void = () => {};
    alDetener.current = new Promise((r) => (listo = r));

    rec.ondataavailable = (e) => e.data.size > 0 && partes.push(e.data);
    rec.onstop = () => {
      const duracionMs = Math.round(performance.now() - inicioSegmento.current);
      const audio = new Blob(partes, { type: rec.mimeType || formato });
      // Menos de un segundo (pausa inmediata) no aporta nada que transcribir.
      if (duracionMs >= 1000 && audio.size > 0) {
        cola.current.push({ indice: indice.current++, inicioMs: posicionMs.current, duracionMs, audio });
        setPendientes(cola.current.length);
        posicionMs.current += duracionMs;
        void vaciarCola();
      }
      setMsGrabados(posicionMs.current);
      recorder.current = null;
      listo();
    };
    rec.onerror = () => cambiarEstado("interrumpido");

    recorder.current = rec;
    inicioSegmento.current = performance.now();
    rec.start();
    rotacion.current = setTimeout(() => {
      void rotar();
    }, FRAGMENTO_MS);
    async function rotar() {
      await detenerSegmento();
      if (estadoRef.current === "grabando") iniciarSegmento();
    }
  }, [cambiarEstado, detenerSegmento, vaciarCola]);

  const mantenerPantalla = useCallback(async () => {
    try {
      wakeLock.current = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      // Sin Wake Lock (o batería baja): la grabación sigue, solo puede apagarse la pantalla.
    }
  }, []);

  const liberar = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
  }, []);

  const abrirMicrofono = useCallback(async () => {
    const flujo = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    // Si el sistema corta el micrófono (llamada entrante, app en segundo plano), se avisa.
    flujo.getAudioTracks()[0]?.addEventListener("ended", () => {
      if (estadoRef.current === "grabando") {
        void detenerSegmento();
        cambiarEstado("interrumpido");
      }
    });
    stream.current = flujo;
  }, [cambiarEstado, detenerSegmento]);

  async function comenzar() {
    if (!consentido) {
      setPedirConsentimiento(true);
      return;
    }
    await iniciar();
  }

  async function iniciar() {
    if (typeof MediaRecorder === "undefined" || !elegirFormato((t) => MediaRecorder.isTypeSupported(t))) {
      toast.error("Este navegador no puede grabar audio. Actualízalo o usa Chrome o Safari.");
      return;
    }
    cambiarEstado("iniciando");
    const res = await iniciarGrabacion(citaId).catch(() => null);
    if (!res?.ok) {
      toast.error(res?.message ?? "Sin conexión con el servidor.");
      cambiarEstado("inactivo");
      return;
    }
    indice.current = Math.max(indice.current, res.siguienteIndice);
    posicionMs.current = Math.max(posicionMs.current, res.inicioMs);
    try {
      await abrirMicrofono();
    } catch {
      toast.error("Permite el acceso al micrófono para grabar la sesión.");
      cambiarEstado("inactivo");
      return;
    }
    await mantenerPantalla();
    iniciarSegmento();
    cambiarEstado("grabando");
  }

  async function confirmarConsentimiento() {
    const res = await registrarConsentimientoGrabacion(consultanteId).catch(() => null);
    if (!res?.ok) {
      toast.error(res?.message ?? "No pudimos registrar el consentimiento.");
      return;
    }
    setConsentido(true);
    setPedirConsentimiento(false);
    toast.success("Consentimiento registrado. Comenzamos a grabar.");
    await iniciar();
  }

  async function pausar() {
    await detenerSegmento();
    cambiarEstado("pausado");
  }

  async function reanudar() {
    if (!stream.current || stream.current.getAudioTracks()[0]?.readyState === "ended") {
      try {
        await abrirMicrofono();
      } catch {
        toast.error("Permite el acceso al micrófono para seguir grabando.");
        return;
      }
    }
    await mantenerPantalla();
    iniciarSegmento();
    cambiarEstado("grabando");
  }

  const detener = useCallback(async () => {
    await detenerSegmento();
    liberar();
    if (estadoRef.current !== "inactivo") cambiarEstado("inactivo");
    await vaciarCola();
    return { fragmentos: indice.current, pendientes: cola.current.length };
  }, [cambiarEstado, detenerSegmento, liberar, vaciarCola]);

  useImperativeHandle(ref, () => ({ detener }), [detener]);

  useEffect(() => onFragmentos?.(subidos + pendientes), [onFragmentos, subidos, pendientes]);

  // Reloj en vivo mientras se graba.
  useEffect(() => {
    if (estado !== "grabando") return;
    const id = setInterval(
      () => setMsGrabados(posicionMs.current + (performance.now() - inicioSegmento.current)),
      1000,
    );
    return () => clearInterval(id);
  }, [estado]);

  // Al volver a la app: el Wake Lock se pierde al ocultarse y en iOS el micrófono puede cortarse.
  useEffect(() => {
    const alCambiar = () => {
      if (document.visibilityState !== "visible") return;
      if (estadoRef.current !== "grabando") return;
      const pista = stream.current?.getAudioTracks()[0];
      if (!recorder.current || !pista || pista.readyState === "ended" || pista.muted) {
        void detenerSegmento();
        cambiarEstado("interrumpido");
      } else {
        void mantenerPantalla();
      }
    };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, [cambiarEstado, detenerSegmento, mantenerPantalla]);

  // Advierte antes de salir si hay audio grabándose o sin subir.
  const ocupado = estado === "grabando" || estado === "pausado" || pendientes > 0;
  useEffect(() => {
    if (!ocupado) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [ocupado]);

  useEffect(() => () => liberar(), [liberar]);

  const grabado = msGrabados > 0 || subidos > 0;

  return (
    <>
      <div className="flex items-center gap-1.5" aria-live="polite">
        {estado === "grabando" || estado === "pausado" || estado === "interrumpido" ? (
          <>
            <span
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-3.5 font-heading text-sm font-bold tabular-nums",
                estado === "grabando" && "bg-destructive-soft text-destructive",
                estado === "pausado" && "bg-tint-2 text-deep",
                estado === "interrumpido" && "bg-warning-soft text-warning",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full",
                  estado === "grabando" ? "animate-mk-pulse bg-destructive" : "bg-current",
                )}
              />
              <span className="sr-only">
                {estado === "grabando" ? "Grabando" : estado === "pausado" ? "Pausado" : "Grabación pausada por el sistema"}
              </span>
              {reloj(msGrabados)}
            </span>
            {estado === "grabando" ? (
              <Button variant="outline" size="icon" className="size-11" aria-label="Pausar grabación" onClick={() => void pausar()}>
                <PauseIcon />
              </Button>
            ) : (
              <Button variant="outline" className="h-11" onClick={() => void reanudar()}>
                <PlayIcon /> Reanudar
              </Button>
            )}
            <Button variant="outline" size="icon" className="size-11" aria-label="Detener grabación" onClick={() => void detener()}>
              <SquareIcon />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            disabled={estado === "iniciando"}
            onClick={() => void comenzar()}
            aria-label={grabado ? "Seguir grabando" : "Grabar sesión"}
            className="size-11 px-0 @min-[900px]:size-auto @min-[900px]:px-4"
          >
            <MicIcon />
            <span className="sr-only @min-[900px]:not-sr-only">
              {estado === "iniciando" ? "Preparando…" : grabado ? `Grabado ${reloj(msGrabados)}` : "Grabar"}
            </span>
          </Button>
        )}
        {falloSubida && (
          <Button
            variant="outline"
            className="h-11 border-warning-border text-warning"
            onClick={() => {
              setFalloSubida(false);
              void vaciarCola();
            }}
          >
            <CloudAlertIcon /> Reintentar subida ({pendientes})
          </Button>
        )}
      </div>

      <AlertDialog open={pedirConsentimiento} onOpenChange={setPedirConsentimiento}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Consentimiento para grabar</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma que {consultanteNombre} aceptó que se graben sus sesiones. El audio se usa
              solo para transcribir y proponer la nota, se guarda en almacenamiento privado y se
              borra automáticamente 30 días después de cada sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarConsentimiento()}>
              Sí, dio su consentimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
