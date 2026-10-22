"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusBadge } from "@/components/shared/status-badge";
import { SECCIONES_EXPEDIENTE } from "../secciones";
import { SeccionForm } from "./seccion-form";

type Props = { consultanteId: string; valores: Record<string, string | null> };

export function ExpedienteSecciones({ consultanteId, valores }: Props) {
  const llenos = (s: (typeof SECCIONES_EXPEDIENTE)[number]) =>
    s.campos.filter(({ campo }) => valores[campo]?.trim()).length;

  // Abre por defecto la primera sección con campos pendientes.
  const primeraPendiente = SECCIONES_EXPEDIENTE.find((s) => llenos(s) < s.campos.length);

  return (
    <Accordion
      type="multiple"
      defaultValue={primeraPendiente ? [primeraPendiente.id] : []}
      className="grid gap-3"
    >
      {SECCIONES_EXPEDIENTE.map((s, i) => {
        const n = llenos(s);
        const completa = n === s.campos.length;
        return (
          <AccordionItem
            key={s.id}
            value={s.id}
            className="overflow-hidden rounded-2xl border bg-card px-5 last:border-b"
          >
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-left">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lavanda-100 font-heading font-bold text-lavanda-700">
                  {i + 1}
                </span>
                <span className="grid">
                  <span className="font-heading text-base font-bold text-lavanda-950">
                    {s.titulo}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">{s.descripcion}</span>
                </span>
                <StatusBadge
                  tono={completa ? "success" : n > 0 ? "primary" : "neutral"}
                  className="mr-2 ml-auto"
                >
                  {completa ? "Completa" : `${n} de ${s.campos.length}`}
                </StatusBadge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <SeccionForm consultanteId={consultanteId} seccion={s} valores={valores} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
