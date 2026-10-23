"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CIRCUNFERENCIA = 113.1; // 2·π·18

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

/** Tiempo transcurrido de la sesión en un anillo; sobrevive a recargas de la pestaña. */
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
      className="flex items-center gap-3 rounded-full bg-tint py-1.5 pr-[18px] pl-1.5"
      title={`Duración planeada: ${duracionMin} min`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true" className="size-11 -rotate-90">
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
            "font-heading text-2xl font-bold tabular-nums",
            excedido ? "text-warning" : "text-ink",
          )}
        >
          {transcurrido === null ? "--:--" : `${mm}:${ss}`}
        </span>
        <span className="text-xs text-muted-foreground">de {duracionMin} min</span>
      </span>
    </div>
  );
}
