"use client";

import { DownloadIcon, PlusSquareIcon, ShareIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { descartarBanner, instalar, useInstalacion } from "../instalacion";

/** Invitación descartable a instalar Meraki en el teléfono o la tablet (oculta en escritorio). */
export function BannerInstalar() {
  const { puedeInstalar, ios, instalada, descartado } = useInstalacion();
  const pathname = usePathname();

  if (instalada || descartado || (!puedeInstalar && !ios)) return null;
  if (/^\/citas\/[^/]+\/sesion/.test(pathname)) return null;

  return (
    <aside
      role="region"
      aria-label="Instalar Meraki"
      className="fixed inset-x-3 bottom-[calc(92px+max(0rem,env(safe-area-inset-bottom)))] z-50 flex items-start gap-3 rounded-3xl border border-border bg-card p-3.5 shadow-[0_20px_40px_-20px_rgba(36,19,63,0.45)] animate-mk-up min-[768px]:inset-x-auto min-[768px]:right-4 min-[768px]:bottom-4 min-[768px]:w-[380px] min-[1200px]:hidden"
    >
      <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-lavanda-600 to-lavanda-900 text-lavanda-100">
        <LogoMark className="size-6" />
      </span>
      <div className="grid min-w-0 flex-1 gap-2">
        <div className="grid gap-0.5 leading-snug">
          <p className="font-heading text-[15px] font-bold text-ink">Instala Meraki en tu dispositivo</p>
          {ios ? (
            <p className="text-[13px] text-muted-foreground">
              Toca <ShareIcon className="mx-0.5 inline size-3.5 -translate-y-px" aria-label="Compartir" /> y luego
              <span className="font-bold text-foreground"> «Agregar a inicio»</span>{" "}
              <PlusSquareIcon className="mx-0.5 inline size-3.5 -translate-y-px" aria-hidden="true" />.
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground">Ábrela como app, a pantalla completa y desde tu inicio.</p>
          )}
        </div>
        {puedeInstalar && (
          <Button size="sm" className="w-fit" onClick={() => void instalar()}>
            <DownloadIcon aria-hidden="true" /> Instalar
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={descartarBanner}
        aria-label="Descartar"
        className="flex size-8 flex-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-tint-2 hover:text-foreground"
      >
        <XIcon aria-hidden="true" className="size-4" />
      </button>
    </aside>
  );
}
