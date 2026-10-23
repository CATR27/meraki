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
    <section className={cn("animate-mk-up rounded-3xl border bg-card px-7 py-6", className)}>
      <h2 className="mb-4 flex items-center gap-2.5 text-[19px] font-bold">
        {Icon && (
          <span className="flex size-[34px] items-center justify-center rounded-leaf bg-tint-2 text-deep">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {datos.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-semibold break-words text-foreground">
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
