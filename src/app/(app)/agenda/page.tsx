import type { Metadata } from "next";
import { opcionesConsultantes } from "@/features/consultantes/queries";
import { AgendaToolbar } from "@/features/citas/components/agenda-toolbar";
import { type CitaDefaults, CitaDialog } from "@/features/citas/components/cita-dialog";
import { CitaDetalleDialog } from "@/features/citas/components/cita-detalle-dialog";
import { VistaLista } from "@/features/citas/components/vista-lista";
import { VistaMes } from "@/features/citas/components/vista-mes";
import { VistaSemana } from "@/features/citas/components/vista-semana";
import { listarCitasRango, obtenerCita } from "@/features/citas/queries";
import { ESTADO_CITA_BLOQUE, ESTADO_CITA_LABEL } from "@/features/citas/constantes";
import { agendaHref } from "@/features/citas/urls";
import { aLocal, esFechaISO, esHora, rangoVista, type Vista, VISTAS } from "@/lib/agenda";
import { requireRole } from "@/lib/dal";
import { hoyISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Agenda" };

const LEYENDA = ["programada", "confirmada", "completada", "no_asistio", "cancelada"] as const;

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const user = await requireRole("psicologo");
  const sp = await searchParams;
  const zona = user.zonaHoraria;
  const hoy = hoyISO(zona);

  const vista: Vista = VISTAS.includes(sp.vista as Vista) ? (sp.vista as Vista) : "semana";
  const fecha = esFechaISO(sp.fecha) ? sp.fecha : hoy;
  const nueva = sp.nueva === "1";
  const citaId = texto(sp.cita);
  const editarId = texto(sp.editar);

  const { inicio, fin, dias } = rangoVista(vista, fecha, zona);
  const [citas, consultantes, citaDetalle, citaEditar] = await Promise.all([
    listarCitasRango(inicio, fin),
    nueva || editarId ? opcionesConsultantes() : null,
    citaId ? obtenerCita(citaId) : null,
    editarId ? obtenerCita(editarId) : null,
  ]);

  const cerrarHref = agendaHref({ vista, fecha });

  // Valores iniciales del formulario de cita.
  let defaults: CitaDefaults | null = null;
  if (citaEditar) {
    const local = aLocal(citaEditar.inicio, zona);
    defaults = {
      consultanteId: citaEditar.consultanteId,
      fecha: local.fecha,
      hora: local.hora,
      duracionMin: Math.round((citaEditar.fin.getTime() - citaEditar.inicio.getTime()) / 60_000),
      modalidad: citaEditar.modalidad,
      enlaceVideollamada: citaEditar.enlaceVideollamada,
      notas: citaEditar.notas,
    };
  } else if (nueva) {
    // ?hora=YYYY-MM-DDTHH:mm desde un hueco del calendario
    const [f, h] = (texto(sp.hora) ?? "").split("T");
    defaults = {
      consultanteId: texto(sp.consultante),
      fecha: esFechaISO(f) ? f : fecha,
      hora: esHora(h) ? h : "09:00",
      duracionMin: user.duracionSesionMin,
    };
  }

  return (
    <>
      <AgendaToolbar vista={vista} fecha={fecha} hoy={hoy} />

      {vista === "mes" ? (
        <VistaMes fecha={fecha} dias={dias} citas={citas} zona={zona} hoy={hoy} />
      ) : (
        <>
          <div className="hidden md:block">
            <VistaSemana
              vista={vista}
              fecha={fecha}
              dias={dias}
              citas={citas}
              zona={zona}
              hoy={hoy}
              ahora={new Date()}
            />
          </div>
          <div className="md:hidden">
            <VistaLista
              vista={vista}
              fecha={fecha}
              dias={dias}
              citas={citas}
              zona={zona}
              hoy={hoy}
            />
          </div>
        </>
      )}

      <ul className="animate-mk-up mt-5 flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] text-muted-foreground [animation-delay:200ms]">
        {LEYENDA.map((e) => (
          <li key={e} className="inline-flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className={cn("size-3.5 rounded-leaf border", ESTADO_CITA_BLOQUE[e])}
            />
            {ESTADO_CITA_LABEL[e]}
          </li>
        ))}
      </ul>

      {defaults && consultantes && (
        <CitaDialog
          key={editarId ?? "nueva"}
          consultantes={consultantes}
          defaults={defaults}
          citaId={citaEditar?.id}
          cerrarHref={citaEditar ? agendaHref({ vista, fecha, cita: citaEditar.id }) : cerrarHref}
        />
      )}
      {citaDetalle && !editarId && (
        <CitaDetalleDialog
          cita={citaDetalle}
          zona={zona}
          cerrarHref={cerrarHref}
          editarHref={agendaHref({ vista, fecha, editar: citaDetalle.id })}
        />
      )}
    </>
  );
}
