import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-[560px]" aria-hidden="true" />}>
      <LoginForm />
    </Suspense>
  );
}
