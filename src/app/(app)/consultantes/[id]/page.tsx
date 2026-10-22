import { ClipboardListIcon, IdCardIcon, PhoneIcon, SirenIcon } from "lucide-react";
import type { Metadata } from "next";
import { InfoCard } from "@/components/shared/info-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { obtenerConsultante } from "@/features/consultantes/queries";
import { SEXO_LABEL } from "@/features/consultantes/schemas";
import { requireRole } from "@/lib/dal";
import { formatFecha, formatFechaISO } from "@/lib/dates";
import { registrarBitacora } from "@/lib/bitacora";

export const metadata: Metadata = { title: "Consultante" };

export default async function ConsultantePage({ params }: PageProps<"/consultantes/[id]">) {
  const { id } = await params;
  const [user, c] = await Promise.all([requireRole("psicologo"), obtenerConsultante(id)]);
  registrarBitacora(user.id, "ver", "consultante", c.id);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <InfoCard
        title="Identificación"
        icon={IdCardIcon}
        datos={[
          { label: "Nombre", value: `${c.nombre} ${c.apellidos}` },
          {
            label: "Fecha de nacimiento",
            value: c.fechaNacimiento && formatFechaISO(c.fechaNacimiento),
          },
          { label: "Sexo", value: c.sexo && SEXO_LABEL[c.sexo] },
          { label: "Estado civil", value: c.estadoCivil },
          { label: "Ocupación", value: c.ocupacion },
          { label: "Escolaridad", value: c.escolaridad },
        ]}
      />
      <InfoCard
        title="Contacto"
        icon={PhoneIcon}
        datos={[
          {
            label: "Teléfono",
            value: c.telefono && (
              <a
                href={`tel:${c.telefono}`}
                className="font-semibold text-lavanda-700 hover:underline"
              >
                {c.telefono}
              </a>
            ),
          },
          {
            label: "Correo",
            value: c.email && (
              <a
                href={`mailto:${c.email}`}
                className="font-semibold text-lavanda-700 hover:underline"
              >
                {c.email}
              </a>
            ),
          },
          { label: "Dirección", value: c.direccion },
        ]}
      />
      <InfoCard
        title="Contacto de emergencia"
        icon={SirenIcon}
        datos={[
          { label: "Nombre", value: c.contactoEmergenciaNombre },
          { label: "Parentesco", value: c.contactoEmergenciaParentesco },
          {
            label: "Teléfono",
            value: c.contactoEmergenciaTelefono && (
              <a
                href={`tel:${c.contactoEmergenciaTelefono}`}
                className="font-semibold text-lavanda-700 hover:underline"
              >
                {c.contactoEmergenciaTelefono}
              </a>
            ),
          },
        ]}
      />
      <InfoCard
        title="Administrativo"
        icon={ClipboardListIcon}
        datos={[
          { label: "Referido por", value: c.referidoPor },
          { label: "Registrado", value: formatFecha(c.createdAt, user.zonaHoraria) },
          {
            label: "Consentimiento informado",
            value: c.consentimientoInformado ? (
              <StatusBadge tono="success">
                Firmado
                {c.consentimientoFecha &&
                  ` el ${formatFechaISO(c.consentimientoFecha, "d MMM yyyy")}`}
              </StatusBadge>
            ) : (
              <StatusBadge tono="warning">Pendiente</StatusBadge>
            ),
          },
        ]}
      />
    </div>
  );
}
