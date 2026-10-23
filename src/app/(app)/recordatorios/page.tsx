import { BellRingIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        title="Recordatorios"
        description="Pendientes personales. Los de hoy y los vencidos aparecen en la campana y en tu inicio."
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-8">
          {vacio ? (
            <EmptyState
              icon={BellRingIcon}
              title="Sin recordatorios"
              description="Agrega pendientes como enviar informes, llamar a una escuela o revisar pruebas."
            />
          ) : (
            <>
              <Grupo titulo="Vencidos" items={vencidos} zona={zona} />
              <Grupo titulo="Hoy" items={hoy} zona={zona} />
              <Grupo titulo="Próximos" items={proximos} zona={zona} />
              {completados.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm font-bold text-muted-foreground hover:text-lavanda-700">
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

        <aside className="order-first h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-24 lg:order-none">
          <h2 className="mb-4 text-lg font-bold">Nuevo recordatorio</h2>
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

function Grupo({ titulo, items, zona }: { titulo?: string; items: Recordatorio[]; zona: string }) {
  if (items.length === 0) return null;
  return (
    <section>
      {titulo && (
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          {titulo}
          <span className="rounded-full bg-lavanda-100 px-2 text-sm text-lavanda-800">
            {items.length}
          </span>
        </h2>
      )}
      <ul className="grid gap-2">
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
