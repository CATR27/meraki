"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { citas, notasSesion, notasSesionVersiones, type ORIGENES_VERSION } from "@/db/schema";
import { cerrarGrabacion } from "@/features/grabacion/almacen";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { type NotaDatos, type NotaInput, notaSchema } from "./schemas";

type OrigenVersion = (typeof ORIGENES_VERSION)[number];

export type ResultadoGuardado =
  | { ok: true; guardadoEn: number }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

/** Crea o actualiza la nota de una cita. Una nota cerrada ya no se modifica. */
async function guardarNota(
  psicologoId: string,
  citaId: string,
  datos: NotaDatos,
  cerrar: boolean,
): Promise<ResultadoGuardado & { consultanteId?: string }> {
  const [cita] = await db
    .select({ consultanteId: citas.consultanteId, inicio: citas.inicio, estado: citas.estado })
    .from(citas)
    .where(and(eq(citas.id, citaId), eq(citas.psicologoId, psicologoId)))
    .limit(1);
  if (!cita) return { ok: false, message: "La cita no existe." };
  if (cita.estado === "cancelada") return { ok: false, message: "La cita está cancelada." };

  const [existente] = await db
    .select({ id: notasSesion.id, estado: notasSesion.estado })
    .from(notasSesion)
    .where(eq(notasSesion.citaId, citaId))
    .limit(1);
  if (existente?.estado === "cerrada") {
    return { ok: false, message: "Esta nota ya fue cerrada y no puede modificarse." };
  }

  const estado = cerrar ? ("cerrada" as const) : ("borrador" as const);
  let notaId = existente?.id;

  if (existente) {
    await db
      .update(notasSesion)
      .set({ ...datos, estado })
      .where(eq(notasSesion.id, existente.id));
  } else {
    const [{ total }] = await db
      .select({ total: count() })
      .from(notasSesion)
      .where(eq(notasSesion.consultanteId, cita.consultanteId));
    const [creada] = await db
      .insert(notasSesion)
      .values({
        ...datos,
        estado,
        psicologoId,
        consultanteId: cita.consultanteId,
        citaId,
        numeroSesion: total + 1,
        fecha: cita.inicio,
      })
      .returning({ id: notasSesion.id });
    notaId = creada.id;
    registrarBitacora(psicologoId, "crear", "nota", creada.id);
  }

  if (cerrar) {
    await db.update(citas).set({ estado: "completada" }).where(eq(citas.id, citaId));
    await cerrarGrabacion(citaId);
    registrarBitacora(psicologoId, "cerrar", "nota", notaId!);
  }

  return { ok: true, guardadoEn: Date.now(), consultanteId: cita.consultanteId };
}

/** Autoguardado del borrador mientras se atiende (sin revalidar para no interrumpir). */
export async function guardarBorradorNota(
  citaId: string,
  entrada: NotaInput,
): Promise<ResultadoGuardado> {
  const user = await requireRole("psicologo");
  const parsed = notaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la nota." };

  const r = await guardarNota(user.id, citaId, parsed.data, false);
  return r.ok ? { ok: true, guardadoEn: r.guardadoEn } : r;
}

export async function finalizarSesion(
  citaId: string,
  entrada: NotaInput,
): Promise<ResultadoGuardado> {
  const user = await requireRole("psicologo");
  const parsed = notaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la nota." };

  // Se permite finalizar sin S/O/A/P: la nota queda "por completar" y se edita después.
  const resultado = await guardarNota(user.id, citaId, parsed.data, true);
  if (!resultado.ok) return resultado;

  revalidatePath("/agenda");
  revalidatePath("/panel");
  revalidatePath(`/consultantes/${resultado.consultanteId}`, "layout");
  redirect(`/consultantes/${resultado.consultanteId}/sesiones`);
}

const CAMPOS_VERSIONADOS = [
  "subjetivo",
  "objetivo",
  "analisis",
  "plan",
  "estadoAnimo",
  "nivelRiesgo",
  "tareasAsignadas",
  "observaciones",
] as const;

/**
 * Reemplaza el contenido de una nota cerrada. La versión vigente pasa antes al
 * historial (notas_sesion_versiones) para conservar la trazabilidad del registro clínico.
 */
async function reemplazarNotaCerrada(
  psicologoId: string,
  citaId: string,
  datos: NotaDatos,
  origen: OrigenVersion,
): Promise<ResultadoGuardado & { consultanteId?: string }> {
  const [nota] = await db
    .select()
    .from(notasSesion)
    .where(and(eq(notasSesion.citaId, citaId), eq(notasSesion.psicologoId, psicologoId)))
    .limit(1);
  if (!nota) return { ok: false, message: "La nota no existe." };
  if (nota.estado !== "cerrada") return { ok: false, message: "La sesión aún no se finaliza." };

  const sinCambios = CAMPOS_VERSIONADOS.every((c) => (nota[c] ?? null) === (datos[c] ?? null));
  if (sinCambios) return { ok: true, guardadoEn: Date.now(), consultanteId: nota.consultanteId };

  try {
    await db.transaction(async (tx) => {
      await tx.insert(notasSesionVersiones).values({
        ...Object.fromEntries(CAMPOS_VERSIONADOS.map((c) => [c, nota[c]])),
        nivelRiesgo: nota.nivelRiesgo,
        notaId: nota.id,
        version: nota.version,
        origen,
        editadoPor: psicologoId,
      });
      await tx
        .update(notasSesion)
        .set({ ...datos, version: nota.version + 1, editadaAt: new Date() })
        .where(eq(notasSesion.id, nota.id));
    });
  } catch (error) {
    // El índice único (nota, versión) frena dos ediciones simultáneas de la misma versión.
    console.error("[nota]", error instanceof Error ? error.message : error);
    return { ok: false, message: "La nota cambió mientras la editabas. Recarga e inténtalo de nuevo." };
  }

  registrarBitacora(psicologoId, "editar", "nota", nota.id);
  return { ok: true, guardadoEn: Date.now(), consultanteId: nota.consultanteId };
}

/** Edición de una nota ya finalizada (queda registrada en el historial). */
export async function editarNotaCerrada(
  citaId: string,
  entrada: NotaInput,
): Promise<ResultadoGuardado> {
  const user = await requireRole("psicologo");
  const parsed = notaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la nota." };

  const r = await reemplazarNotaCerrada(user.id, citaId, parsed.data, "manual");
  if (!r.ok) return r;

  revalidatePath("/panel");
  revalidatePath(`/citas/${citaId}/sesion`);
  revalidatePath(`/consultantes/${r.consultanteId}`, "layout");
  return { ok: true, guardadoEn: r.guardadoEn };
}
