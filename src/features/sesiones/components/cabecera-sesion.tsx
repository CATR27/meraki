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
    <header className="animate-mk-up flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl border bg-card px-5 py-4">
      {izquierda}
      <div className="flex flex-wrap items-center gap-3 lg:ml-auto">{acciones}</div>
      {final}
    </header>
  );
}
