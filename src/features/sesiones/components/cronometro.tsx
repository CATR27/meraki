"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CIRCUNFERENCIA = 113.1; // 2·π·18

function leerInicio(clave: string): number {
  try {
    const guardado = Number(localStorage.getItem(clave));
    // Un inicio de hace más de 12 h es de otro día: se empieza de nuevo.
    if (guardado > 0 && Date.now() - guardado < 12 * 3600_000) return guardado;
    const ahora = Date.now();
    localStorage.setItem(clave, String(ahora));
    return ahora;
  } catch {
    return Date.now();
  }
}

/** Tiempo transcurrido de la sesión en un anillo; sobrevive a recargas y a cierres de la app. */
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
  const restante = CIRCUNFERENCIA * (1 - Math.min(seg / (duracionMin * 60), 1));

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-tint py-1 pr-3.5 pl-1 @min-[600px]:gap-3 @min-[600px]:py-1.5 @min-[600px]:pr-[18px] @min-[600px]:pl-1.5"
      title={`Duración planeada: ${duracionMin} min`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true" className="size-9 -rotate-90 @min-[600px]:size-11">
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--tint-3)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={excedido ? "var(--warning)" : "var(--primary)"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={restante}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="grid leading-[1.1]">
        <span
          aria-label="Tiempo de sesión"
          className={cn(
            "font-heading text-lg font-bold tabular-nums @min-[600px]:text-2xl",
            excedido ? "text-warning" : "text-ink",
          )}
        >
          {transcurrido === null ? "--:--" : `${mm}:${ss}`}
        </span>
        <span className="hidden text-xs text-muted-foreground @min-[600px]:block">de {duracionMin} min</span>
      </span>
    </div>
  );
}
