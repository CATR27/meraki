import { put } from "@vercel/blob";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { grabacionesSesion, grabacionFragmentos } from "@/db/schema";
import { grabacionDisponible, validarCitaParaGrabar } from "@/features/grabacion/almacen";
import { extensionAudio, MAX_BYTES_FRAGMENTO, rutaFragmento, tipoBase } from "@/features/grabacion/formato";
import { getSession } from "@/lib/dal";

const error = (status: number, message: string) => Response.json({ message }, { status });

const entero = (valor: FormDataEntryValue | null, max: number) => {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
};

/**
 * Recibe un fragmento de audio (~3 min) de la sesión en curso y lo guarda en el Blob
 * privado. Reintentar el mismo índice reemplaza el fragmento, así no se duplica.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/grabaciones/[citaId]/fragmentos">) {
  // Solo desde la propia app (defensa extra a la cookie SameSite=Lax).
  const origen = request.headers.get("origin");
  if (origen && new URL(origen).host !== new URL(request.url).host) return error(403, "Origen no permitido.");

  const session = await getSession();
  if (!session || session.user.role !== "psicologo" || session.user.mustChangePassword) {
    return error(401, "Inicia sesión para grabar.");
  }
  if (!grabacionDisponible) return error(503, "La grabación no está configurada.");

  const { citaId } = await ctx.params;
  const apta = await validarCitaParaGrabar(session.user.id, citaId);
  if (!apta.ok) return error(409, apta.message);

  const [grabacion] = await db
    .select({ id: grabacionesSesion.id, estado: grabacionesSesion.estado })
    .from(grabacionesSesion)
    .where(
      and(eq(grabacionesSesion.citaId, citaId), eq(grabacionesSesion.psicologoId, session.user.id)),
    )
    .limit(1);
  if (grabacion?.estado !== "grabando") return error(409, "La grabación de esta sesión ya se cerró.");

  const form = await request.formData();
  const audio = form.get("audio");
  const indice = entero(form.get("indice"), 999);
  const inicioMs = entero(form.get("inicioMs"), 24 * 3_600_000);
  const duracionMs = entero(form.get("duracionMs"), 15 * 60_000);
  if (!(audio instanceof File) || indice == null || inicioMs == null || duracionMs == null) {
    return error(400, "Fragmento incompleto.");
  }
  if (audio.size === 0 || audio.size > MAX_BYTES_FRAGMENTO) return error(413, "Fragmento demasiado grande.");
  const mimeType = tipoBase(audio.type);
  if (!extensionAudio(mimeType)) return error(415, "Formato de audio no admitido.");

  const pathname = rutaFragmento(grabacion.id, indice, mimeType);
  await put(pathname, audio, {
    access: "private",
    contentType: mimeType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const valores = { pathname, mimeType, inicioMs, duracionMs, bytes: audio.size };
  await db
    .insert(grabacionFragmentos)
    .values({ grabacionId: grabacion.id, indice, ...valores })
    .onConflictDoUpdate({
      target: [grabacionFragmentos.grabacionId, grabacionFragmentos.indice],
      set: valores,
    });
  await db
    .update(grabacionesSesion)
    .set({ duracionMs: sql`max(${grabacionesSesion.duracionMs}, ${inicioMs + duracionMs})` })
    .where(eq(grabacionesSesion.id, grabacion.id));

  return Response.json({ ok: true });
}
