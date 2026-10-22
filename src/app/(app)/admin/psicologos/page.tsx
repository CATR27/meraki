import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Psicólogos" };

export default async function PsicologosPage() {
  await requireRole("admin");

  return <PageHeader title="Psicólogos" description="Administra las cuentas del equipo." />;
}
