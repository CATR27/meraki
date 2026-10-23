import { ClipboardListIcon, HistoryIcon, ListTodoIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatEnZona } from "@/lib/dates";
import { RIESGO_LABEL } from "../schemas";
import type { Sesion } from "../queries";

const DESTACADOS = [
  ["motivoConsulta", "Motivo de consulta"],
  ["impresionDiagnostica", "Impresión diagnóstica"],
  ["objetivosTerapeuticos", "Objetivos terapéuticos"],
  ["medicacionActual", "Medicación actual"],
] as const;

/** Columna de contexto en el modo sesión: expediente, tareas pendientes y notas previas. */
export function ResumenPanel({ sesion, zona }: { sesion: Sesion; zona: string }) {
  const { expediente, anteriores, consultante } = sesion;
  const ultima = anteriores[0];

  return (
    <div className="grid content-start gap-4">
      {ultima?.tareasAsignadas && (
        <section className="rounded-2xl border border-lavanda-200 bg-lavanda-50 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-lavanda-900">
            <ListTodoIcon className="size-4 text-lavanda-600" aria-hidden="true" />
            Tareas de la sesión anterior
          </h2>
          <p className="text-sm whitespace-pre-line text-lavanda-950">{ultima.tareasAsignadas}</p>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <ClipboardListIcon className="size-4 text-lavanda-600" aria-hidden="true" />
            Del expediente
          </h2>
          <Link
            href={`/consultantes/${consultante.id}/expediente`}
            className="text-xs font-semibold text-lavanda-700 hover:underline"
          >
            Ver completo
          </Link>
        </div>
        <dl className="grid gap-3 text-sm">
          {DESTACADOS.map(([campo, label]) => (
            <div key={campo}>
              <dt className="text-xs font-semibold text-muted-foreground uppercase">{label}</dt>
              <dd className="mt-0.5 line-clamp-4 whitespace-pre-line">
                {expediente[campo] || <span className="text-muted-foreground">Sin registrar</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <HistoryIcon className="size-4 text-lavanda-600" aria-hidden="true" />
          Sesiones anteriores
        </h2>
        {anteriores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta es la primera sesión registrada.</p>
        ) : (
          <ol className="grid gap-3">
            {anteriores.map((n) => (
              <li key={n.id} className="rounded-xl bg-muted/60 p-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-bold">Sesión {n.numeroSesion}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatEnZona(n.fecha, "d MMM yyyy", zona)}
                  </span>
                  {n.estadoAnimo != null && (
                    <StatusBadge tono="primary">Ánimo {n.estadoAnimo}/10</StatusBadge>
                  )}
                  {n.nivelRiesgo !== "ninguno" && (
                    <StatusBadge tono={n.nivelRiesgo === "bajo" ? "neutral" : "danger"}>
                      Riesgo {RIESGO_LABEL[n.nivelRiesgo].toLowerCase()}
                    </StatusBadge>
                  )}
                </div>
                {n.plan && <p className="line-clamp-3 text-muted-foreground">{n.plan}</p>}
                {n.citaId && (
                  <Link
                    href={`/citas/${n.citaId}/sesion`}
                    className="mt-1 inline-block text-xs font-semibold text-lavanda-700 hover:underline"
                  >
                    Ver nota
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
