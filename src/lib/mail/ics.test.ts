import { describe, expect, it } from "vitest";
import { generarICS } from "./ics";

const base = {
  uid: "abc-123",
  inicio: new Date("2026-10-22T16:30:00Z"),
  fin: new Date("2026-10-22T17:20:00Z"),
  titulo: "Cita con Psic. Laura Méndez",
};

describe("generarICS", () => {
  it("genera un VEVENT válido con fechas en UTC y CRLF", () => {
    const ics = generarICS(base);
    expect(ics).toContain("DTSTART:20261022T163000Z");
    expect(ics).toContain("DTEND:20261022T172000Z");
    expect(ics).toContain("UID:abc-123@meraki");
    expect(ics.split("\r\n").at(-2)).toBe("END:VCALENDAR");
  });

  it("escapa comas, punto y coma y saltos de línea", () => {
    const ics = generarICS({ ...base, ubicacion: "Calle 1, Col. Centro; CDMX\nPiso 2" });
    expect(ics).toContain("LOCATION:Calle 1\\, Col. Centro\\; CDMX\\nPiso 2");
  });

  it("pliega líneas largas a 75 octetos", () => {
    const ics = generarICS({ ...base, descripcion: "á".repeat(100) });
    for (const linea of ics.split("\r\n")) {
      expect(new TextEncoder().encode(linea).length).toBeLessThanOrEqual(75);
    }
  });
});
