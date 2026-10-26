import { PlusIcon, SearchIcon, SearchXIcon, ShieldCheckIcon, UsersRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Ornamento } from "@/components/brand/ornamento";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PsicologosTabla } from "@/features/psicologos/components/psicologos-tabla";
import { listarPsicologos } from "@/features/psicologos/queries";

export const metadata: Metadata = { title: "Psicólogos" };

export default async function PsicologosPage({ searchParams }: PageProps<"/admin/psicologos">) {
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q : "";
  const psicologos = await listarPsicologos(busqueda);
  // Los conteos reflejan todo el equipo, no solo el resultado de la búsqueda.
  const todos = busqueda ? await listarPsicologos() : psicologos;
  const resumen = [
    { n: todos.filter((p) => !p.banned && !p.mustChangePassword).length, etiqueta: "Activas", color: "var(--success)" },
    { n: todos.filter((p) => !p.banned && p.mustChangePassword).length, etiqueta: "Pendiente de ingreso", color: "var(--warning)" },
    { n: todos.filter((p) => p.banned).length, etiqueta: "Suspendida", color: "var(--destructive)" },
  ];

  return (
    <>
      <div className="animate-mk-up relative isolate mb-6 flex flex-wrap items-end justify-between gap-4">
        <Ornamento n="17_arcos_de_paz" anim="breathe" op={0.9} dur={12} className="-top-[46px] right-[clamp(120px,22vw,320px)] -z-10 size-[150px]" />
        <div>
          <h1 className="text-[34px] font-bold tracking-[-0.02em]">Psicólogos</h1>
          <p className="mt-1 text-muted-foreground">Cuentas del equipo que acompaña desde Meraki.</p>
        </div>
        <Button asChild>
          <Link href="/admin/psicologos/nuevo">
            <PlusIcon /> Nueva cuenta
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5 @min-[1000px]:grid-cols-[repeat(3,minmax(0,1fr))_1.4fr]">
        {resumen.map((r, i) => (
          <div
            key={r.etiqueta}
            style={{ animationDelay: `${60 + i * 50}ms` }}
            className="animate-mk-up flex items-center gap-3.5 rounded-2xl border bg-card px-5 py-4"
          >
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 rounded-leaf"
              style={{ background: r.color }}
            />
            <span className="font-heading text-[28px] font-bold text-ink">{r.n}</span>
            <span className="text-[13px] text-muted-foreground">{r.etiqueta}</span>
          </div>
        ))}
        <div className="animate-mk-up flex items-center gap-3 rounded-2xl bg-tint-2 px-[18px] py-3.5 [animation-delay:200ms]">
          <ShieldCheckIcon className="size-[22px] shrink-0 text-deep" aria-hidden="true" />
          <span className="text-[13px] leading-snug font-semibold text-soft-foreground">
            La administración no tiene acceso a información clínica.
          </span>
        </div>
      </div>

      <Form action="/admin/psicologos" className="mb-6 max-w-md" role="search">
        <label htmlFor="q" className="sr-only">
          Buscar psicólogos
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
            defaultValue={busqueda}
            placeholder="Buscar por nombre, correo o cédula"
            className="h-[46px] rounded-full pl-11"
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
