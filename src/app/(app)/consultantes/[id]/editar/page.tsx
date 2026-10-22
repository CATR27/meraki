import type { Metadata } from "next";
import { actualizarConsultante } from "@/features/consultantes/actions";
import { ConsultanteForm } from "@/features/consultantes/components/consultante-form";
import { obtenerConsultante } from "@/features/consultantes/queries";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";

export const metadata: Metadata = { title: "Editar consultante" };

export default async function EditarConsultantePage({
  params,
}: PageProps<"/consultantes/[id]/editar">) {
  const { id } = await params;
  const [user, c] = await Promise.all([requireRole("psicologo"), obtenerConsultante(id)]);

  return (
    <ConsultanteForm
      modo="editar"
      action={actualizarConsultante.bind(null, c.id)}
      defaults={c}
      cancelarHref={`/consultantes/${c.id}`}
      hoy={hoyISO(user.zonaHoraria)}
    />
  );
}
