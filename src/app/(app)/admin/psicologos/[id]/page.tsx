import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { actualizarPsicologo } from "@/features/psicologos/actions";
import { PsicologoForm } from "@/features/psicologos/components/psicologo-form";
import { obtenerPsicologo } from "@/features/psicologos/queries";

export const metadata: Metadata = { title: "Editar cuenta" };

export default async function EditarPsicologoPage({ params }: PageProps<"/admin/psicologos/[id]">) {
  const { id } = await params;
  const psicologo = await obtenerPsicologo(id);
  if (!psicologo) notFound();
  const { banned, ...defaults } = psicologo;

  return (
    <>
      <PageHeader
        title={psicologo.name}
        description={
          <span className="inline-flex items-center gap-2">
            Editar datos de la cuenta
            {banned && <StatusBadge tono="danger">Suspendida</StatusBadge>}
          </span>
        }
      />
      <PsicologoForm
        modo="editar"
        action={actualizarPsicologo.bind(null, psicologo.id)}
        defaults={defaults}
      />
    </>
  );
}
