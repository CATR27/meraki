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
        <Button variant="outline" aria-label="Expediente" className="size-11 px-0 @min-[900px]:size-auto @min-[900px]:px-4">
          <NotebookPenIcon /> <span className="sr-only @min-[900px]:not-sr-only">Expediente</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Expediente</SheetTitle>
          <SheetDescription>
            Cada sección se guarda por separado. Tu nota de sesión sigue guardándose sola.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <ExpedienteSecciones consultanteId={consultanteId} valores={valores} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
