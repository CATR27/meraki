import { ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <section className="animate-mk-up grid gap-6 rounded-3xl border border-border bg-card p-8 shadow-[0_30px_60px_-40px_rgba(58,31,97,0.45)] sm:p-10">
      <div className="grid gap-1.5 text-center">
        <h1 className="text-[32px] font-bold tracking-[-0.02em]">Qué gusto verte</h1>
        <p className="text-[15px] text-muted-foreground">Entra a tu espacio de consulta.</p>
      </div>
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
      <p className="flex items-center justify-center gap-2 border-t border-border pt-5 text-[13px] text-muted-foreground">
        <ShieldCheckIcon className="size-[15px] text-success" aria-hidden="true" />
        Tus datos y los de tus consultantes están protegidos.
      </p>
    </section>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-[52px]" />
    </div>
  );
}
