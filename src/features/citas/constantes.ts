import type { Tono } from "@/components/shared/status-badge";
import type { ESTADOS_CITA, MODALIDADES } from "@/db/schema";

export type EstadoCita = (typeof ESTADOS_CITA)[number];
export type Modalidad = (typeof MODALIDADES)[number];

export const ESTADO_CITA_LABEL: Record<EstadoCita, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const ESTADO_CITA_TONO: Record<EstadoCita, Tono> = {
  programada: "primary",
  confirmada: "primary",
  completada: "success",
  cancelada: "neutral",
  no_asistio: "warning",
};

/** Estilo del bloque de cita en el calendario. */
export const ESTADO_CITA_BLOQUE: Record<EstadoCita, string> = {
  programada: "bg-tint-2 text-soft-foreground border-lavanda-300",
  confirmada: "bg-lavanda-600 text-white border-primary",
  completada: "bg-success-soft text-success border-success/30",
  cancelada: "bg-muted text-muted-foreground border-border line-through opacity-70",
  no_asistio: "bg-warning-soft text-warning border-warning/30",
};

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  presencial: "Presencial",
  en_linea: "En línea",
};

/** Estados que ocupan el horario (para validar traslapes). */
export const ESTADOS_ACTIVOS: EstadoCita[] = ["programada", "confirmada", "completada"];
