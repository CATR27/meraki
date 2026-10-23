/** Genera un evento iCalendar (RFC 5545) para adjuntar a los correos de cita. */

type EventoICS = {
  uid: string;
  inicio: Date;
  fin: Date;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  /** Incrementar al reprogramar para que el calendario actualice el evento. */
  secuencia?: number;
  cancelado?: boolean;
};

const fechaUTC = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Pliega líneas a 75 octetos como exige el estándar. */
function plegar(linea: string): string {
  const bytes = new TextEncoder().encode(linea);
  if (bytes.length <= 75) return linea;
  const partes: string[] = [];
  let actual = "";
  let tam = 0;
  for (const ch of linea) {
    const n = new TextEncoder().encode(ch).length;
    if (tam + n > (partes.length === 0 ? 75 : 74)) {
      partes.push(actual);
      actual = "";
      tam = 0;
    }
    actual += ch;
    tam += n;
  }
  partes.push(actual);
  return partes.join("\r\n ");
}

export function generarICS(e: EventoICS): string {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Meraki//Agenda//ES",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.cancelado ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}@meraki`,
    `DTSTAMP:${fechaUTC(new Date())}`,
    `DTSTART:${fechaUTC(e.inicio)}`,
    `DTEND:${fechaUTC(e.fin)}`,
    `SEQUENCE:${e.secuencia ?? 0}`,
    `SUMMARY:${escapar(e.titulo)}`,
    e.descripcion && `DESCRIPTION:${escapar(e.descripcion)}`,
    e.ubicacion && `LOCATION:${escapar(e.ubicacion)}`,
    `STATUS:${e.cancelado ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de cita",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => Boolean(l));

  return lineas.map(plegar).join("\r\n") + "\r\n";
}
