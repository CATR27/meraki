import { WifiOffIcon } from "lucide-react";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[radial-gradient(120%_75%_at_50%_112%,#b08be6_0%,#7a45c6_20%,#4f2985_42%,#24133f_76%,#160f22_100%)] px-6 pt-[var(--mk-top)] text-center text-white">
      <LogoMark className="size-16 text-lavanda-300" />
      <div className="grid max-w-sm gap-2">
        <h1 className="flex items-center justify-center gap-2 font-heading text-3xl font-bold text-white">
          <WifiOffIcon aria-hidden="true" className="size-6" /> Sin conexión
        </h1>
        <p className="text-[15px] leading-relaxed text-lavanda-200">
          Meraki necesita internet para proteger y mostrar la información de tus consultantes. Vuelve a conectarte e
          inténtalo de nuevo.
        </p>
      </div>
    </main>
  );
}
