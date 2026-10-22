import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Dato = { label: string; value: ReactNode };

/** Tarjeta con lista de datos (etiqueta → valor); los valores vacíos se muestran como "—". */
export function InfoCard({
  title,
  icon: Icon,
  datos,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  datos: Dato[];
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-lavanda-100 text-lavanda-700">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {datos.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-0.5 break-words text-foreground">
              {value === null || value === undefined || value === "" ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
