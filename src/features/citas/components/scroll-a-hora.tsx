"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Contenedor con scroll propio para la rejilla horaria.
 * Al montar, se desplaza para mostrar la hora indicada (en px desde arriba).
 */
export function ScrollAHora({
  offsetPx,
  className,
  children,
}: {
  offsetPx: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: Math.max(offsetPx, 0) });
  }, [offsetPx]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
