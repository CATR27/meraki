"use server";

import { and, eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { consultantes, recordatorios } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { aUTC } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { recordatorioSchema } from "./schemas";

function revalidar() {
  revalidatePath("/recordatorios");
  revalidatePath("/panel");
  // La campana vive en el layout de la app.
  revalidatePath("/", "layout");
}

export async function crearRecordatorio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const values = formValues(formData);
  const parsed = recordatorioSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const { titulo, descripcion, fecha, hora, consultanteId } = parsed.data;
  if (consultanteId) {
    const [propio] = await db
      .select({ id: consultantes.id })
      .from(consultantes)
      .where(and(eq(consultantes.id, consultanteId), eq(consultantes.psicologoId, user.id)))
      .limit(1);
    if (!propio) {
      return { ok: false, fieldErrors: { consultanteId: ["Consultante no válido."] }, values };
    }
  }

  await db.insert(recordatorios).values({
    psicologoId: user.id,
    titulo,
    descripcion,
    consultanteId,
    fechaHora: aUTC(fecha, hora, user.zonaHoraria),
  });

  revalidar();
  return { ok: true, message: "Recordatorio creado." };
}

export async function alternarRecordatorio(id: string): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const [r] = await db
    .update(recordatorios)
    .set({ completado: not(recordatorios.completado) })
    .where(and(eq(recordatorios.id, id), eq(recordatorios.psicologoId, user.id)))
    .returning({ completado: recordatorios.completado });
  if (!r) return { ok: false, message: "El recordatorio no existe." };

  revalidar();
  return { ok: true, message: r.completado ? "¡Hecho!" : "Marcado como pendiente." };
}

export async function eliminarRecordatorio(id: string): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const borrados = await db
    .delete(recordatorios)
    .where(and(eq(recordatorios.id, id), eq(recordatorios.psicologoId, user.id)))
    .returning({ id: recordatorios.id });
  if (borrados.length === 0) return { ok: false, message: "El recordatorio no existe." };

  revalidar();
  return { ok: true, message: "Recordatorio eliminado." };
}
