import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Inicio" };

export default async function PanelPage() {
  const user = await requireRole("psicologo");

  return (
    <PageHeader
      title={`Hola, ${user.name.split(" ")[0]}`}
      description="Este es el resumen de tu día."
    />
  );
}
