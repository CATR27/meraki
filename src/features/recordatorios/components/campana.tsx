"use client";

import {
  BellIcon,
  BellRingIcon,
  CalendarClockIcon,
  FilePenLineIcon,
  ListTodoIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Aviso = { id: string; titulo: string; cuando: string; href: string; vencido?: boolean };

/** Campana del encabezado: citas de las próximas 24 h, recordatorios y notas por completar. */
export function Campana({
  citas,
  recordatorios,
  notas,
}: {
  citas: Aviso[];
  recordatorios: Aviso[];
  notas: Aviso[];
}) {
  const [open, setOpen] = useState(false);
  const total = citas.length + recordatorios.length + notas.length;
  const Icono = total > 0 ? BellRingIcon : BellIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="relative size-11 rounded-[14px] border-border bg-card text-deep shadow-none hover:bg-tint-2"
          aria-label={total > 0 ? `Avisos: ${total} pendientes` : "Avisos"}
        >
          <Icono className="size-[19px]" />
          {total > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-4.5 items-center justify-center rounded-full border-2 border-card bg-destructive px-1 text-[0.65rem] leading-4 font-bold text-white">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={12} className="w-[min(20rem,calc(100vw-1.5rem))] p-0">
        <div className="border-b px-4 py-3">
          <p className="font-heading font-bold">Avisos</p>
        </div>
        <div className="max-h-[min(24rem,calc(100dvh-11rem))] overflow-y-auto p-2">
          {total === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Todo al día. No tienes pendientes.
            </p>
          )}
          <Grupo
            titulo="Citas en las próximas 24 h"
            icono={CalendarClockIcon}
            avisos={citas}
            cerrar={() => setOpen(false)}
          />
          <Grupo
            titulo="Recordatorios"
            icono={ListTodoIcon}
            avisos={recordatorios}
            cerrar={() => setOpen(false)}
          />
          <Grupo
            titulo="Notas por completar"
            icono={FilePenLineIcon}
            avisos={notas}
            cerrar={() => setOpen(false)}
          />
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full max-sm:h-11" asChild>
            <Link href="/recordatorios" onClick={() => setOpen(false)}>
              Ver todos los recordatorios
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Grupo({
  titulo,
  icono: Icono,
  avisos,
  cerrar,
}: {
  titulo: string;
  icono: typeof BellIcon;
  avisos: Aviso[];
  cerrar: () => void;
}) {
  if (avisos.length === 0) return null;
  return (
    <div className="mb-1">
      <p className="flex items-center gap-1.5 px-2 pt-2 pb-1 text-xs font-bold text-muted-foreground uppercase">
        <Icono className="size-3.5" aria-hidden="true" /> {titulo}
      </p>
      <ul>
        {avisos.map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              onClick={cerrar}
              className="block rounded-xl px-2 py-3 transition-colors hover:bg-tint"
            >
              <span className="block truncate text-sm font-semibold">{a.titulo}</span>
              <span
                className={
                  a.vencido ? "text-xs font-bold text-destructive" : "text-xs text-muted-foreground"
                }
              >
                {a.cuando}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
