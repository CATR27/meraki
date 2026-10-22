import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CambiarContrasenaForm } from "@/features/auth/components/cambiar-contrasena-form";
import { PerfilForm } from "@/features/perfil/components/perfil-form";
import { obtenerMiPerfil } from "@/features/perfil/queries";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const { rol, perfil } = await obtenerMiPerfil();

  return (
    <>
      <PageHeader
        title={rol === "psicologo" ? "Mi perfil" : "Mi cuenta"}
        description="Mantén tus datos al día."
      />
      <div className="grid gap-6">
        <Card>
          <CardContent>
            <PerfilForm rol={rol} defaults={perfil} />
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Seguridad</CardTitle>
            <CardDescription>
              Al cambiar tu contraseña cerraremos tus sesiones en otros dispositivos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CambiarContrasenaForm temporal={false} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
