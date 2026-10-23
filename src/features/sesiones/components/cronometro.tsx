"use client";

import { TimerIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function leerInicio(clave: string): number {
  try {
    const guardado = Number(sessionStorage.getItem(clave));
    if (guardado > 0) return guardado;
    const ahora = Date.now();
    sessionStorage.setItem(clave, String(ahora));
    return ahora;
  } catch {
    return Date.now();
  }
}

/** Tiempo transcurrido de la sesión; sobrevive a recargas de la pestaña. */
export function Cronometro({ citaId, duracionMin }: { citaId: string; duracionMin: number }) {
  const [transcurrido, setTranscurrido] = useState<number | null>(null);

  useEffect(() => {
    const inicio = leerInicio(`meraki:sesion:${citaId}`);
    const tick = () => setTranscurrido(Math.floor((Date.now() - inicio) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [citaId]);

  const seg = transcurrido ?? 0;
  const excedido = seg > duracionMin * 60;
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums",
        excedido ? "bg-warning-soft text-warning" : "bg-lavanda-100 text-lavanda-800",
      )}
      title={`Duración planeada: ${duracionMin} min`}
    >
      <TimerIcon className="size-4" aria-hidden="true" />
      <span aria-label="Tiempo de sesión">{transcurrido === null ? "--:--" : `${mm}:${ss}`}</span>
      <span className="font-sans font-semibold opacity-70">/ {duracionMin} min</span>
    </span>
  );
}
