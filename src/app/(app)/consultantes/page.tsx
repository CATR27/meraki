import { SearchIcon, SearchXIcon, UserPlusIcon, UsersRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Ornamento } from "@/components/brand/ornamento";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsultantesLista } from "@/features/consultantes/components/consultantes-lista";
import { conteosPorEstado, listarConsultantes, POR_PAGINA } from "@/features/consultantes/queries";
import { FILTROS_ESTADO, type FiltroEstado } from "@/features/consultantes/schemas";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultantes" };

const FILTRO_LABEL: Record<FiltroEstado, string> = {
  todos: "Todos",
  activo: "En proceso",
  alta: "Alta terapéutica",
  baja: "Baja",
};

// Orden del rediseño: primero "Todos".
const ORDEN_FILTROS: FiltroEstado[] = ["todos", "activo", "alta", "baja"];

export default async function ConsultantesPage({ searchParams }: PageProps<"/consultantes">) {
  const user = await requireRole("psicologo");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const estado = FILTROS_ESTADO.includes(sp.estado as FiltroEstado)
    ? (sp.estado as FiltroEstado)
    : "todos";
  const pagina = Math.max(1, Number.parseInt(String(sp.pagina ?? "1"), 10) || 1);

  const [{ consultantes, total, paginas }, conteos] = await Promise.all([
    listarConsultantes({ q, estado, pagina }),
    conteosPorEstado(),
  ]);

  const href = (cambios: Record<string, string | number>) => {
    const params = new URLSearchParams({ ...(q && { q }), estado, ...cambios } as Record<
      string,
      string
    >);
    if (params.get("estado") === "todos") params.delete("estado");
    if (params.get("pagina") === "1") params.delete("pagina");
    const qs = params.toString();
    return `/consultantes${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="animate-mk-up relative isolate mb-6 flex flex-wrap items-end justify-between gap-4">
        <Ornamento n="19_hojas_suaves" anim="sway" op={0.9} dur={12} className="-top-[46px] right-[clamp(120px,22vw,320px)] -z-10 size-[150px]" />
        <div>
          <h1 className="text-[34px] font-bold tracking-[-0.02em]">Consultantes</h1>
          <p className="mt-1 text-muted-foreground">
            Las personas que acompañas, cada una con su propio ritmo.
          </p>
        </div>
        <Button asChild>
          <Link href="/consultantes/nuevo">
            <UserPlusIcon /> Nuevo consultante
          </Link>
        </Button>
      </div>

      <div className="animate-mk-up mb-6 flex flex-wrap items-center gap-3 [animation-delay:60ms]">
        <Form action="/consultantes" role="search" className="w-[min(100%,360px)]">
          {estado !== "todos" && <input type="hidden" name="estado" value={estado} />}
          <label htmlFor="q" className="sr-only">
            Buscar consultantes
          </label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar por nombre o teléfono"
              className="h-[46px] rounded-full border-[1.5px] border-lavanda-300 pr-4 pl-11 shadow-[0_0_0_4px_var(--tint-2)]"
            />
          </div>
        </Form>
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {ORDEN_FILTROS.map((f) => (
            <Link
              key={f}
              href={href({ estado: f, pagina: 1 })}
              aria-current={f === estado ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors",
                f === estado
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-deep hover:bg-tint-2",
              )}
            >
              {FILTRO_LABEL[f]}
              <span
                className={cn(
                  "rounded-full px-2 text-xs",
                  f === estado ? "bg-white/20" : "bg-tint-2",
                )}
              >
                {conteos[f]}
              </span>
            </Link>
          ))}
        </nav>
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
            porPagina={POR_PAGINA}
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
            estado === "activo" || estado === "todos"
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
