"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Switch } from "@/components/ui/switch";

const suscribirse = () => () => {};

/** Preferencia de apariencia: se guarda en este navegador. */
export function SelectorTema() {
  const { resolvedTheme, setTheme } = useTheme();
  // Evita un desajuste de hidratación: el tema solo se conoce en el cliente.
  const montado = useSyncExternalStore(
    suscribirse,
    () => true,
    () => false,
  );
  const oscuro = montado && resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-4 border-t border-border py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-leaf bg-tint-2 text-deep">
        {oscuro ? <MoonIcon className="size-[17px]" /> : <SunIcon className="size-[17px]" />}
      </span>
      <label htmlFor="tema-oscuro" className="grid flex-1 cursor-pointer gap-0.5">
        <span className="text-sm font-extrabold text-foreground">Modo oscuro</span>
        <span className="text-[13px] text-muted-foreground">
          Descansa la vista; se recuerda en este dispositivo.
        </span>
      </label>
      <Switch
        id="tema-oscuro"
        checked={oscuro}
        disabled={!montado}
        onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
      />
    </div>
  );
}
