import { Ornamento } from "@/components/brand/ornamento";
import { cn } from "@/lib/utils";

const PETALO =
  "M24 6c4.8 5.2 7 10.6 7 16.2S28.8 33 24 38.4C19.2 33 17 27.8 17 22.2S19.2 11.2 24 6Z";
const ANGULOS = [-84, -63, -42, -21, 0, 21, 42, 63, 84];
// Orden de pintado: los pétalos exteriores quedan al fondo.
const ORDEN = [0, 8, 1, 7, 2, 6, 3, 5, 4];

/** Loto que se abre según el progreso (0–1); `enviando` lo deja en plena flor. */
export function LotoLogin({ progreso, enviando }: { progreso: number; enviando: boolean }) {
  const p = enviando ? 1 : progreso;
  const brillo = (0.12 + 0.4 * p).toFixed(2);

  return (
    <div aria-hidden="true" className="relative grid aspect-[1.3] w-[min(320px,74vw,25dvh)] place-items-center">
      {[0, -2, -4].map((retraso) => (
        <span
          key={retraso}
          className="pointer-events-none absolute top-[72%] left-1/2 -mt-[23%] -ml-[23%] aspect-square w-[46%] animate-mk-ripple rounded-full border border-lavanda-200/45 [animation-duration:6s]"
          style={{ animationDelay: `${retraso}s` }}
        />
      ))}
      <Ornamento
        n="10_onda_luminosa"
        anim="bob"
        sobre="oscuro"
        op={0.8}
        dur={9}
        className="-right-[40%] -bottom-[30%] -left-[40%] h-[80%] [mask-image:linear-gradient(90deg,transparent,#000_25%,#000_75%,transparent)]"
      />
      <span
        className="pointer-events-none absolute inset-[8%_14%] rounded-full transition-[background] duration-700"
        style={{ background: `radial-gradient(circle, rgba(224,208,247,${brillo}) 0%, transparent 65%)` }}
      />
      <svg viewBox="-14 -4 76 50" className="relative size-full animate-mk-soft overflow-visible [animation-duration:7s]">
        {ORDEN.map((i) => {
          const k = Math.abs(i - 4) / 4;
          const angulo = ANGULOS[i] * (0.08 + 0.92 * p);
          const escala = (enviando ? 1.1 : 1) * (0.5 + 0.5 * p) * (1 - k * 0.18);
          const alfa = (0.22 + 0.45 * (1 - k)) * (0.55 + 0.45 * p);
          return (
            <path
              key={i}
              d={PETALO}
              fill={`rgba(${k > 0.5 ? "201,174,240" : "255,255,255"},${alfa.toFixed(2)})`}
              stroke="rgba(255,255,255,.35)"
              strokeWidth=".3"
              className={cn("[transition:transform_1s_cubic-bezier(.3,1.4,.5,1),fill_.8s]")}
              style={{ transformOrigin: "24px 38.4px", transform: `rotate(${angulo}deg) scale(${escala})` }}
            />
          );
        })}
        <ellipse cx="24" cy="39.6" rx="11" ry="1.6" fill="rgba(36,19,63,.35)" />
      </svg>
    </div>
  );
}
