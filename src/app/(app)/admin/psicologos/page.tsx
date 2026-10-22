import { PlusIcon, SearchIcon, SearchXIcon, UsersRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PsicologosTabla } from "@/features/psicologos/components/psicologos-tabla";
import { listarPsicologos } from "@/features/psicologos/queries";

export const metadata: Metadata = { title: "Psicólogos" };

export default async function PsicologosPage({ searchParams }: PageProps<"/admin/psicologos">) {
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q : "";
  const psicologos = await listarPsicologos(busqueda);

  return (
    <>
      <PageHeader
        title="Psicólogos"
        description="Crea y administra las cuentas del equipo. La información clínica de cada cuenta es privada."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/psicologos/nuevo">
              <PlusIcon /> Nueva cuenta
            </Link>
          </Button>
        }
      />

      <Form action="/admin/psicologos" className="mb-6 max-w-md" role="search">
        <label htmlFor="q" className="sr-only">
          Buscar psicólogos
        </label>
        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={busqueda}
            placeholder="Buscar por nombre, correo o cédula"
            className="pl-9"
          />
        </div>
      </Form>

      {psicologos.length > 0 ? (
        <PsicologosTabla psicologos={psicologos} />
      ) : busqueda ? (
        <EmptyState
          icon={SearchXIcon}
          title="Sin resultados"
          description={`No encontramos cuentas que coincidan con “${busqueda}”.`}
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/psicologos">Limpiar búsqueda</Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={UsersRoundIcon}
          title="Aún no hay psicólogos"
          description="Crea la primera cuenta para que el equipo pueda empezar a trabajar en Meraki."
          action={
            <Button asChild>
              <Link href="/admin/psicologos/nuevo">
                <PlusIcon /> Crear cuenta
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}
