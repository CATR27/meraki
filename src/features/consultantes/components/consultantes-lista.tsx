import { CalendarClockIcon, ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { edad, formatEnZona, formatFecha } from "@/lib/dates";
import { iniciales, nombreCompleto } from "@/lib/format";
import type { ConsultanteListado } from "../queries";
import { EstadoConsultanteBadge } from "./estado-badge";

type Props = { consultantes: ConsultanteListado[]; zona: string; hoy: string };

function Persona({ c, hoy }: { c: ConsultanteListado; hoy: string }) {
  const nombre = nombreCompleto(c);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-10">
        <AvatarFallback className="bg-lavanda-100 font-heading font-bold text-lavanda-700">
          {iniciales(nombre)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-bold text-lavanda-950">{nombre}</p>
        <p className="truncate text-sm text-muted-foreground">
          {[c.fechaNacimiento && `${edad(c.fechaNacimiento, hoy)} años`, c.telefono]
            .filter(Boolean)
            .join(" · ") || "Sin datos de contacto"}
        </p>
      </div>
    </div>
  );
}

function SinConsentimiento() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold text-warning"
      title="Falta registrar el consentimiento informado"
    >
      <ShieldAlertIcon className="size-3.5" aria-hidden="true" /> Sin consentimiento
    </span>
  );
}

export function ConsultantesLista({ consultantes, zona, hoy }: Props) {
  const proxima = (d: Date | null) =>
    d ? (
      formatEnZona(d, "EEE d MMM · HH:mm", zona)
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <Table>
          <TableHeader className="bg-lavanda-50/70">
            <TableRow>
              <TableHead className="pl-5">Consultante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Próxima cita</TableHead>
              <TableHead>Última sesión</TableHead>
              <TableHead className="w-10 pr-5">
                <span className="sr-only">Abrir</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultantes.map((c) => (
              <TableRow key={c.id} className="group relative">
                <TableCell className="py-3 pl-5">
                  {/* El enlace cubre toda la fila (after:inset-0) */}
                  <Link
                    href={`/consultantes/${c.id}`}
                    className="outline-none after:absolute after:inset-0 focus-visible:after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                  >
                    <Persona c={c} hoy={hoy} />
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <EstadoConsultanteBadge estado={c.estado} />
                    {!c.consentimientoInformado && <SinConsentimiento />}
                  </div>
                </TableCell>
                <TableCell className="text-sm capitalize">{proxima(c.proximaCita)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.ultimaSesion ? formatFecha(c.ultimaSesion, zona) : "—"}
                </TableCell>
                <TableCell className="pr-5">
                  <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-lavanda-700" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {consultantes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/consultantes/${c.id}`}
              className="block rounded-2xl border bg-card p-4 transition-colors hover:border-lavanda-300"
            >
              <Persona c={c} hoy={hoy} />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <EstadoConsultanteBadge estado={c.estado} />
                {!c.consentimientoInformado && <SinConsentimiento />}
                {c.proximaCita && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground capitalize">
                    <CalendarClockIcon className="size-3.5" aria-hidden="true" />
                    {formatEnZona(c.proximaCita, "EEE d MMM · HH:mm", zona)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
