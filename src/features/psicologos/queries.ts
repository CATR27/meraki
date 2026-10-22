import "server-only";
import { and, asc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { likePattern } from "@/lib/validation";

/** Solo datos administrativos: el admin nunca accede a información clínica. */
export async function listarPsicologos(q?: string) {
  await requireRole("admin");
  const busqueda = q?.trim() ? likePattern(q) : null;

  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      cedulaProfesional: user.cedulaProfesional,
      especialidad: user.especialidad,
      banned: user.banned,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(
      and(
        eq(user.role, "psicologo"),
        busqueda
          ? or(
              like(user.name, busqueda),
              like(user.email, busqueda),
              like(user.cedulaProfesional, busqueda),
            )
          : undefined,
      ),
    )
    .orderBy(asc(user.name));
}

export type PsicologoListado = Awaited<ReturnType<typeof listarPsicologos>>[number];

export async function obtenerPsicologo(id: string) {
  await requireRole("admin");
  const [psicologo] = await db
    .select({
      id: user.id,
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
      banned: user.banned,
    })
    .from(user)
    .where(and(eq(user.id, id), eq(user.role, "psicologo")))
    .limit(1);
  return psicologo ?? null;
}

export type PsicologoDetalle = NonNullable<Awaited<ReturnType<typeof obtenerPsicologo>>>;
