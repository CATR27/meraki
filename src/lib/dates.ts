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

/** Fecha de hoy (YYYY-MM-DD) en la zona indicada. */
export function hoyISO(zona: string = DEFAULT_TZ, ahora: Date = new Date()) {
  return formatEnZona(ahora, "yyyy-MM-dd", zona);
}

/** Formatea una fecha de calendario (YYYY-MM-DD) sin conversiones de zona horaria. */
export function formatFechaISO(fecha: string, pattern = "d 'de' MMMM yyyy") {
  const [y, m, d] = fecha.split("-").map(Number);
  return format(new Date(y, m - 1, d), pattern, { locale: es });
}

/** Edad cumplida a partir de una fecha de nacimiento YYYY-MM-DD. */
export function edad(fechaNacimiento: string, hoy: string = hoyISO()): number {
  const [ny, nm, nd] = fechaNacimiento.split("-").map(Number);
  const [hy, hm, hd] = hoy.split("-").map(Number);
  let anios = hy - ny;
  if (hm < nm || (hm === nm && hd < nd)) anios--;
  return anios;
}
