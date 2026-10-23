"use client";

import { Trash2Icon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { alternarRecordatorio, eliminarRecordatorio } from "../actions";

type Props = {
  id: string;
  titulo: string;
  descripcion: string | null;
  completado: boolean;
  /** Fecha y hora ya formateadas en la zona del consultorio. */
  cuando: string;
  vencido?: boolean;
  consultante?: { id: string; nombre: string } | null;
};

export function RecordatorioItem({
  id,
  titulo,
  descripcion,
  completado,
  cuando,
  vencido,
  consultante,
}: Props) {
  const [hecho, setHecho] = useOptimistic(completado);
  const [pending, startTransition] = useTransition();

  function alternar() {
    startTransition(async () => {
      setHecho(!hecho);
      const res = await alternarRecordatorio(id);
      if (!res?.ok) toast.error(res?.message ?? "No se pudo actualizar.");
    });
  }

  function eliminar() {
    startTransition(async () => {
      const res = await eliminarRecordatorio(id);
      if (res?.ok) toast.success(res.message);
      else toast.error(res?.message ?? "No se pudo eliminar.");
    });
  }

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card p-3.5 transition-opacity",
        pending && "opacity-70",
      )}
    >
      <Checkbox
        checked={hecho}
        onCheckedChange={alternar}
        aria-label={hecho ? `Marcar “${titulo}” como pendiente` : `Marcar “${titulo}” como hecho`}
        className="mt-0.5 size-5"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold", hecho && "text-muted-foreground line-through")}>
          {titulo}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span
            className={cn(
              vencido && !hecho ? "font-bold text-destructive" : "text-muted-foreground",
            )}
          >
            {vencido && !hecho ? "Venció: " : ""}
            {cuando}
          </span>
          {consultante && (
            <Link
              href={`/consultantes/${consultante.id}`}
              className="inline-flex items-center gap-1 font-semibold text-lavanda-700 hover:underline"
            >
              <UserRoundIcon className="size-3" aria-hidden="true" />
              {consultante.nombre}
            </Link>
          )}
        </p>
        {descripcion && (
          <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">{descripcion}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={eliminar}
        disabled={pending}
        aria-label={`Eliminar “${titulo}”`}
        className="opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2Icon />
      </Button>
    </li>
  );
}
