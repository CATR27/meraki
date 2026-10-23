import { LockKeyholeIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatEnZona } from "@/lib/dates";
import type { Sesion } from "../queries";
import { CAMPOS_SOAP, RIESGO_LABEL } from "../schemas";

/** Nota cerrada: solo lectura, para preservar la integridad del registro clínico. */
export function NotaLectura({ nota, zona }: { nota: NonNullable<Sesion["nota"]>; zona: string }) {
  const bloques = [
    ...CAMPOS_SOAP.map((c) => ({ label: c.label, valor: nota[c.campo] })),
    { label: "Tareas asignadas", valor: nota.tareasAsignadas },
    { label: "Observaciones", valor: nota.observaciones },
  ];

  return (
    <article className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-center gap-2">
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
      </header>
      {bloques.map(({ label, valor }) => (
        <section key={label}>
          <h2 className="text-sm font-bold text-lavanda-900">{label}</h2>
          <p className="mt-1 leading-relaxed whitespace-pre-line">
            {valor || <span className="text-muted-foreground">Sin registro</span>}
          </p>
        </section>
      ))}
    </article>
  );
}
