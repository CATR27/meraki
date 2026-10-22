import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { crearConsultante } from "@/features/consultantes/actions";
import { ConsultanteForm } from "@/features/consultantes/components/consultante-form";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";

export const metadata: Metadata = { title: "Nuevo consultante" };

export default async function NuevoConsultantePage() {
  const user = await requireRole("psicologo");

  return (
    <>
      <PageHeader
        title="Nuevo consultante"
        description="Solo nombre y apellidos son obligatorios; puedes completar el resto después."
      />
      <ConsultanteForm
        modo="crear"
        action={crearConsultante}
        cancelarHref="/consultantes"
        hoy={hoyISO(user.zonaHoraria)}
      />
    </>
  );
}
