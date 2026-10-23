import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { citas, consultantes, user } from "@/db/schema";
import { formatEnZona } from "@/lib/dates";
import { generarICS } from "@/lib/mail/ics";
import { enviarCorreo } from "@/lib/mail/send";
import { correoConfirmacionCita } from "@/lib/mail/templates";

/**
 * Envía la confirmación de una cita al consultante con el .ics adjunto.
 * Módulo server-only (no "use server"): no se expone como endpoint.
 * Devuelve si se envió; si el consultante no tiene correo, devuelve false.
 */
export async function enviarConfirmacionCita(
  citaId: string,
  opciones: { reprogramada?: boolean } = {},
) {
  const [fila] = await db
    .select({
      inicio: citas.inicio,
      fin: citas.fin,
      modalidad: citas.modalidad,
      enlace: citas.enlaceVideollamada,
      nombre: consultantes.nombre,
      email: consultantes.email,
      psicologo: user.name,
      telefono: user.telefono,
      direccion: user.direccionConsultorio,
      zona: user.zonaHoraria,
    })
    .from(citas)
    .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
    .innerJoin(user, eq(user.id, citas.psicologoId))
    .where(eq(citas.id, citaId))
    .limit(1);
  if (!fila?.email) return false;

  const fecha = formatEnZona(fila.inicio, "EEEE d 'de' MMMM yyyy", fila.zona);
  const hora = formatEnZona(fila.inicio, "HH:mm", fila.zona);
  const duracionMin = Math.round((fila.fin.getTime() - fila.inicio.getTime()) / 60_000);
  const ubicacion = fila.modalidad === "en_linea" ? (fila.enlace ?? "En línea") : fila.direccion;

  const resultado = await enviarCorreo({
    to: fila.email,
    ...correoConfirmacionCita({
      consultante: fila.nombre,
      psicologo: fila.psicologo,
      fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1),
      hora,
      duracionMin,
      modalidad: fila.modalidad,
      direccion: fila.direccion,
      enlace: fila.enlace,
      telefonoPsicologo: fila.telefono,
      reprogramada: opciones.reprogramada,
    }),
    attachments: [
      {
        filename: "cita-meraki.ics",
        contentType: "text/calendar; charset=utf-8; method=PUBLISH",
        content: generarICS({
          uid: citaId,
          inicio: fila.inicio,
          fin: fila.fin,
          titulo: `Cita con ${fila.psicologo}`,
          ubicacion: ubicacion ?? undefined,
          descripcion: fila.enlace ? `Enlace: ${fila.enlace}` : undefined,
          secuencia: opciones.reprogramada ? Math.floor(Date.now() / 1000) : 0,
        }),
      },
    ],
  });

  if (resultado.ok) {
    await db.update(citas).set({ confirmacionEnviadaAt: new Date() }).where(eq(citas.id, citaId));
  }
  return resultado.ok;
}
