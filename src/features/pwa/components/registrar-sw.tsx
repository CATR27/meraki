"use client";

import { useEffect } from "react";
import { iniciarInstalacion } from "../instalacion";

/** Registra el service worker (solo producción) y escucha el evento de instalación. */
export function RegistrarSw() {
  useEffect(() => {
    iniciarInstalacion();
    // iOS ignora user-scalable=no para el pellizco: se bloquea el gesto aparte.
    const bloquear = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", bloquear);
    document.addEventListener("gesturechange", bloquear);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
    return () => {
      document.removeEventListener("gesturestart", bloquear);
      document.removeEventListener("gesturechange", bloquear);
    };
  }, []);

  return null;
}
