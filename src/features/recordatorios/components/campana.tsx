"use client";

import { BellIcon, BellRingIcon, CalendarClockIcon, ListTodoIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Aviso = { id: string; titulo: string; cuando: string; href: string; vencido?: boolean };

/** Campana del encabezado con citas de las próximas 24 h y recordatorios pendientes. */
export function Campana({ citas, recordatorios }: { citas: Aviso[]; recordatorios: Aviso[] }) {
  const [open, setOpen] = useState(false);
  const total = citas.length + recordatorios.length;
  const Icono = total > 0 ? BellRingIcon : BellIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative rounded-full"
          aria-label={total > 0 ? `Avisos: ${total} pendientes` : "Avisos"}
        >
          <Icono className="size-5 text-lavanda-700" />
          {total > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] leading-4.5 font-bold text-white">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="font-heading font-bold">Avisos</p>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
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
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
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
              className="block rounded-lg px-2 py-2 transition-colors hover:bg-lavanda-50"
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
