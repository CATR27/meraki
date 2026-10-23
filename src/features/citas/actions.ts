"use server";

import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import { citas, consultantes, ESTADOS_CITA } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { aUTC } from "@/lib/agenda";
import { registrarBitacora } from "@/lib/bitacora";
import { type CurrentUser, requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";
import { nombreCompleto } from "@/lib/format";
import { ESTADOS_ACTIVOS, type EstadoCita } from "./constantes";
import { enviarConfirmacionCita } from "./notificaciones";
import { type CitaInput, citaSchema } from "./schemas";

export type CitaGuardada = { id: string };

function revalidarCita(consultanteId: string) {
  revalidatePath("/agenda");
  revalidatePath("/panel");
  revalidatePath(`/consultantes/${consultanteId}`, "layout");
}

/** Valida propiedad del consultante y que el horario no se empalme con otra cita. */
async function validarCita(user: CurrentUser, datos: CitaInput, excluirId?: string) {
  const [consultante] = await db
    .select({ id: consultantes.id, email: consultantes.email })
    .from(consultantes)
    .where(and(eq(consultantes.id, datos.consultanteId), eq(consultantes.psicologoId, user.id)))
    .limit(1);
  if (!consultante) return { error: { consultanteId: ["Elige a un consultante válido."] } };

  const inicio = aUTC(datos.fecha, datos.hora, user.zonaHoraria);
  const fin = new Date(inicio.getTime() + datos.duracionMin * 60_000);

  const [choque] = await db
    .select({
      inicio: citas.inicio,
      nombre: consultantes.nombre,
      apellidos: consultantes.apellidos,
    })
    .from(citas)
    .innerJoin(consultantes, eq(consultantes.id, citas.consultanteId))
    .where(
      and(
        eq(citas.psicologoId, user.id),
        inArray(citas.estado, ESTADOS_ACTIVOS),
        lt(citas.inicio, fin),
        gt(citas.fin, inicio),
        excluirId ? ne(citas.id, excluirId) : undefined,
      ),
    )
    .limit(1);
  if (choque) {
    const hora = formatEnZona(choque.inicio, "HH:mm", user.zonaHoraria);
    return {
      error: {
        hora: [`Se empalma con la cita de ${nombreCompleto(choque)} a las ${hora}.`],
      },
    };
  }

  return { inicio, fin, email: consultante.email };
}

export async function crearCita(
  _prev: ActionState<CitaGuardada>,
  formData: FormData,
): Promise<ActionState<CitaGuardada>> {
  const user = await requireRole("psicologo");
  const values = formValues(formData);
  const parsed = citaSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const validacion = await validarCita(user, parsed.data);
  if ("error" in validacion) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: validacion.error,
      values,
    };
  }

  const { consultanteId, modalidad, enlaceVideollamada, notas, enviarConfirmacion } = parsed.data;
  const [cita] = await db
    .insert(citas)
    .values({
      psicologoId: user.id,
      consultanteId,
      inicio: validacion.inicio,
      fin: validacion.fin,
      modalidad,
      enlaceVideollamada,
      notas,
    })
    .returning({ id: citas.id });

  const enviar = enviarConfirmacion && Boolean(validacion.email);
  if (enviar) after(() => enviarConfirmacionCita(cita.id));

  registrarBitacora(user.id, "crear", "cita", cita.id);
  revalidarCita(consultanteId);
  return {
    ok: true,
    message: enviar ? "Cita agendada. Enviaremos la confirmación por correo." : "Cita agendada.",
    data: { id: cita.id },
  };
}

export async function actualizarCita(
  id: string,
  _prev: ActionState<CitaGuardada>,
  formData: FormData,
): Promise<ActionState<CitaGuardada>> {
  const user = await requireRole("psicologo");
  const values = formValues(formData);
  const parsed = citaSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const [actual] = await db
    .select({ inicio: citas.inicio, fin: citas.fin })
    .from(citas)
    .where(and(eq(citas.id, id), eq(citas.psicologoId, user.id)))
    .limit(1);
  if (!actual) return { ok: false, message: "La cita no existe." };

  const validacion = await validarCita(user, parsed.data, id);
  if ("error" in validacion) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: validacion.error,
      values,
    };
  }

  const { consultanteId, modalidad, enlaceVideollamada, notas, enviarConfirmacion } = parsed.data;
  const cambioHorario =
    actual.inicio.getTime() !== validacion.inicio.getTime() ||
    actual.fin.getTime() !== validacion.fin.getTime();

  await db
    .update(citas)
    .set({
      consultanteId,
      inicio: validacion.inicio,
      fin: validacion.fin,
      modalidad,
      enlaceVideollamada,
      notas,
      // Si cambia el horario, una cita "confirmada" vuelve a "programada".
      ...(cambioHorario ? { estado: "programada" as const, confirmacionEnviadaAt: null } : {}),
    })
    .where(and(eq(citas.id, id), eq(citas.psicologoId, user.id)));

  const enviar = enviarConfirmacion && Boolean(validacion.email);
  if (enviar) after(() => enviarConfirmacionCita(id, { reprogramada: cambioHorario }));

  registrarBitacora(user.id, "editar", "cita", id);
  revalidarCita(consultanteId);
  return {
    ok: true,
    message: enviar ? "Cita actualizada. Enviaremos el aviso por correo." : "Cita actualizada.",
    data: { id },
  };
}

export async function cambiarEstadoCita(id: string, estado: EstadoCita): Promise<ActionState> {
  const user = await requireRole("psicologo");
  if (!ESTADOS_CITA.includes(estado)) return { ok: false, message: "Estado no válido." };

  const [cita] = await db
    .update(citas)
    .set({ estado })
    .where(and(eq(citas.id, id), eq(citas.psicologoId, user.id)))
    .returning({ consultanteId: citas.consultanteId });
  if (!cita) return { ok: false, message: "La cita no existe." };

  registrarBitacora(user.id, "estado", "cita", id);
  revalidarCita(cita.consultanteId);
  return { ok: true, message: "Estado de la cita actualizado." };
}

export async function reenviarConfirmacion(id: string): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const [cita] = await db
    .select({ consultanteId: citas.consultanteId })
    .from(citas)
    .where(and(eq(citas.id, id), eq(citas.psicologoId, user.id)))
    .limit(1);
  if (!cita) return { ok: false, message: "La cita no existe." };

  const enviado = await enviarConfirmacionCita(id);
  revalidarCita(cita.consultanteId);
  return enviado
    ? { ok: true, message: "Confirmación enviada." }
    : {
        ok: false,
        message: "No se pudo enviar. Verifica el correo del consultante y la configuración SMTP.",
      };
}
