import { ShieldCheckIcon } from "lucide-react";
import { Ornamento } from "@/components/brand/ornamento";
import { LogoMark } from "@/components/brand/logo";
import { MarcaAgua } from "@/features/auth/components/marca-agua";
import { PildoraSaludo } from "@/features/auth/components/pildora-saludo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative grid min-h-dvh grid-rows-[auto_1fr_auto] gap-[clamp(8px,2dvh,24px)] overflow-x-hidden bg-[radial-gradient(120%_75%_at_50%_112%,#b08be6_0%,#7a45c6_20%,#4f2985_42%,#24133f_76%,#160f22_100%)] p-[clamp(14px,3dvh,40px)_clamp(20px,4vw,40px)] pt-[calc(var(--mk-top)+clamp(14px,3dvh,40px))] pb-[calc(env(safe-area-inset-bottom,0px)+clamp(14px,3dvh,40px))] text-white">
      <MarcaAgua />
      <Ornamento n="11_petales_en_brisa" anim="float" sobre="oscuro" op={0.8} dur={16} className="top-[calc(var(--mk-top)+12%)] -left-[2%] size-[clamp(180px,24vw,340px)]" />
      <Ornamento n="20_luna_y_hoja" anim="bob" sobre="oscuro" op={0.75} dur={12} delay={-3} className="top-[calc(var(--mk-top)+16%)] right-[2%] size-[clamp(140px,18vw,260px)]" />
      <Ornamento n="05_petalo_esquina" anim="breathe" sobre="oscuro" op={0.45} dur={12} flip origen="0% 100%" className="bottom-0 left-0 size-[clamp(200px,26vw,380px)]" />
      <Ornamento n="08_flor_esquina" anim="breathe" sobre="oscuro" op={0.5} dur={14} delay={-5} origen="100% 100%" className="right-0 bottom-0 size-[clamp(200px,24vw,360px)]" />

      <header className="animate-mk-up relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 [animation-duration:0.7s]">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-8 text-lavanda-300" />
          <span className="font-heading text-2xl font-bold tracking-[-0.02em]">Meraki</span>
        </div>
        <PildoraSaludo />
      </header>

      <main className="relative grid content-center justify-items-center py-2">{children}</main>

      <footer className="animate-mk-up relative flex [@media(max-height:900px)]:hidden flex-wrap items-end justify-between gap-x-8 gap-y-4 [animation-delay:300ms] [animation-duration:0.8s]">
        <figure className="max-w-[420px]">
          <blockquote className="font-heading text-lg leading-[1.35] font-semibold text-balance text-white">
            “Hacer algo con el alma, con creatividad y con amor.”
          </blockquote>
          <figcaption className="mt-1.5 text-[13px] text-lavanda-300">Meraki · palabra griega</figcaption>
        </figure>
        <p className="flex items-center gap-2 text-[13px] text-lavanda-200">
          <ShieldCheckIcon className="size-[15px] text-[#9ee0bf]" aria-hidden="true" />
          Tus datos y los de tus consultantes están protegidos.
        </p>
      </footer>
    </div>
  );
}
