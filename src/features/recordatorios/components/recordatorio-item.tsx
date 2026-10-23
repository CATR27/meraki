"use client";

import { CheckIcon, ClockIcon, Trash2Icon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  /** "compacto" es la versión del panel de inicio; "tarjeta" la de la lista completa. */
  variante?: "tarjeta" | "compacto";
};

export function RecordatorioItem({
  id,
  titulo,
  descripcion,
  completado,
  cuando,
  vencido,
  consultante,
  variante = "tarjeta",
}: Props) {
  const [hecho, setHecho] = useOptimistic(completado);
  const [pending, startTransition] = useTransition();
  const compacto = variante === "compacto";
  const atrasado = Boolean(vencido) && !hecho;
  const color = hecho ? "var(--success)" : atrasado ? "var(--destructive)" : "var(--color-lavanda-500)";

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
        "group flex items-start gap-3 transition-[opacity,transform]",
        compacto
          ? "rounded-2xl bg-tint px-3 py-2.5"
          : "rounded-2xl border bg-card px-5 py-4 hover:translate-x-1",
        !compacto && atrasado && "border-destructive/30",
        hecho && "opacity-55",
        pending && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={alternar}
        aria-pressed={hecho}
        aria-label={hecho ? `Marcar “${titulo}” como pendiente` : `Marcar “${titulo}” como hecho`}
        style={{ borderColor: color, background: hecho ? color : "transparent" }}
        className={cn(
          "mt-0.5 flex shrink-0 items-center justify-center rounded-leaf border-2 text-white transition-all",
          compacto ? "size-[18px]" : "size-6",
        )}
      >
        {hecho && <CheckIcon className={compacto ? "size-3" : "size-3.5"} strokeWidth={3} />}
      </button>
      <div className="grid min-w-0 flex-1 gap-1">
        <p
          className={cn(
            "font-extrabold text-foreground",
            compacto && "text-sm font-bold",
            hecho && "line-through",
          )}
        >
          {titulo}
        </p>
        {descripcion && !compacto && (
          <p className="text-[13px] whitespace-pre-line text-muted-foreground">{descripcion}</p>
        )}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-extrabold"
            style={{ color }}
          >
            {!compacto && <ClockIcon className="size-[13px]" aria-hidden="true" />}
            {atrasado ? "Venció: " : ""}
            {cuando}
          </span>
          {consultante && !compacto && (
            <Link
              href={`/consultantes/${consultante.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-tint-2 px-2.5 py-px text-xs font-bold text-soft-foreground hover:underline"
            >
              <UserRoundIcon className="size-3" aria-hidden="true" />
              {consultante.nombre}
            </Link>
          )}
        </p>
      </div>
      {!compacto && (
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
      )}
    </li>
  );
}
