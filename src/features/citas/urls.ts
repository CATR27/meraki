import type { Vista } from "@/lib/agenda";

type ParamsAgenda = {
  vista?: Vista;
  fecha?: string;
  nueva?: boolean;
  hora?: string;
  consultante?: string;
  cita?: string;
  editar?: string;
};

/** URL de la agenda; omite los valores por defecto para mantenerla corta. */
export function agendaHref(p: ParamsAgenda = {}): string {
  const params = new URLSearchParams();
  if (p.vista && p.vista !== "semana") params.set("vista", p.vista);
  if (p.fecha) params.set("fecha", p.fecha);
  if (p.nueva) params.set("nueva", "1");
  if (p.hora) params.set("hora", p.hora);
  if (p.consultante) params.set("consultante", p.consultante);
  if (p.cita) params.set("cita", p.cita);
  if (p.editar) params.set("editar", p.editar);
  const qs = params.toString();
  return `/agenda${qs ? `?${qs}` : ""}`;
}
