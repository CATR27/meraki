import { tz } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const DEFAULT_TZ = "America/Mexico_City";

/** Formatea una fecha UTC en la zona horaria indicada, en español. */
export function formatEnZona(date: Date | number, pattern: string, zona: string = DEFAULT_TZ) {
  return format(date, pattern, { in: tz(zona), locale: es });
}

export const formatFecha = (date: Date | number, zona?: string) =>
  formatEnZona(date, "d 'de' MMM yyyy", zona);

export const formatFechaLarga = (date: Date | number, zona?: string) =>
  formatEnZona(date, "EEEE d 'de' MMMM yyyy", zona);

export const formatHora = (date: Date | number, zona?: string) => formatEnZona(date, "HH:mm", zona);
