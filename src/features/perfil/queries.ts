import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultantes, notasSesion, user } from "@/db/schema";
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
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, actual.id))
    .limit(1);
  return { rol: actual.role, perfil };
}

/** Cifras de la tarjeta lateral del perfil (solo para psicólogos). */
export async function estadisticasDelPerfil() {
  const actual = await requireUser();
  const [[activos], [sesiones]] = await Promise.all([
    db
      .select({ n: count() })
      .from(consultantes)
      .where(and(eq(consultantes.psicologoId, actual.id), eq(consultantes.estado, "activo"))),
    db.select({ n: count() }).from(notasSesion).where(eq(notasSesion.psicologoId, actual.id)),
  ]);
  return { enProceso: activos.n, sesiones: sesiones.n };
}
