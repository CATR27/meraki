import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CambiarContrasenaForm } from "@/features/auth/components/cambiar-contrasena-form";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Cambiar contraseña" };

export default function CambiarContrasenaPage() {
  return (
    <section className="rounded-3xl border border-lavanda-100 bg-card p-8 shadow-xl shadow-lavanda-200/40 sm:p-10">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Contenido />
      </Suspense>
    </section>
  );
}

async function Contenido() {
  const user = await requireUser({ allowPasswordChange: true });

  return (
    <>
      <h1 className="text-3xl font-bold">
        {user.mustChangePassword ? "Crea tu contraseña" : "Cambiar contraseña"}
      </h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        {user.mustChangePassword
          ? `Te damos la bienvenida, ${user.name.split(" ")[0]}. Por seguridad, reemplaza la contraseña temporal antes de continuar.`
          : "Elige una contraseña segura que no uses en otros sitios."}
      </p>
      <CambiarContrasenaForm temporal={user.mustChangePassword} />
    </>
  );
}
