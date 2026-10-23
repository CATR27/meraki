"use client";

import { NotebookPenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExpedienteSecciones } from "@/features/expediente/components/expediente-secciones";

/** Permite completar el expediente durante la sesión sin salir de la nota. */
export function ExpedienteSheet({
  consultanteId,
  valores,
}: {
  consultanteId: string;
  valores: Record<string, string | null>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <NotebookPenIcon /> Expediente
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Expediente</SheetTitle>
          <SheetDescription>
            Cada sección se guarda por separado. Tu nota de sesión sigue guardándose sola.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ExpedienteSecciones consultanteId={consultanteId} valores={valores} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
