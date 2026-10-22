import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <section className="rounded-3xl border border-lavanda-100 bg-card p-8 shadow-xl shadow-lavanda-200/40 sm:p-10">
      <h1 className="text-3xl font-bold">Hola de nuevo</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Ingresa con la cuenta que te asignó la administración.
      </p>
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </section>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-11" />
    </div>
  );
}
