import { ClipboardListIcon, HistoryIcon, ListTodoIcon } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
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
    <aside className="grid content-start gap-3.5">
      {ultima?.tareasAsignadas && (
        <section className="animate-mk-up relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#9466d9,#6534a8)] p-5 text-white [animation-delay:100ms]">
          <LogoMark className="animate-mk-float pointer-events-none absolute -right-5 -bottom-[30px] size-[120px] opacity-[0.12]" />
          <h2 className="relative flex items-center gap-2 font-sans text-[13px] font-extrabold tracking-normal text-white">
            <ListTodoIcon className="size-4" aria-hidden="true" />
            Tareas de la sesión anterior
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed whitespace-pre-line text-lavanda-100">
            {ultima.tareasAsignadas}
          </p>
        </section>
      )}

      <section className="animate-mk-up rounded-3xl border bg-card p-5 [animation-delay:180ms]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-sans text-sm font-extrabold tracking-normal">
            <ClipboardListIcon className="size-4 text-lavanda-500" aria-hidden="true" />
            Del expediente
          </h2>
          <Link
            href={`/consultantes/${consultante.id}/expediente`}
            className="text-xs font-extrabold text-deep hover:underline"
          >
            Ver completo
          </Link>
        </div>
        <dl className="grid gap-3">
          {DESTACADOS.map(([campo, label]) => (
            <div key={campo}>
              <dt className="text-[11px] font-extrabold tracking-[0.1em] text-muted-foreground uppercase">
                {label}
              </dt>
              <dd className="mt-[3px] line-clamp-4 text-[13px] leading-normal whitespace-pre-line">
                {expediente[campo] || <span className="text-muted-foreground">Sin registrar</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="animate-mk-up rounded-3xl border bg-card p-5 [animation-delay:260ms]">
        <h2 className="mb-3 flex items-center gap-2 font-sans text-sm font-extrabold tracking-normal">
          <HistoryIcon className="size-4 text-lavanda-500" aria-hidden="true" />
          Sesiones anteriores
        </h2>
        {anteriores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta es la primera sesión registrada.</p>
        ) : (
          <ol className="grid gap-2">
            {anteriores.map((n) => (
              <li key={n.id} className="rounded-[18px] bg-tint px-3.5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-extrabold">Sesión {n.numeroSesion}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatEnZona(n.fecha, "d MMM yyyy", zona)}
                  </span>
                  {n.estadoAnimo != null && (
                    <span className="rounded-full bg-tint-3 px-2 py-0.5 text-[11px] font-extrabold text-soft-foreground">
                      Ánimo {n.estadoAnimo}/10
                    </span>
                  )}
                  {n.nivelRiesgo !== "ninguno" && (
                    <StatusBadge tono={n.nivelRiesgo === "bajo" ? "neutral" : "danger"}>
                      Riesgo {RIESGO_LABEL[n.nivelRiesgo].toLowerCase()}
                    </StatusBadge>
                  )}
                </div>
                {n.plan && (
                  <p className="mt-1 line-clamp-3 text-xs leading-normal text-muted-foreground">
                    {n.plan}
                  </p>
                )}
                {n.citaId && (
                  <Link
                    href={`/citas/${n.citaId}/sesion`}
                    className="mt-1 inline-block text-xs font-extrabold text-deep hover:underline"
                  >
                    Ver nota
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}
