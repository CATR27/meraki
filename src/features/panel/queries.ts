import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultantes, expedientes, notasSesion } from "@/db/schema";
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

  const [citasHoy, [{ activos }], [{ totalBorradores }], borradores, avisos] = await Promise.all([
    listarCitasRango(inicio, fin),
    db
      .select({ activos: count() })
      .from(consultantes)
      .where(and(eq(consultantes.psicologoId, user.id), eq(consultantes.estado, "activo"))),
    db
      .select({ totalBorradores: count() })
      .from(notasSesion)
      .where(and(eq(notasSesion.psicologoId, user.id), eq(notasSesion.estado, "borrador"))),
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
  const siguiente = vigentes.find((c) => c.fin > ahora && c.estado !== "completada") ?? null;
  const proxima = siguiente ? await detalleProxima(siguiente, ahora) : null;
  return {
    nombre: user.name.split(" ")[0],
    saludo: saludo(zona, ahora),
    hoy,
    zona,
    citasHoy,
    // La siguiente cita aún no terminada, para destacarla.
    siguienteId: vigentes.find((c) => c.fin > ahora && c.estado !== "completada")?.id ?? null,
    proxima,
    pendientesCitas: vigentes.filter((c) => c.fin > ahora).length,
    activos,
    borradores,
    totalBorradores,
    recordatorios: avisos.recordatorios,
  };
}

/** Progreso del día y siguiente cita para la tarjeta "Tu día" de la barra lateral. */
export async function tuDia() {
  const user = await requireRole("psicologo");
  const zona = user.zonaHoraria;
  const ahora = new Date();
  const { inicio, fin } = rangoVista("dia", hoyISO(zona, ahora), zona);
  const vigentes = (await listarCitasRango(inicio, fin)).filter((c) => c.estado !== "cancelada");
  const siguiente = vigentes.find((c) => c.fin > ahora && c.estado !== "completada");
  return {
    total: vigentes.length,
    completadas: vigentes.filter((c) => c.estado === "completada").length,
    siguiente: siguiente
      ? {
          nombre: `${siguiente.nombre} ${siguiente.apellidos.split(" ")[0] ?? ""}`.trim(),
          hora: formatEnZona(siguiente.inicio, "HH:mm", zona),
          minutos: Math.round((siguiente.inicio.getTime() - ahora.getTime()) / 60000),
          citaId: siguiente.id,
        }
      : null,
  };
}

const primeraLinea = (texto: string | null | undefined) =>
  texto
    ?.split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean) ?? null;

/** Lo que conviene retomar antes de la siguiente sesión: foco del proceso, tarea y ánimo reciente. */
async function detalleProxima(
  cita: Awaited<ReturnType<typeof listarCitasRango>>[number],
  ahora: Date,
) {
  const [[exp], notas] = await Promise.all([
    db
      .select({ objetivos: expedientes.objetivosTerapeuticos, motivo: expedientes.motivoConsulta })
      .from(expedientes)
      .where(eq(expedientes.consultanteId, cita.consultanteId))
      .limit(1),
    db
      .select({
        numeroSesion: notasSesion.numeroSesion,
        tareas: notasSesion.tareasAsignadas,
        animo: notasSesion.estadoAnimo,
      })
      .from(notasSesion)
      .where(eq(notasSesion.consultanteId, cita.consultanteId))
      .orderBy(desc(notasSesion.fecha))
      .limit(2),
  ]);
  const [ultima, previa] = notas;
  return {
    consultanteId: cita.consultanteId,
    citaId: cita.id,
    nombre: `${cita.nombre} ${cita.apellidos}`.trim(),
    modalidad: cita.modalidad,
    inicio: cita.inicio,
    minutos: Math.round((cita.inicio.getTime() - ahora.getTime()) / 60000),
    numeroSesion: (ultima?.numeroSesion ?? 0) + 1,
    foco: primeraLinea(exp?.objetivos) ?? primeraLinea(exp?.motivo),
    tarea: primeraLinea(ultima?.tareas),
    animo: ultima?.animo ?? null,
    animoPrevio: previa?.animo ?? null,
  };
}
