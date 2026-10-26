import { StatusBadge } from "@/components/shared/status-badge";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFecha } from "@/lib/dates";
import type { PsicologoListado } from "../queries";
import { PsicologoAcciones } from "./psicologo-acciones";

function Estado({ p }: { p: PsicologoListado }) {
  if (p.banned) return <StatusBadge tono="danger">Suspendida</StatusBadge>;
  if (p.mustChangePassword) return <StatusBadge tono="warning">Pendiente de ingreso</StatusBadge>;
  return <StatusBadge tono="success">Activa</StatusBadge>;
}

function Persona({ p }: { p: PsicologoListado }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <PersonAvatar nombre={p.name} className="size-[42px] text-sm" />
      <div className="min-w-0">
        <p className="truncate font-extrabold text-ink">{p.name}</p>
        <p className="truncate text-sm text-muted-foreground">{p.email}</p>
      </div>
    </div>
  );
}

export function PsicologosTabla({ psicologos }: { psicologos: PsicologoListado[] }) {
  return (
    <>
      {/* Escritorio */}
      <div className="animate-mk-up hidden overflow-hidden rounded-3xl border bg-card [animation-delay:240ms] @min-[900px]:block">
        <Table>
          <TableHeader className="bg-tint">
            <TableRow>
              <TableHead className="pl-5">Psicólogo/a</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="w-14 pr-5">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {psicologos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="py-3 pl-5">
                  <Persona p={p} />
                </TableCell>
                <TableCell className="font-mono text-sm">{p.cedulaProfesional ?? "—"}</TableCell>
                <TableCell className="text-sm">{p.especialidad ?? "—"}</TableCell>
                <TableCell>
                  <Estado p={p} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatFecha(p.createdAt)}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <PsicologoAcciones id={p.id} nombre={p.name} suspendido={Boolean(p.banned)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Móvil */}
      <ul className="grid gap-3 @min-[900px]:hidden">
        {psicologos.map((p) => (
          <li key={p.id} className="rounded-3xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <Persona p={p} />
              <PsicologoAcciones id={p.id} nombre={p.name} suspendido={Boolean(p.banned)} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Estado p={p} />
              {p.cedulaProfesional && <span>Cédula {p.cedulaProfesional}</span>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
