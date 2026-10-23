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
            className="animate-mk-up overflow-hidden rounded-3xl border bg-card px-[22px] transition-shadow last:border-b data-[state=open]:border-lavanda-300 data-[state=open]:shadow-[0_20px_40px_-28px_rgba(101,52,168,0.55)]"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-left">
                <span
                  className={`flex size-[38px] shrink-0 items-center justify-center rounded-leaf font-heading font-bold ${
                    completa ? "bg-success text-white" : "bg-tint-2 text-deep"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="grid">
                  <span className="font-heading text-[17px] font-bold text-ink">
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
