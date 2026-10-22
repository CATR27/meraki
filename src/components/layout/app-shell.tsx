import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/dal";
import { ROL_LABEL } from "@/lib/format";
import { MobileNav } from "./mobile-nav";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

/** Estructura estática (sidebar + header); lo que depende de la sesión llega en streaming. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Logo className="mb-8 px-2" />
        <Suspense fallback={<NavSkeleton />}>
          <SidebarNavForUser />
        </Suspense>
        <p className="mt-auto px-3 text-xs text-muted-foreground">
          La información clínica es confidencial.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Suspense fallback={<Skeleton className="ml-auto size-9 rounded-full" />}>
            <HeaderForUser />
          </Suspense>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

async function SidebarNavForUser() {
  const user = await requireUser();
  return <SidebarNav role={user.role} />;
}

async function HeaderForUser() {
  const user = await requireUser();
  return (
    <>
      <MobileNav role={user.role} />
      <Logo className="lg:hidden [&_span:last-child]:text-xl [&_svg]:size-7" />
      <div className="ml-auto flex items-center gap-2">
        <UserMenu name={user.name} email={user.email} roleLabel={ROL_LABEL[user.role]} />
      </div>
    </>
  );
}

function NavSkeleton() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-10 rounded-xl" />
      ))}
    </div>
  );
}
