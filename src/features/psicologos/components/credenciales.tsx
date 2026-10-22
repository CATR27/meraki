import { MailCheckIcon, MailWarningIcon } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import type { Credenciales as CredencialesData } from "../actions";

/** Muestra una única vez la contraseña temporal generada. */
export function Credenciales({ data }: { data: CredencialesData }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-lavanda-200 bg-lavanda-50 p-4">
        <p className="text-sm font-semibold text-lavanda-900">Contraseña temporal</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-card px-3 py-1.5 font-mono text-lg font-bold tracking-wider text-lavanda-800 ring-1 ring-lavanda-200">
            {data.contrasenaTemporal}
          </code>
          <CopyButton value={data.contrasenaTemporal} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Solo se muestra esta vez. Se pedirá cambiarla en el primer ingreso.
        </p>
      </div>
      {data.correoEnviado ? (
        <p className="flex items-start gap-2 text-sm text-success">
          <MailCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Enviamos las credenciales por correo.
        </p>
      ) : (
        <p className="flex items-start gap-2 text-sm text-warning">
          <MailWarningIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          No pudimos enviar el correo (revisa la configuración SMTP). Comparte la contraseña de
          forma segura.
        </p>
      )}
    </div>
  );
}
