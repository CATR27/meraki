import { agendaHref } from "@/features/citas/urls";
import { aLocal } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { cuandoRelativo, formatEnZona } from "@/lib/dates";
import { nombreCompleto } from "@/lib/format";
import { avisosPendientes } from "../queries";
import { Campana } from "./campana";

export async function CampanaServidor() {
  const [user, avisos] = await Promise.all([requireRole("psicologo"), avisosPendientes()]);
  const zona = user.zonaHoraria;

  return (
    <Campana
      citas={avisos.citas.map((c) => ({
        id: c.id,
        titulo: nombreCompleto(c),
        cuando: cuandoRelativo(c.inicio, zona),
        href: agendaHref({ vista: "dia", fecha: aLocal(c.inicio, zona).fecha, cita: c.id }),
      }))}
      recordatorios={avisos.recordatorios.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        cuando: cuandoRelativo(r.fechaHora, zona),
        href: "/recordatorios",
        vencido: r.vencido,
      }))}
      notas={avisos.notas.map((n) => ({
        id: n.id,
        titulo: nombreCompleto(n),
        cuando: `Sesión del ${formatEnZona(n.fecha, "d MMM", zona)}`,
        href: `/citas/${n.citaId}/sesion?editar=1`,
      }))}
    />
  );
}
