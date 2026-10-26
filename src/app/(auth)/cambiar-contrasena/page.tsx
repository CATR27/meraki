import type { Metadata } from "next";
import { Suspense } from "react";
import { CambiarContrasenaForm } from "@/features/auth/components/cambiar-contrasena-form";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Cambiar contraseña" };

export default function CambiarContrasenaPage() {
  return (
    <section className="animate-mk-up w-[min(100%,420px)] rounded-[36px_36px_36px_12px] border border-white/16 bg-white/7 p-[clamp(18px,3dvh,30px)_clamp(22px,4vw,30px)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-[18px]">
      <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
        <Contenido />
      </Suspense>
    </section>
  );
}

async function Contenido() {
  const user = await requireUser({ allowPasswordChange: true });

  return (
    <>
      <h1 className="font-heading text-[28px] font-bold tracking-[-0.02em] text-white">
        {user.mustChangePassword ? "Crea tu contraseña" : "Cambiar contraseña"}
      </h1>
      <p className="mt-1.5 mb-6 text-[15px] text-lavanda-200">
        {user.mustChangePassword
          ? `Te damos la bienvenida, ${user.name.split(" ")[0]}. Por seguridad, reemplaza la contraseña temporal antes de continuar.`
          : "Elige una contraseña segura que no uses en otros sitios."}
      </p>
      <CambiarContrasenaForm temporal={user.mustChangePassword} tono="oscuro" />
    </>
  );
}
