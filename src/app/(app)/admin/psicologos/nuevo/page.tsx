import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { crearPsicologo } from "@/features/psicologos/actions";
import { PsicologoForm } from "@/features/psicologos/components/psicologo-form";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Nueva cuenta" };

export default async function NuevoPsicologoPage() {
  await requireRole("admin");

  return (
    <>
      <PageHeader
        title="Nueva cuenta de psicólogo/a"
        description="Generaremos una contraseña temporal y la enviaremos por correo."
      />
      <PsicologoForm modo="crear" action={crearPsicologo} />
    </>
  );
}
