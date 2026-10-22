import { LockKeyholeIcon } from "lucide-react";
import type { Metadata } from "next";
import { ExpedienteSecciones } from "@/features/expediente/components/expediente-secciones";
import { obtenerExpediente } from "@/features/expediente/queries";
import { SECCIONES_EXPEDIENTE } from "@/features/expediente/secciones";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";

export const metadata: Metadata = { title: "Expediente" };

export default async function ExpedientePage({
  params,
}: PageProps<"/consultantes/[id]/expediente">) {
  const { id } = await params;
  const [user, expediente] = await Promise.all([requireRole("psicologo"), obtenerExpediente(id)]);
  registrarBitacora(user.id, "ver", "expediente", id);

  const campos = SECCIONES_EXPEDIENTE.flatMap((s) => s.campos.map((c) => c.campo));
  const valores = Object.fromEntries(campos.map((c) => [c, expediente[c]]));
  const llenos = campos.filter((c) => expediente[c]?.trim()).length;
  const progreso = Math.round((llenos / campos.length) * 100);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
      <ExpedienteSecciones consultanteId={id} valores={valores} />

      <aside className="order-first grid h-fit gap-4 xl:sticky xl:top-24 xl:order-none">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold text-muted-foreground">Historia clínica</p>
          <p className="mt-1 font-heading text-3xl font-bold text-lavanda-800">{progreso}%</p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-lavanda-100"
            role="progressbar"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance de la historia clínica"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-lavanda-400 to-lavanda-700 transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {llenos} de {campos.length} apartados con información.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Última actualización:{" "}
            {formatEnZona(expediente.updatedAt, "d MMM yyyy, HH:mm", user.zonaHoraria)}
          </p>
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-lavanda-50 p-4 text-xs text-lavanda-900">
          <LockKeyholeIcon className="mt-0.5 size-4 shrink-0 text-lavanda-600" aria-hidden="true" />
          Información confidencial. Cada consulta y modificación queda registrada en la bitácora.
        </p>
      </aside>
    </div>
  );
}
