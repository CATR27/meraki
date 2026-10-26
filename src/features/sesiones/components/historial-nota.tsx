import { HistoryIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatEnZona } from "@/lib/dates";
import type { VersionNota } from "../queries";
import { CAMPOS_SOAP, RIESGO_LABEL } from "../schemas";

const EXTRAS = [
  { campo: "tareasAsignadas", label: "Tareas asignadas" },
  { campo: "observaciones", label: "Observaciones" },
] as const;

/** Versiones anteriores de una nota finalizada, en solo lectura. */
export function HistorialNota({ versiones, zona }: { versiones: VersionNota[]; zona: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="max-sm:h-11">
          <HistoryIcon /> Historial ({versiones.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Historial de la nota</SheetTitle>
          <SheetDescription>
            Así estaba la nota antes de cada edición. Las versiones no se pueden modificar.
          </SheetDescription>
        </SheetHeader>
        <ol className="grid gap-4 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {versiones.map((v) => (
            <li key={v.id} className="grid gap-3 rounded-3xl border bg-card p-5">
              <header className="flex flex-wrap items-center gap-2">
                <h3 className="font-sans text-base font-extrabold tracking-normal">
                  Versión {v.version}
                </h3>
                <StatusBadge tono={v.origen === "ia" ? "primary" : "neutral"}>
                  {v.origen === "ia" ? "Reemplazada con propuesta IA" : "Edición manual"}
                </StatusBadge>
                <span className="w-full text-xs text-muted-foreground">
                  Reemplazada el {formatEnZona(v.createdAt, "d MMM yyyy, HH:mm", zona)} por{" "}
                  {v.editor}
                </span>
              </header>
              <div className="flex flex-wrap gap-1.5">
                {v.estadoAnimo != null && (
                  <StatusBadge tono="primary">Ánimo {v.estadoAnimo}/10</StatusBadge>
                )}
                <StatusBadge tono={v.nivelRiesgo === "ninguno" ? "success" : "neutral"}>
                  {RIESGO_LABEL[v.nivelRiesgo]}
                </StatusBadge>
              </div>
              {[...CAMPOS_SOAP, ...EXTRAS].map(({ campo, label }) => (
                <div key={campo} className="grid gap-0.5">
                  <p className="text-xs font-extrabold text-ink">{label}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {v[campo] || <span className="text-muted-foreground">Sin registro</span>}
                  </p>
                </div>
              ))}
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
