import { CalendarPlusIcon, CalendarX2Icon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ESTADO_CITA_LABEL, ESTADO_CITA_TONO, MODALIDAD_LABEL } from "@/features/citas/constantes";
import { type CitaConsultante, citasDeConsultante } from "@/features/citas/queries";
import { agendaHref } from "@/features/citas/urls";
import { aLocal } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";
import { mayuscula } from "@/lib/format";

export const metadata: Metadata = { title: "Citas del consultante" };

export default async function CitasConsultantePage({
  params,
}: PageProps<"/consultantes/[id]/citas">) {
  const { id } = await params;
  const [user, { total, proximas, historial }] = await Promise.all([
    requireRole("psicologo"),
    citasDeConsultante(id),
  ]);
  const zona = user.zonaHoraria;

  if (total === 0) {
    return (
      <EmptyState
        icon={CalendarX2Icon}
        title="Sin citas registradas"
        description="Agenda la primera sesión con este consultante."
        action={
          <Button asChild>
            <Link href={agendaHref({ nueva: true, consultante: id })}>
              <CalendarPlusIcon /> Agendar cita
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-8">
      <ListaCitas titulo="Próximas" items={proximas} zona={zona} />
      <ListaCitas titulo="Historial" items={historial} zona={zona} />
    </div>
  );
}

function ListaCitas({
  titulo,
  items,
  zona,
}: {
  titulo: string;
  items: CitaConsultante[];
  zona: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{titulo}</h2>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        {items.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <Link
              href={agendaHref({ vista: "dia", fecha: aLocal(c.inicio, zona).fecha, cita: c.id })}
              className="min-w-0 flex-1 font-semibold hover:text-lavanda-700"
            >
              {mayuscula(formatEnZona(c.inicio, "EEEE d 'de' MMMM yyyy · HH:mm", zona))}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {MODALIDAD_LABEL[c.modalidad]}
              </span>
            </Link>
            <StatusBadge tono={ESTADO_CITA_TONO[c.estado]}>
              {ESTADO_CITA_LABEL[c.estado]}
            </StatusBadge>
            {c.notaId && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/citas/${c.id}/sesion`}>
                  <FileTextIcon /> Nota
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
