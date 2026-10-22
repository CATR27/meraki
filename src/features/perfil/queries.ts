import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireUser } from "@/lib/dal";

export async function obtenerMiPerfil() {
  const actual = await requireUser();
  const [perfil] = await db
    .select({
      name: user.name,
      email: user.email,
      cedulaProfesional: user.cedulaProfesional,
      especialidad: user.especialidad,
      enfoqueTerapeutico: user.enfoqueTerapeutico,
      universidad: user.universidad,
      telefono: user.telefono,
      direccionConsultorio: user.direccionConsultorio,
      duracionSesionMin: user.duracionSesionMin,
      costoSesion: user.costoSesion,
      zonaHoraria: user.zonaHoraria,
    })
    .from(user)
    .where(eq(user.id, actual.id))
    .limit(1);
  return { rol: actual.role, perfil };
}
