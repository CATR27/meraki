import { KeyRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import { Ornamento } from "@/components/brand/ornamento";
import { CambiarContrasenaForm } from "@/features/auth/components/cambiar-contrasena-form";
import { PerfilForm } from "@/features/perfil/components/perfil-form";
import { TarjetaInstalar } from "@/features/pwa/components/tarjeta-instalar";
import { SelectorTema } from "@/features/perfil/components/selector-tema";
import { estadisticasDelPerfil, obtenerMiPerfil } from "@/features/perfil/queries";
import { iniciales } from "@/lib/format";

export const metadata: Metadata = { title: "Mi perfil" };

/** Antigüedad legible: "4 a", "7 m" o "Nuevo". */
function antiguedad(desde: Date) {
  const meses = Math.floor((Date.now() - desde.getTime()) / (30.44 * 24 * 3600_000));
  if (meses >= 12) return `${Math.floor(meses / 12)} a`;
  return meses >= 1 ? `${meses} m` : "Nuevo";
}

export default async function PerfilPage() {
  const { rol, perfil } = await obtenerMiPerfil();
  const { createdAt, ...datos } = perfil;
  const esPsicologo = rol === "psicologo";
  const stats = esPsicologo ? await estadisticasDelPerfil() : null;
  const subtitulo = [esPsicologo ? "Psicólogo/a" : "Administración", perfil.especialidad]
    .filter(Boolean)
    .join(" · ");

  const cifras = stats
    ? [
        { v: stats.enProceso, l: "En proceso" },
        { v: stats.sesiones, l: "Sesiones" },
        { v: antiguedad(createdAt), l: "En Meraki" },
      ]
    : [];

  return (
    <div className="grid items-start gap-6 @min-[900px]:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="grid gap-6 @min-[900px]:sticky @min-[900px]:top-0">
        <section className="animate-mk-up relative isolate grid justify-items-center gap-4 overflow-hidden rounded-3xl border bg-card px-6 py-8 text-center [animation-delay:60ms]">
          <Ornamento n="12_amanecer" anim="breathe" op={0.4} dur={10} className="-top-[70px] -right-[70px] -z-10 size-[220px]" />
          <div className="relative size-[104px]">
            <span
              aria-hidden="true"
              className="absolute -inset-2 rounded-[50%_50%_50%_16%] border-2 border-dashed border-lavanda-300"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-[50%_50%_50%_16%] bg-gradient-to-br from-[#c9aef0] to-[#7a45c6] font-heading text-4xl font-bold text-white">
              {iniciales(perfil.name)}
            </span>
          </div>
          <div className="grid gap-1">
            <h1 className="text-[22px] font-bold">{perfil.name}</h1>
            <p className="text-sm text-muted-foreground">{subtitulo}</p>
            {perfil.enfoqueTerapeutico && (
              <p className="text-sm text-muted-foreground">{perfil.enfoqueTerapeutico}</p>
            )}
          </div>
          {cifras.length > 0 && (
            <dl className="grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
              {cifras.map((c) => (
                <div key={c.l} className="grid gap-0.5">
                  <dd className="font-heading text-2xl font-bold text-ink">{c.v}</dd>
                  <dt className="text-xs text-muted-foreground">{c.l}</dt>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="animate-mk-up grid gap-1 rounded-3xl border bg-card px-6 py-5 [animation-delay:240ms]">
          <h2 className="mb-2 text-xl font-bold">Preferencias</h2>
          <SelectorTema />
          <TarjetaInstalar />
        </section>
      </aside>

      <div className="min-w-0">
        <div className="animate-mk-up mb-6">
          <h2 className="text-[34px] font-bold tracking-[-0.02em]">
            {esPsicologo ? "Mi perfil" : "Mi cuenta"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Tus datos profesionales y la forma en que trabajas en Meraki.
          </p>
        </div>

        <PerfilForm rol={rol} defaults={datos} />

        <section className="animate-mk-up grid max-w-2xl gap-4 rounded-3xl border bg-card px-6 py-6 @min-[640px]:px-7">
          <div>
            <h2 className="flex items-center gap-2.5 text-xl font-bold">
              <KeyRoundIcon className="size-5 text-lavanda-500" aria-hidden="true" />
              Seguridad
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Al cambiar tu contraseña cerraremos tus sesiones en otros dispositivos.
            </p>
          </div>
          <CambiarContrasenaForm temporal={false} />
        </section>
      </div>
    </div>
  );
}
