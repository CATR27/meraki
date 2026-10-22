import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bloque de formulario: título y descripción a la izquierda, campos a la derecha. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid gap-6 border-b border-border/70 py-8 first:pt-0 last:border-b-0 lg:grid-cols-[16rem_1fr]",
        className,
      )}
    >
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
