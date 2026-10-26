import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export const ORNAMENTOS = [
  "01_loto_resplandor",
  "02_petalo_flotante",
  "03_ondas_de_calma",
  "04_loto_orbita",
  "05_petalo_esquina",
  "06_luna_botanica",
  "07_brote_equilibrio",
  "08_flor_esquina",
  "09_orbitas_serenas",
  "10_onda_luminosa",
  "11_petales_en_brisa",
  "12_amanecer",
  "13_loto_esencial",
  "14_ola_botanica",
  "15_brote_crecimiento",
  "16_loto_de_fondo",
  "17_arcos_de_paz",
  "18_loto_en_halo",
  "19_hojas_suaves",
  "20_luna_y_hoja",
] as const;

type Props = {
  n: (typeof ORNAMENTOS)[number];
  anim?: "float" | "bob" | "sway" | "breathe" | "spin" | "none";
  /** "oscuro" = sobre fondos morados (mezcla screen); "auto" = sigue el tema claro/oscuro. */
  sobre?: "auto" | "oscuro";
  op?: number;
  /** Duración del ciclo en segundos. */
  dur?: number;
  delay?: number;
  origen?: string;
  flip?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Ilustración decorativa SVG del rediseño: flota, respira o gira sin estorbar al contenido. */
export function Ornamento({
  n,
  anim = "float",
  sobre = "auto",
  op = 1,
  dur = 14,
  delay = 0,
  origen = "50% 50%",
  flip,
  className,
  style,
}: Props) {
  const movimiento = {
    float: `mk-float ${dur}s ease-in-out ${delay}s infinite`,
    bob: `mk-bob ${dur}s ease-in-out ${delay}s infinite`,
    sway: `mk-orn-sway ${dur}s ease-in-out ${delay}s infinite`,
    breathe: `mk-soft ${dur}s ease-in-out ${delay}s infinite`,
    spin: `mk-spin ${dur * 4}s linear ${delay}s infinite`,
    none: "none",
  }[anim];
  const oscuro = sobre === "oscuro";

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute block select-none", className)}
      style={{ transformOrigin: origen, animation: movimiento, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG decorativo estático */}
      <img
        src={`/orn/${n}.svg`}
        alt=""
        draggable={false}
        className="block size-full object-contain select-none"
        style={{
          transform: flip ? "scaleX(-1)" : undefined,
          opacity: oscuro ? op : `calc(${op} * var(--orn-op, 0.8))`,
          mixBlendMode: oscuro ? "screen" : ("var(--orn-blend, multiply)" as CSSProperties["mixBlendMode"]),
          animation: oscuro
            ? `mk-glow-d 6s ease-in-out ${delay}s infinite`
            : `var(--orn-glow, mk-glow-l) 6s ease-in-out ${delay}s infinite`,
        }}
      />
    </span>
  );
}
