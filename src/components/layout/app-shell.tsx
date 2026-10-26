import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Ornamento } from "@/components/brand/ornamento";
import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { cerrarSesion } from "@/features/auth/actions";
import { BannerInstalar } from "@/features/pwa/components/banner-instalar";
import { CampanaServidor } from "@/features/recordatorios/components/campana-servidor";
import { avisosPendientes } from "@/features/recordatorios/queries";
import { requireUser } from "@/lib/dal";
import { iniciales, ROL_LABEL } from "@/lib/format";
import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";
import { TopbarBuscador, TopbarTitulo } from "./topbar";
import { TuDia } from "./tu-dia";
import { UserMenu } from "./user-menu";

/** Estructura estática (sidebar + header); lo que depende de la sesión llega en streaming. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden h-dvh w-[100px] shrink-0 py-4 pl-4 min-[768px]:block min-[1200px]:w-[288px]">
        <div className="relative flex h-full flex-col gap-3.5 overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,var(--sb1)_0%,var(--sb2)_100%)] px-2.5 pt-[18px] pb-3 text-lavanda-100 shadow-[0_30px_60px_-32px_rgba(36,19,63,0.7)] min-[1200px]:gap-5 min-[1200px]:px-3.5 min-[1200px]:pt-[22px] min-[1200px]:pb-3.5">
          <span className="pointer-events-none absolute -top-[90px] -left-[70px] size-60 rounded-full bg-[radial-gradient(circle,rgba(201,174,240,0.35),transparent_70%)]" />
          <Ornamento n="16_loto_de_fondo" anim="breathe" sobre="oscuro" op={0.5} dur={12} origen="0% 100%" className="bottom-0 left-0 size-60" />
          <Ornamento n="02_petalo_flotante" anim="float" sobre="oscuro" op={0.6} dur={13} delay={-4} className="-top-5 -right-[30px] size-[150px]" />

          <div className="relative flex items-center justify-center gap-2.5 px-2 min-[1200px]:justify-start">
            <LogoMark className="size-[34px] flex-none text-lavanda-300" />
            <span className="hidden font-heading text-2xl font-bold tracking-[-0.02em] text-white min-[1200px]:block">
              Meraki
            </span>
          </div>

          <Suspense fallback={null}>
            <TuDiaParaPsicologo />
          </Suspense>

          <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:none]">
            <Suspense fallback={<NavSkeleton />}>
              <SidebarNavForUser />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <SidebarPie />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-[calc(56px+var(--mk-top))] shrink-0 items-center gap-3 px-[clamp(16px,3vw,32px)] pt-[var(--mk-top)] min-[768px]:h-[72px] min-[768px]:pt-0">
          <Suspense fallback={<Skeleton className="ml-auto size-9 rounded-full" />}>
            <HeaderForUser />
          </Suspense>
        </header>
        <main className="@container min-h-0 flex-1 scroll-pb-28 overflow-y-auto pb-[calc(92px+env(safe-area-inset-bottom))] has-[[data-sesion]]:pb-0 min-[768px]:pb-0">
          <div className="px-[clamp(16px,3vw,32px)] pt-1 pb-8">{children}</div>
        </main>
      </div>

      <Suspense fallback={null}>
        <BannerInstalar />
        <BottomNavForUser />
      </Suspense>
    </div>
  );
}

async function TuDiaParaPsicologo() {
  const user = await requireUser();
  if (user.role !== "psicologo") return null;
  return <TuDia />;
}

async function SidebarNavForUser() {
  const user = await requireUser();
  const insignias: Record<string, number> = {};
  if (user.role === "psicologo") {
    const avisos = await avisosPendientes();
    insignias["/recordatorios"] = avisos.recordatorios.length;
  }
  return <SidebarNav role={user.role} insignias={insignias} />;
}

async function SidebarPie() {
  const user = await requireUser();
  return (
    <div className="relative flex flex-none flex-col items-center gap-1 rounded-[20px] min-[1200px]:flex-row min-[1200px]:gap-2.5 min-[1200px]:border min-[1200px]:border-white/10 min-[1200px]:bg-white/6 min-[1200px]:p-2.5">
      <Link
        href="/perfil"
        title="Mi perfil"
        className="flex min-w-0 flex-1 items-center gap-2.5 text-white hover:text-white"
      >
        <span className="flex size-[38px] flex-none items-center justify-center rounded-avatar bg-gradient-to-br from-lavanda-300 to-lavanda-500 font-heading text-sm font-bold text-white">
          {iniciales(user.name)}
        </span>
        <span className="hidden min-w-0 leading-tight min-[1200px]:grid">
          <span className="truncate text-sm font-extrabold">{user.name}</span>
          <span className="text-xs text-lavanda-300">{ROL_LABEL[user.role]}</span>
        </span>
      </Link>
      <form action={cerrarSesion}>
        <button
          type="submit"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex size-[38px] flex-none items-center justify-center rounded-xl text-lavanda-200 transition-colors hover:bg-white/12 hover:text-white"
        >
          <LogOutIcon aria-hidden="true" className="size-[17px]" />
        </button>
      </form>
    </div>
  );
}

async function BottomNavForUser() {
  const user = await requireUser();
  const avisos = user.role === "psicologo" && (await avisosPendientes()).recordatorios.length > 0;
  return <BottomNav role={user.role} avisos={avisos} />;
}

async function HeaderForUser() {
  const user = await requireUser();
  return (
    <>
      <LogoMark className="size-[30px] flex-none text-lavanda-600 min-[768px]:hidden" />
      <TopbarTitulo role={user.role} />
      <TopbarBuscador />
      <div className="flex items-center gap-2.5">
        {user.role === "psicologo" && (
          <Suspense fallback={<Skeleton className="size-11 rounded-[14px]" />}>
            <CampanaServidor />
          </Suspense>
        )}
        <UserMenu name={user.name} email={user.email} roleLabel={ROL_LABEL[user.role]} />
      </div>
    </>
  );
}

function NavSkeleton() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-11 rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}
