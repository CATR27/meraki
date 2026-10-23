import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-sidebar px-4 text-center">
      <Logo className="mb-8" />
      <p className="font-heading text-6xl font-bold text-lavanda-300">404</p>
      <h1 className="mt-2 text-2xl font-bold">Esta página no existe</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Revisa la dirección o vuelve al inicio para continuar.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Ir al inicio</Link>
      </Button>
    </main>
  );
}
