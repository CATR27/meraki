import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expedientes } from "@/db/schema";
import { obtenerConsultante } from "@/features/consultantes/queries";

/** Expediente del consultante. La propiedad se valida vía obtenerConsultante (404 si no es suyo). */
export async function obtenerExpediente(consultanteId: string) {
  const consultante = await obtenerConsultante(consultanteId);

  const [expediente] = await db
    .select()
    .from(expedientes)
    .where(eq(expedientes.consultanteId, consultante.id))
    .limit(1);
  if (expediente) return expediente;

  // Por si un registro antiguo no tuviera expediente: se crea vacío.
  const [creado] = await db
    .insert(expedientes)
    .values({ consultanteId: consultante.id })
    .onConflictDoNothing()
    .returning();
  return (
    creado ??
    (await db.query.expedientes.findFirst({
      where: eq(expedientes.consultanteId, consultante.id),
    }))!
  );
}

export type Expediente = Awaited<ReturnType<typeof obtenerExpediente>>;
