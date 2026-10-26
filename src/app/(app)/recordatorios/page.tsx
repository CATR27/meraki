import { BellRingIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { Ornamento } from "@/components/brand/ornamento";
import { opcionesConsultantes } from "@/features/consultantes/queries";
import { RecordatorioForm } from "@/features/recordatorios/components/recordatorio-form";
import { RecordatorioItem } from "@/features/recordatorios/components/recordatorio-item";
import { listarRecordatorios, type Recordatorio } from "@/features/recordatorios/queries";
import { requireRole } from "@/lib/dal";
import { cuandoRelativo, hoyISO, siguienteHora } from "@/lib/dates";

export const metadata: Metadata = { title: "Recordatorios" };

export default async function RecordatoriosPage() {
  const user = await requireRole("psicologo");
  const zona = user.zonaHoraria;
  const [{ vencidos, hoy, proximos, completados }, consultantes] = await Promise.all([
    listarRecordatorios(),
    opcionesConsultantes(),
  ]);
  const vacio = vencidos.length + hoy.length + proximos.length + completados.length === 0;

  return (
    <>
      <div className="grid gap-6 @min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-[22px]">
          <div className="animate-mk-up">
            <h1 className="text-[clamp(26px,7vw,34px)] font-bold tracking-[-0.02em]">Recordatorios</h1>
            <p className="mt-1 max-w-[560px] text-muted-foreground">
              Pendientes personales. Los de hoy y los vencidos aparecen en la campana y en tu
              inicio.
            </p>
            <a
              href="#nuevo"
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground @min-[900px]:hidden"
            >
              <PlusIcon className="size-4" aria-hidden="true" /> Nuevo recordatorio
            </a>
          </div>
          {vacio ? (
            <EmptyState
              icon={BellRingIcon}
              title="Sin recordatorios"
              description="Agrega pendientes como enviar informes, llamar a una escuela o revisar pruebas."
            />
          ) : (
            <>
              <Grupo titulo="Vencidos" color="var(--destructive)" items={vencidos} zona={zona} />
              <Grupo titulo="Hoy" color="var(--color-lavanda-500)" items={hoy} zona={zona} />
              <Grupo titulo="Próximos" color="var(--color-lavanda-300)" items={proximos} zona={zona} />
              {completados.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm font-bold text-muted-foreground hover:text-deep">
                    Completados recientes ({completados.length})
                  </summary>
                  <div className="mt-3">
                    <Grupo items={completados} zona={zona} />
                  </div>
                </details>
              )}
            </>
          )}
        </div>

        <aside id="nuevo" className="animate-mk-up relative h-fit scroll-mt-4 overflow-hidden rounded-3xl border bg-card p-4 @min-[640px]:p-[26px] [animation-delay:120ms] @min-[900px]:sticky @min-[900px]:top-0">
          <Ornamento n="06_luna_botanica" anim="bob" op={0.85} dur={10} className="-top-[30px] -right-[30px] size-[150px]" />
          <h2 className="relative mb-4 text-xl font-bold">Nuevo recordatorio</h2>
          <RecordatorioForm
            consultantes={consultantes}
            hoy={hoyISO(zona)}
            horaSugerida={siguienteHora(zona)}
          />
        </aside>
      </div>
    </>
  );
}

function Grupo({
  titulo,
  color,
  items,
  zona,
}: {
  titulo?: string;
  color?: string;
  items: Recordatorio[];
  zona: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="animate-mk-up">
      {titulo && (
        <h2 className="mb-2.5 flex items-center gap-2.5 text-[19px] font-bold">
          <span className="size-3 rounded-leaf" style={{ background: color }} aria-hidden="true" />
          {titulo}
          <span className="rounded-full bg-tint-2 px-2.5 py-px font-sans text-[13px] text-soft-foreground">
            {items.length}
          </span>
        </h2>
      )}
      <ul className="grid gap-2.5">
        {items.map((r) => (
          <RecordatorioItem
            key={r.id}
            id={r.id}
            titulo={r.titulo}
            descripcion={r.descripcion}
            completado={r.completado}
            cuando={cuandoRelativo(r.fechaHora, zona)}
            vencido={r.vencido}
            consultante={
              r.consultanteId && r.nombre ? { id: r.consultanteId, nombre: r.nombre } : null
            }
          />
        ))}
      </ul>
    </section>
  );
}
