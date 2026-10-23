import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bloque de formulario en tarjeta: título y descripción arriba, campos en dos columnas. */
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
        "animate-mk-up mb-6 grid gap-5 rounded-3xl border bg-card px-6 py-6 sm:px-7",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
