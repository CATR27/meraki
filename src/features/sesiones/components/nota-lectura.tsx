import { LockKeyholeIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatEnZona } from "@/lib/dates";
import type { Sesion } from "../queries";
import { CAMPOS_SOAP, RIESGO_LABEL } from "../schemas";

/** Nota cerrada: solo lectura, para preservar la integridad del registro clínico. */
export function NotaLectura({ nota, zona }: { nota: NonNullable<Sesion["nota"]>; zona: string }) {
  const extras = [
    { label: "Tareas asignadas", valor: nota.tareasAsignadas },
    { label: "Observaciones", valor: nota.observaciones },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tono="success">
          <LockKeyholeIcon className="size-3" aria-hidden="true" /> Nota cerrada
        </StatusBadge>
        <span className="text-sm text-muted-foreground">
          Última modificación: {formatEnZona(nota.updatedAt, "d MMM yyyy, HH:mm", zona)}
        </span>
        {nota.estadoAnimo != null && (
          <StatusBadge tono="primary">Ánimo {nota.estadoAnimo}/10</StatusBadge>
        )}
        <StatusBadge
          tono={
            nota.nivelRiesgo === "ninguno"
              ? "success"
              : nota.nivelRiesgo === "bajo"
                ? "neutral"
                : "danger"
          }
        >
          {nota.nivelRiesgo === "ninguno"
            ? RIESGO_LABEL.ninguno
            : `Riesgo ${RIESGO_LABEL[nota.nivelRiesgo].toLowerCase()}`}
        </StatusBadge>
      </div>

      <div className="grid gap-4 @min-[600px]:grid-cols-2">
        {CAMPOS_SOAP.map(({ campo, label, guia }, i) => (
          <section
            key={campo}
            style={{ animationDelay: `${100 + i * 70}ms` }}
            className="animate-mk-up grid content-start gap-2 rounded-3xl border bg-card px-[22px] py-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-[42px] shrink-0 items-center justify-center rounded-leaf bg-primary font-heading text-xl font-bold text-primary-foreground">
                {label.charAt(0)}
              </span>
              <span className="grid">
                <h2 className="font-sans text-base font-extrabold tracking-normal">{label}</h2>
                <span className="text-xs leading-snug text-muted-foreground">{guia}</span>
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">
              {nota[campo] || <span className="text-muted-foreground">Sin registro</span>}
            </p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 @min-[600px]:grid-cols-2">
        {extras.map(({ label, valor }) => (
          <section key={label} className="rounded-3xl border bg-card px-[22px] py-5">
            <h2 className="font-sans text-sm font-extrabold tracking-normal">{label}</h2>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">
              {valor || <span className="text-muted-foreground">Sin registro</span>}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
