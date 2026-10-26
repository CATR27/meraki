import { PlayIcon } from "lucide-react";
import Link from "next/link";
import { tuDia } from "@/features/panel/queries";

const CIRCUNFERENCIA = 119.4;

function Anillo({ completadas, total, size }: { completadas: number; total: number; size: number }) {
  const trazo = total > 0 ? (CIRCUNFERENCIA * completadas) / total : 0;
  return (
    <span className="relative flex-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 46 46" className="-rotate-90" style={{ width: size, height: size }} aria-hidden="true">
        <circle cx="23" cy="23" r="19" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="4" />
        <circle
          cx="23"
          cy="23"
          r="19"
          fill="none"
          stroke="#c9aef0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${trazo} ${CIRCUNFERENCIA}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-[13px] font-bold text-white">
        {completadas}/{total}
      </span>
    </span>
  );
}

/** Tarjeta "Tu día" de la barra lateral: progreso y siguiente sesión (riel: solo el anillo). */
export async function TuDia() {
  const { total, completadas, siguiente } = await tuDia();
  const destino = siguiente ? `/citas/${siguiente.citaId}/sesion` : "/agenda";

  return (
    <>
      <Link
        href={destino}
        className="relative hidden gap-3.5 rounded-[22px] border border-white/12 bg-white/8 p-4 text-white transition-colors hover:bg-white/13 hover:text-white min-[1200px]:grid"
      >
        <span className="flex items-center gap-3">
          <Anillo completadas={completadas} total={total} size={46} />
          <span className="grid leading-tight">
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-lavanda-300 uppercase">Tu día</span>
            <span className="text-sm font-bold">
              {completadas} de {total} {total === 1 ? "sesión" : "sesiones"}
            </span>
          </span>
        </span>
        {siguiente && (
          <span className="flex items-center gap-2.5 border-t border-white/12 pt-3">
            <span className="size-2 flex-none animate-mk-pulse-claro rounded-full bg-lavanda-300" />
            <span className="grid min-w-0 flex-1 leading-snug">
              <span className="truncate text-sm font-extrabold">{siguiente.nombre}</span>
              <span className="text-xs text-lavanda-200">
                {siguiente.hora} · {siguiente.minutos > 0 ? `en ${siguiente.minutos} min` : "ahora"}
              </span>
            </span>
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-white text-lavanda-800">
              <PlayIcon aria-hidden="true" className="size-3.5" />
            </span>
          </span>
        )}
      </Link>
      <Link
        href={destino}
        title={siguiente ? `Siguiente: ${siguiente.nombre} · ${siguiente.hora}` : "Ver agenda"}
        aria-label="Tu día"
        className="hidden flex-none self-center text-white min-[768px]:max-[1199px]:block"
      >
        <Anillo completadas={completadas} total={total} size={44} />
      </Link>
    </>
  );
}
