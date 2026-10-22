import { SearchIcon, SearchXIcon, UserPlusIcon, UsersRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsultantesLista } from "@/features/consultantes/components/consultantes-lista";
import { listarConsultantes } from "@/features/consultantes/queries";
import { FILTROS_ESTADO, type FiltroEstado } from "@/features/consultantes/schemas";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultantes" };

const FILTRO_LABEL: Record<FiltroEstado, string> = {
  activo: "En proceso",
  alta: "Alta",
  baja: "Baja",
  todos: "Todos",
};

export default async function ConsultantesPage({ searchParams }: PageProps<"/consultantes">) {
  const user = await requireRole("psicologo");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const estado = FILTROS_ESTADO.includes(sp.estado as FiltroEstado)
    ? (sp.estado as FiltroEstado)
    : "activo";
  const pagina = Math.max(1, Number.parseInt(String(sp.pagina ?? "1"), 10) || 1);

  const { consultantes, total, paginas } = await listarConsultantes({ q, estado, pagina });

  const href = (cambios: Record<string, string | number>) => {
    const params = new URLSearchParams({ ...(q && { q }), estado, ...cambios } as Record<
      string,
      string
    >);
    if (params.get("estado") === "activo") params.delete("estado");
    if (params.get("pagina") === "1") params.delete("pagina");
    const qs = params.toString();
    return `/consultantes${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Consultantes"
        description="Tus consultantes y su expediente psicológico."
        actions={
          <Button asChild size="lg">
            <Link href="/consultantes/nuevo">
              <UserPlusIcon /> Nuevo consultante
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
          {FILTROS_ESTADO.map((f) => (
            <Link
              key={f}
              href={href({ estado: f, pagina: 1 })}
              aria-current={f === estado ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                f === estado
                  ? "bg-lavanda-700 text-white"
                  : "bg-lavanda-100/70 text-lavanda-800 hover:bg-lavanda-200",
              )}
            >
              {FILTRO_LABEL[f]}
            </Link>
          ))}
        </nav>
        <Form action="/consultantes" role="search" className="w-full lg:max-w-sm">
          {estado !== "activo" && <input type="hidden" name="estado" value={estado} />}
          <label htmlFor="q" className="sr-only">
            Buscar consultantes
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
              defaultValue={q}
              placeholder="Buscar por nombre, teléfono o correo"
              className="pl-9"
            />
          </div>
        </Form>
      </div>

      {consultantes.length > 0 ? (
        <>
          <ConsultantesLista
            consultantes={consultantes}
            zona={user.zonaHoraria}
            hoy={hoyISO(user.zonaHoraria)}
          />
          <Pagination
            pagina={pagina}
            paginas={paginas}
            total={total}
            href={(p) => href({ pagina: p })}
          />
        </>
      ) : q ? (
        <EmptyState
          icon={SearchXIcon}
          title="Sin resultados"
          description={`No encontramos consultantes que coincidan con “${q}”.`}
          action={
            <Button variant="outline" asChild>
              <Link href={href({ q: "", pagina: 1 })}>Limpiar búsqueda</Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={UsersRoundIcon}
          title={
            estado === "activo"
              ? "Aún no tienes consultantes en proceso"
              : "No hay consultantes aquí"
          }
          description="Registra a tu primer consultante para abrir su expediente y agendar citas."
          action={
            <Button asChild>
              <Link href="/consultantes/nuevo">
                <UserPlusIcon /> Registrar consultante
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}
