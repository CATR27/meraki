"use client";

import { useSyncExternalStore } from "react";

/** Evento no estándar de Chromium: permite lanzar el diálogo de instalación propio. */
type EventoInstalacion = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Estado = {
  /** Se puede instalar con un clic (Chromium/Android). */
  puedeInstalar: boolean;
  /** iOS/iPadOS: la instalación es manual desde "Compartir". */
  ios: boolean;
  instalada: boolean;
  descartado: boolean;
};

const CLAVE_DESCARTE = "meraki:pwa-descartada";
const SERVIDOR: Estado = { puedeInstalar: false, ios: false, instalada: true, descartado: true };

let estado: Estado = SERVIDOR;
let evento: EventoInstalacion | null = null;
let iniciado = false;
const oyentes = new Set<() => void>();

function emitir(cambio: Partial<Estado>) {
  estado = { ...estado, ...cambio };
  oyentes.forEach((o) => o());
}

function leerDescarte() {
  try {
    return localStorage.getItem(CLAVE_DESCARTE) === "1";
  } catch {
    return false;
  }
}

/** Engancha los eventos del navegador una sola vez (se llama al montar la app). */
export function iniciarInstalacion() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;

  const ua = navigator.userAgent;
  // iPadOS 13+ se presenta como Mac con pantalla táctil.
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const instalada =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  estado = { puedeInstalar: false, ios, instalada, descartado: leerDescarte() };
  oyentes.forEach((o) => o());

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    evento = e as EventoInstalacion;
    emitir({ puedeInstalar: true });
  });
  window.addEventListener("appinstalled", () => {
    evento = null;
    emitir({ puedeInstalar: false, instalada: true });
  });
}

export async function instalar() {
  if (!evento) return;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  evento = null;
  emitir({ puedeInstalar: false, ...(outcome === "accepted" ? { instalada: true } : {}) });
}

export function descartarBanner() {
  try {
    localStorage.setItem(CLAVE_DESCARTE, "1");
  } catch {
    // Sin almacenamiento: el banner solo se oculta en esta visita.
  }
  emitir({ descartado: true });
}

function suscribirse(cb: () => void) {
  oyentes.add(cb);
  return () => oyentes.delete(cb);
}

export function useInstalacion(): Estado {
  return useSyncExternalStore(
    suscribirse,
    () => estado,
    () => SERVIDOR,
  );
}
