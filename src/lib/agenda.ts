import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, addWeeks, format, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

/** Lógica pura de la agenda (sin BD): rangos, conversiones de zona y posiciones. */

export const VISTAS = ["dia", "semana", "mes"] as const;
export type Vista = (typeof VISTAS)[number];

/** Horario visible en las vistas de día y semana. */
export const HORA_INICIO = 7;
export const HORA_FIN = 21;
const MINUTOS_VISIBLES = (HORA_FIN - HORA_INICIO) * 60;

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export const esFechaISO = (v: unknown): v is string => typeof v === "string" && FECHA_ISO.test(v);
export const esHora = (v: unknown): v is string => typeof v === "string" && HORA.test(v);

function partes(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return { y, m: m - 1, d };
}

/** Medianoche de una fecha de calendario en la zona indicada. */
export function inicioDelDia(fechaISO: string, zona: string): TZDate {
  const { y, m, d } = partes(fechaISO);
  return new TZDate(y, m, d, zona);
}

/** Convierte fecha + hora locales del consultorio a un instante UTC. */
export function aUTC(fechaISO: string, hora: string, zona: string): Date {
  const { y, m, d } = partes(fechaISO);
  const [hh, mm] = hora.split(":").map(Number);
  return new Date(new TZDate(y, m, d, hh, mm, zona).getTime());
}

/** Fecha (YYYY-MM-DD) y hora (HH:mm) locales de un instante UTC. */
export function aLocal(instante: Date | number, zona: string) {
  const t = new TZDate(typeof instante === "number" ? instante : instante.getTime(), zona);
  return { fecha: format(t, "yyyy-MM-dd"), hora: format(t, "HH:mm") };
}

export function rangoVista(vista: Vista, fechaISO: string, zona: string) {
  const base = inicioDelDia(fechaISO, zona);
  const inicio =
    vista === "dia"
      ? base
      : vista === "semana"
        ? startOfWeek(base, { weekStartsOn: 1 })
        : startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
  const numDias = vista === "dia" ? 1 : vista === "semana" ? 7 : 42;
  const dias = Array.from({ length: numDias }, (_, i) => format(addDays(inicio, i), "yyyy-MM-dd"));
  return {
    inicio: new Date(inicio.getTime()),
    fin: new Date(addDays(inicio, numDias).getTime()),
    dias,
  };
}

/** Fecha a la que lleva "anterior"/"siguiente" según la vista. */
export function navegar(vista: Vista, fechaISO: string, direccion: 1 | -1): string {
  const base = inicioDelDia(fechaISO, "UTC");
  const destino =
    vista === "dia"
      ? addDays(base, direccion)
      : vista === "semana"
        ? addWeeks(base, direccion)
        : addMonths(base, direccion);
  return format(destino, "yyyy-MM-dd");
}

export function tituloVista(vista: Vista, fechaISO: string): string {
  const base = inicioDelDia(fechaISO, "UTC");
  if (vista === "dia") return format(base, "EEEE d 'de' MMMM yyyy", { locale: es });
  if (vista === "mes") return format(base, "MMMM yyyy", { locale: es });
  const lunes = startOfWeek(base, { weekStartsOn: 1 });
  const domingo = addDays(lunes, 6);
  const mismoMes = lunes.getMonth() === domingo.getMonth();
  return `${format(lunes, mismoMes ? "d" : "d MMM", { locale: es })} – ${format(domingo, "d MMM yyyy", { locale: es })}`;
}

/** Posición vertical (en %) de una cita dentro del horario visible. */
export function posicionEnDia(inicio: Date, fin: Date, zona: string) {
  const minutos = (d: Date) => {
    const { hora } = aLocal(d, zona);
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m - HORA_INICIO * 60;
  };
  const top = Math.min(Math.max(minutos(inicio), 0), MINUTOS_VISIBLES);
  const bottom = Math.min(Math.max(minutos(fin), top + 15), MINUTOS_VISIBLES);
  return {
    top: (top / MINUTOS_VISIBLES) * 100,
    height: Math.max(((bottom - top) / MINUTOS_VISIBLES) * 100, 2),
  };
}

export function seEmpalman(aInicio: Date, aFin: Date, bInicio: Date, bFin: Date): boolean {
  return aInicio < bFin && bInicio < aFin;
}
