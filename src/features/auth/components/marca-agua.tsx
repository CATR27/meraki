"use client";

import { useEffect, useRef } from "react";

/**
 * Marca de agua "meraki" del acceso. Con ratón, la palabra se ilumina bajo el cursor;
 * en pantallas táctiles se ilumina sola por distintas zonas y responde al toque.
 */
export function MarcaAgua() {
  const caja = useRef<HTMLSpanElement>(null);
  const brillo = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = caja.current;
    const luz = brillo.current;
    if (!el || !luz) return;
    let cuadro = 0;
    let apagar: ReturnType<typeof setTimeout> | undefined;

    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        luz.style.setProperty("--x", `${e.clientX - r.left}px`);
        luz.style.setProperty("--y", `${e.clientY - r.top}px`);
        if (e.pointerType === "mouse" || e.pointerType === "pen") {
          luz.dataset.sigue = "";
        } else if (e.type === "pointerdown") {
          // Toque: el destello se coloca bajo el dedo un instante y vuelve a su recorrido.
          luz.dataset.toque = "";
          clearTimeout(apagar);
          apagar = setTimeout(() => delete luz.dataset.toque, 1400);
        }
      });
    };
    const salir = () => delete luz.dataset.sigue;

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    return () => {
      cancelAnimationFrame(cuadro);
      clearTimeout(apagar);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", mover);
      document.documentElement.removeEventListener("pointerleave", salir);
    };
  }, []);

  return (
    <span
      ref={caja}
      aria-hidden="true"
      className="pointer-events-none absolute top-[calc(var(--mk-top)+clamp(96px,15vh,170px))] left-1/2 -translate-x-1/2 font-heading text-[clamp(120px,25vw,400px)] leading-[0.8] font-bold tracking-[-0.05em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1.5px_rgba(224,208,247,0.13)]"
    >
      meraki
      <span ref={brillo} className="mk-marca-brillo absolute inset-0">
        meraki
      </span>
    </span>
  );
}
