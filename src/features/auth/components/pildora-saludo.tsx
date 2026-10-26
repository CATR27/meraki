"use client";

import { useSyncExternalStore } from "react";

const suscribirse = () => () => {};

function leer() {
  const ahora = new Date();
  const h = ahora.getHours();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const fecha = ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  return `${saludo} · ${fecha}`;
}

/** Saludo según la hora del dispositivo; se calcula en el cliente para no congelar la hora del servidor. */
export function PildoraSaludo() {
  const texto = useSyncExternalStore(suscribirse, leer, () => "Bienvenida");
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3.5 py-2 text-[13px] font-bold text-lavanda-100">
      <span className="size-[7px] animate-mk-pulse-claro rounded-full bg-lavanda-300" />
      <span suppressHydrationWarning className="whitespace-nowrap">{texto}</span>
    </span>
  );
}
