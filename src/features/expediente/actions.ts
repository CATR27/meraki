"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { consultantes, expedientes } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { optionalText } from "@/lib/validation";
import { seccionPorId } from "./secciones";

export type GuardadoExpediente = { guardadoEn: number };

export async function guardarSeccionExpediente(
  consultanteId: string,
  seccionId: string,
  _prev: ActionState<GuardadoExpediente>,
  formData: FormData,
): Promise<ActionState<GuardadoExpediente>> {
  const user = await requireRole("psicologo");
  const seccion = seccionPorId(seccionId);
  if (!seccion) return { ok: false, message: "Sección no válida." };

  // Solo se aceptan los campos de esta sección.
  const schema = z.object(
    Object.fromEntries(seccion.campos.map(({ campo }) => [campo, optionalText(20_000)])),
  );
  const values = formValues(formData);
  const parsed = schema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  const propio = db
    .select({ id: consultantes.id })
    .from(consultantes)
    .where(and(eq(consultantes.id, consultanteId), eq(consultantes.psicologoId, user.id)));

  const actualizados = await db
    .update(expedientes)
    .set(parsed.data)
    .where(
      and(eq(expedientes.consultanteId, consultanteId), inArray(expedientes.consultanteId, propio)),
    )
    .returning({ id: expedientes.id });
  if (actualizados.length === 0) return { ok: false, message: "El expediente no existe." };

  registrarBitacora(user.id, "editar", "expediente", consultanteId);
  revalidatePath(`/consultantes/${consultanteId}/expediente`);
  // Se devuelven los valores para que el formulario no "parpadee" al reiniciarse.
  return { ok: true, message: "Sección guardada.", values, data: { guardadoEn: Date.now() } };
}
