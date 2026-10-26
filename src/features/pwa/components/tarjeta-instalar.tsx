"use client";

import { CheckCircle2Icon, DownloadIcon, ShareIcon, SmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instalar, useInstalacion } from "../instalacion";

/** Tarjeta de Mi perfil: instala Meraki como app o explica cómo hacerlo si el navegador no lo permite. */
export function TarjetaInstalar() {
  const { puedeInstalar, ios, instalada } = useInstalacion();

  return (
    <div className="flex items-center gap-4 border-t border-border py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-leaf bg-tint-2 text-deep">
        {instalada ? <CheckCircle2Icon className="size-[17px]" /> : <SmartphoneIcon className="size-[17px]" />}
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-extrabold text-foreground">
          {instalada ? "Meraki ya está instalada" : "Instalar Meraki"}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {instalada ? (
            "La estás usando como app en este dispositivo."
          ) : ios ? (
            <>
              En Safari toca <ShareIcon className="mx-0.5 inline size-3.5 -translate-y-px" aria-label="Compartir" />{" "}
              y elige «Agregar a inicio».
            </>
          ) : puedeInstalar ? (
            "Ábrela a pantalla completa, desde tu inicio."
          ) : (
            "Desde el menú del navegador elige «Instalar app» o «Agregar a pantalla de inicio»."
          )}
        </span>
      </div>
      {!instalada && puedeInstalar && (
        <Button size="sm" onClick={() => void instalar()}>
          <DownloadIcon aria-hidden="true" /> Instalar
        </Button>
      )}
    </div>
  );
}
