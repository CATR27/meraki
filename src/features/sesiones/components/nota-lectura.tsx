import { FilePenLineIcon, LockKeyholeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatEnZona } from "@/lib/dates";
import type { Sesion, VersionNota } from "../queries";
import { CAMPOS_SOAP, notaPorCompletar, RIESGO_LABEL } from "../schemas";
import { HistorialNota } from "./historial-nota";

/**
 * Nota finalizada en lectura. Se puede editar, pero cada cambio guarda la versión
 * anterior para preservar la integridad del registro clínico.
 */
export function NotaLectura({
  nota,
  historial,
  zona,
}: {
  nota: NonNullable<Sesion["nota"]>;
  historial: VersionNota[];
  zona: string;
}) {
  const extras = [
    { label: "Tareas asignadas", valor: nota.tareasAsignadas },
    { label: "Observaciones", valor: nota.observaciones },
  ];
  const pendiente = notaPorCompletar(nota);
  const editarHref = `/citas/${nota.citaId}/sesion?editar=1`;

  return (
    <div className="grid gap-4">
      {pendiente && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-warning-border bg-warning-soft p-4 text-sm text-warning">
          <FilePenLineIcon className="size-5 shrink-0" aria-hidden="true" />
          <p className="min-w-[200px] flex-1">
            <span className="font-bold">Sesión finalizada sin nota.</span> Complétala cuando
            puedas; quedará registrada como una nueva versión.
          </p>
          <Button size="sm" className="max-sm:h-11" asChild>
            <Link href={editarHref}>
              <PencilIcon /> Completar nota
            </Link>
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {pendiente ? (
          <StatusBadge tono="warning">Por completar</StatusBadge>
        ) : (
          <StatusBadge tono="success">
            <LockKeyholeIcon className="size-3" aria-hidden="true" /> Nota finalizada
          </StatusBadge>
        )}
        <span className="text-sm text-muted-foreground">
          {nota.editadaAt
            ? `Editada el ${formatEnZona(nota.editadaAt, "d MMM yyyy, HH:mm", zona)} · versión ${nota.version}`
            : `Última modificación: ${formatEnZona(nota.updatedAt, "d MMM yyyy, HH:mm", zona)}`}
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
        <span className="ml-auto flex flex-wrap gap-2">
          {historial.length > 0 && <HistorialNota versiones={historial} zona={zona} />}
          {!pendiente && (
            <Button variant="outline" size="sm" className="max-sm:h-11" asChild>
              <Link href={editarHref}>
                <PencilIcon /> Editar nota
              </Link>
            </Button>
          )}
        </span>
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
