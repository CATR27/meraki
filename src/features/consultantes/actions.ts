"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { consultantes, ESTADOS_CONSULTANTE, expedientes } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { consultanteSchema } from "./schemas";

export async function crearConsultante(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const values = formValues(formData);
  const parsed = consultanteSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const id = crypto.randomUUID();

  // Consultante (siempre inicia "en proceso") y expediente vacío en una sola transacción.
  await db.batch([
    db.insert(consultantes).values({ ...parsed.data, estado: "activo", id, psicologoId: user.id }),
    db.insert(expedientes).values({ consultanteId: id }),
  ]);

  registrarBitacora(user.id, "crear", "consultante", id);
  revalidatePath("/consultantes");
  redirect(`/consultantes/${id}/expediente`);
}

export async function actualizarConsultante(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("psicologo");
  const values = formValues(formData);
  const parsed = consultanteSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const { estado, ...datos } = parsed.data;
  const actualizados = await db
    .update(consultantes)
    .set({ ...datos, ...(estado ? { estado } : {}) })
    .where(and(eq(consultantes.id, id), eq(consultantes.psicologoId, user.id)))
    .returning({ id: consultantes.id });
  if (actualizados.length === 0) return { ok: false, message: "El consultante no existe." };

  registrarBitacora(user.id, "editar", "consultante", id);
  revalidatePath("/consultantes");
  revalidatePath(`/consultantes/${id}`, "layout");
  redirect(`/consultantes/${id}`);
}

export async function cambiarEstadoConsultante(id: string, estado: string): Promise<ActionState> {
  const user = await requireRole("psicologo");
  if (!ESTADOS_CONSULTANTE.includes(estado as (typeof ESTADOS_CONSULTANTE)[number])) {
    return { ok: false, message: "Estado no válido." };
  }

  const actualizados = await db
    .update(consultantes)
    .set({ estado: estado as (typeof ESTADOS_CONSULTANTE)[number] })
    .where(and(eq(consultantes.id, id), eq(consultantes.psicologoId, user.id)))
    .returning({ id: consultantes.id });
  if (actualizados.length === 0) return { ok: false, message: "El consultante no existe." };

  registrarBitacora(user.id, "estado", "consultante", id);
  revalidatePath("/consultantes");
  revalidatePath(`/consultantes/${id}`, "layout");
  return { ok: true, message: "Estado actualizado." };
}
