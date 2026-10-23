import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultantes, notasSesion } from "@/db/schema";
import { listarCitasRango } from "@/features/citas/queries";
import { avisosPendientes } from "@/features/recordatorios/queries";
import { rangoVista } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { formatEnZona, hoyISO } from "@/lib/dates";

function saludo(zona: string, ahora: Date) {
  const h = Number(formatEnZona(ahora, "H", zona));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

/** Todo lo que muestra el panel "Hoy" en una sola llamada (consultas en paralelo). */
export async function resumenDelDia() {
  const user = await requireRole("psicologo");
  const zona = user.zonaHoraria;
  const ahora = new Date();
  const hoy = hoyISO(zona, ahora);
  const { inicio, fin } = rangoVista("dia", hoy, zona);

  const [citasHoy, [{ activos }], borradores, avisos] = await Promise.all([
    listarCitasRango(inicio, fin),
    db
      .select({ activos: count() })
      .from(consultantes)
      .where(and(eq(consultantes.psicologoId, user.id), eq(consultantes.estado, "activo"))),
    db
      .select({
        id: notasSesion.id,
        citaId: notasSesion.citaId,
        fecha: notasSesion.fecha,
        numeroSesion: notasSesion.numeroSesion,
        nombre: consultantes.nombre,
        apellidos: consultantes.apellidos,
      })
      .from(notasSesion)
      .innerJoin(consultantes, eq(consultantes.id, notasSesion.consultanteId))
      .where(and(eq(notasSesion.psicologoId, user.id), eq(notasSesion.estado, "borrador")))
      .orderBy(desc(notasSesion.fecha))
      .limit(5),
    avisosPendientes(),
  ]);

  const vigentes = citasHoy.filter((c) => c.estado !== "cancelada");
  return {
    nombre: user.name.split(" ")[0],
    saludo: saludo(zona, ahora),
    hoy,
    zona,
    citasHoy,
    // La siguiente cita aún no terminada, para destacarla.
    siguienteId: vigentes.find((c) => c.fin > ahora && c.estado !== "completada")?.id ?? null,
    pendientesCitas: vigentes.filter((c) => c.fin > ahora).length,
    activos,
    borradores,
    recordatorios: avisos.recordatorios,
  };
}
