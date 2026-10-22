"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/schema";
import { type ActionState, formValues, zodErrorState } from "@/lib/action-state";
import { requireUser } from "@/lib/dal";
import { datosProfesionalesSchema } from "@/features/psicologos/schemas";

const soloNombreSchema = datosProfesionalesSchema.pick({ name: true });

export async function actualizarPerfil(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actual = await requireUser();
  const values = formValues(formData);

  // El correo y el rol solo los cambia la administración.
  const parsed =
    actual.role === "psicologo"
      ? datosProfesionalesSchema.safeParse(values)
      : soloNombreSchema.safeParse(values);
  if (!parsed.success) return zodErrorState(parsed.error, values);

  await db.update(user).set(parsed.data).where(eq(user.id, actual.id));

  revalidatePath("/", "layout");
  return { ok: true, message: "Tu perfil quedó actualizado." };
}
