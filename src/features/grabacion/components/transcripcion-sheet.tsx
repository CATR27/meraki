"use client";

import { ArrowLeftRightIcon, MessageSquareTextIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { cambiarHablante } from "../actions";
import { HABLANTE_LABEL, type Transcripcion } from "../schemas";

const minuto = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Transcripción por turnos; un clic en el hablante lo corrige si la IA se equivocó. */
export function TranscripcionSheet({
  citaId,
  transcripcion,
}: {
  citaId: string;
  transcripcion: Transcripcion;
}) {
  const [pendiente, start] = useTransition();

  const cambiar = (indice: number | "todos") =>
    start(async () => {
      const r = await cambiarHablante(citaId, indice).catch(() => null);
      if (!r?.ok) toast.error(r?.message ?? "Sin conexión con el servidor.");
    });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="max-sm:h-11">
          <MessageSquareTextIcon /> Transcripción
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Transcripción de la sesión</SheetTitle>
          <SheetDescription>
            La IA identificó quién habla en cada turno. Toca la etiqueta para corregirla.
          </SheetDescription>
          <Button
            variant="outline"
            size="sm"
            className="self-start max-sm:h-11"
            disabled={pendiente}
            onClick={() => cambiar("todos")}
          >
            <ArrowLeftRightIcon /> Intercambiar hablantes
          </Button>
        </SheetHeader>
        <ol className="grid gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {transcripcion.segmentos.map((s, i) => (
            <li
              key={i}
              className={cn(
                "grid gap-1 rounded-2xl px-4 py-3",
                s.hablante === "psicologo" ? "mr-8 bg-tint-2" : "ml-8 bg-card ring-1 ring-border",
              )}
            >
              <span className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => cambiar(i)}
                  className="min-h-8 rounded-full font-extrabold text-deep underline-offset-2 hover:underline"
                  aria-label={`Cambiar hablante del turno ${i + 1}`}
                >
                  {s.hablante ? HABLANTE_LABEL[s.hablante] : "Sin identificar"}
                </button>
                <span className="text-muted-foreground tabular-nums">{minuto(s.inicioMs)}</span>
              </span>
              <p className="text-sm leading-relaxed">{s.texto}</p>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
