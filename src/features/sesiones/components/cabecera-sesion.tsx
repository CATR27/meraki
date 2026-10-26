import type { ReactNode } from "react";

/** Tarjeta superior del modo sesión: identidad a la izquierda, acciones a la derecha. */
export function CabeceraSesion({
  izquierda,
  acciones,
  final,
}: {
  izquierda: ReactNode;
  acciones?: ReactNode;
  /** Último elemento (p. ej. "Finalizar sesión"), tras las acciones. */
  final?: ReactNode;
}) {
  return (
    <header className="animate-mk-up flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl border bg-card px-4 py-4 @min-[600px]:px-5">
      {izquierda}
      <div className="ml-auto flex flex-wrap items-center gap-2 @min-[600px]:gap-3">{acciones}</div>
      {final && <div className="hidden @min-[600px]:block">{final}</div>}
    </header>
  );
}
