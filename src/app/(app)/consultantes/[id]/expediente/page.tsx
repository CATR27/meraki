import { LockKeyholeIcon } from "lucide-react";
import type { Metadata } from "next";
import { Ornamento } from "@/components/brand/ornamento";
import { ExpedienteSecciones } from "@/features/expediente/components/expediente-secciones";
import { obtenerExpediente } from "@/features/expediente/queries";
import { SECCIONES_EXPEDIENTE } from "@/features/expediente/secciones";
import { obtenerConsultante } from "@/features/consultantes/queries";
import { registrarBitacora } from "@/lib/bitacora";
import { requireRole } from "@/lib/dal";
import { formatEnZona } from "@/lib/dates";

export const metadata: Metadata = { title: "Expediente" };

const PETALO =
  "M24 6c4.8 5.2 7 10.6 7 16.2S28.8 33 24 38.4C19.2 33 17 27.8 17 22.2S19.2 11.2 24 6Z";
// Ángulos de los pétalos: uno por sección, de izquierda a derecha.
const ANGULOS = [-64, -32, 0, 32, 64];
// Orden de pintado: el central al fondo, los exteriores encima.
const ORDEN_PINTADO = [2, 1, 3, 0, 4];

export default async function ExpedientePage({
  params,
}: PageProps<"/consultantes/[id]/expediente">) {
  const { id } = await params;
  const [user, expediente, consultante] = await Promise.all([
    requireRole("psicologo"),
    obtenerExpediente(id),
    obtenerConsultante(id),
  ]);
  registrarBitacora(user.id, "ver", "expediente", id);

  const campos = SECCIONES_EXPEDIENTE.flatMap((s) => s.campos.map((c) => c.campo));
  const valores = Object.fromEntries(campos.map((c) => [c, expediente[c]]));
  const llenos = campos.filter((c) => expediente[c]?.trim()).length;
  const progreso = Math.round((llenos / campos.length) * 100);

  const estadoSecciones = SECCIONES_EXPEDIENTE.map((s) => {
    const n = s.campos.filter(({ campo }) => valores[campo]?.trim()).length;
    return n === s.campos.length ? "completa" : n > 0 ? "parcial" : "vacia";
  });
  const completas = estadoSecciones.filter((e) => e === "completa").length;
  const RELLENO = {
    completa: "var(--success)",
    parcial: "var(--color-lavanda-500)",
    vacia: "var(--tint-3)",
  } as const;

  return (
    <div className="grid items-start gap-5 @min-[860px]:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="animate-mk-up relative isolate order-first grid h-fit overflow-hidden gap-4 rounded-3xl border bg-card px-6 py-[26px] text-center [animation-delay:100ms] @min-[860px]:sticky @min-[860px]:top-0 @min-[860px]:order-none">
        <Ornamento n="04_loto_orbita" anim="spin" op={0.55} dur={15} className="top-2.5 left-1/2 -z-10 -ml-[110px] size-[220px]" />
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
            Historia clínica
          </p>
          <svg
            viewBox="-8 -4 64 48"
            aria-hidden="true"
            className="mx-auto mt-3 block h-[165px] w-[220px] overflow-visible"
          >
            {ORDEN_PINTADO.map((i) => (
              <path
                key={i}
                d={PETALO}
                fill={RELLENO[estadoSecciones[i] ?? "vacia"]}
                className="animate-mk-sway"
                style={
                  {
                    "--a": `${ANGULOS[i]}deg`,
                    transformOrigin: "24px 38.4px",
                    transform: `rotate(${ANGULOS[i]}deg)`,
                    animationDuration: "6s",
                    animationDelay: `${-i * 0.8}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>
          <p className="mt-1.5 font-heading text-[28px] font-bold text-ink">
            {completas} de {SECCIONES_EXPEDIENTE.length}
          </p>
          <p className="text-sm text-muted-foreground">
            secciones completas · {llenos} de {campos.length} campos
          </p>
          <div
            className="mx-auto mt-3 h-2 max-w-[220px] overflow-hidden rounded-full bg-tint-2"
            role="progressbar"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance de la historia clínica"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-lavanda-400 to-primary transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
        <p className="rounded-[18px] bg-tint px-3.5 py-3 text-left text-[13px] leading-normal">
          Cada pétalo es una sección. El loto florece a medida que conoces mejor la historia de{" "}
          {consultante.nombre}.
        </p>
        <p className="flex items-start gap-2 text-left text-xs text-muted-foreground">
          <LockKeyholeIcon className="mt-0.5 size-4 shrink-0 text-lavanda-500" aria-hidden="true" />
          <span>
            Información confidencial; cada consulta y modificación queda en la bitácora. Última
            actualización:{" "}
            {formatEnZona(expediente.updatedAt, "d MMM yyyy, HH:mm", user.zonaHoraria)}.
          </span>
        </p>
      </aside>

      <ExpedienteSecciones consultanteId={id} valores={valores} />
    </div>
  );
}
