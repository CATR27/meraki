import { LogOutIcon, ShieldCheckIcon } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { cerrarSesion } from "@/features/auth/actions";
import { CampanaServidor } from "@/features/recordatorios/components/campana-servidor";
import { avisosPendientes } from "@/features/recordatorios/queries";
import { requireUser } from "@/lib/dal";
import { ROL_LABEL } from "@/lib/format";
import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";
import { TopbarBuscador, TopbarTitulo } from "./topbar";
import { UserMenu } from "./user-menu";

/** Estructura estática (sidebar + header); lo que depende de la sesión llega en streaming. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-[72px] shrink-0 items-center border-b border-sidebar-border px-6">
          <Logo />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <Suspense fallback={<NavSkeleton />}>
            <SidebarNavForUser />
          </Suspense>
        </div>
        <div className="grid shrink-0 gap-3 border-t border-sidebar-border p-4">
          <p className="flex items-center gap-2.5 rounded-[14px] bg-tint-2 px-3 py-2.5 text-xs leading-snug text-muted-foreground">
            <ShieldCheckIcon className="size-4 shrink-0 text-lavanda-500" aria-hidden="true" />
            Información clínica confidencial
          </p>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-border bg-card text-sm font-extrabold text-deep transition-colors hover:bg-tint-2"
            >
              <LogOutIcon className="size-4" aria-hidden="true" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
          <Suspense fallback={<Skeleton className="ml-auto size-9 rounded-full" />}>
            <HeaderForUser />
          </Suspense>
        </header>
        <main className="flex-1 px-4 pt-6 pb-28 sm:px-8 lg:pt-7 lg:pb-8">{children}</main>
      </div>

      <Suspense fallback={null}>
        <BottomNavForUser />
      </Suspense>
    </div>
  );
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

async function BottomNavForUser() {
  const user = await requireUser();
  return <BottomNav role={user.role} />;
}

async function HeaderForUser() {
  const user = await requireUser();
  return (
    <>
      <Logo className="lg:hidden [&_span:last-child]:text-xl [&_svg]:size-7" />
      <div className="hidden lg:block">
        <TopbarTitulo role={user.role} />
      </div>
      <TopbarBuscador />
      <div className="ml-auto flex items-center gap-2.5 xl:ml-0">
        {user.role === "psicologo" && (
          <Suspense fallback={<Skeleton className="size-11 rounded-[14px]" />}>
            <CampanaServidor />
          </Suspense>
        )}
        <span className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
        <UserMenu name={user.name} email={user.email} roleLabel={ROL_LABEL[user.role]} />
      </div>
    </>
  );
}

function NavSkeleton() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-11 rounded-[14px]" />
      ))}
    </div>
  );
}
