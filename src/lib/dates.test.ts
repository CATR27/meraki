import { describe, expect, it } from "vitest";
import { edad, formatEnZona, formatFechaISO, hoyISO } from "./dates";

describe("edad", () => {
  it("cuenta años cumplidos", () => {
    expect(edad("1990-05-20", "2026-05-20")).toBe(36);
    expect(edad("1990-05-20", "2026-05-19")).toBe(35);
    expect(edad("2000-02-29", "2026-03-01")).toBe(26);
  });
});

describe("zonas horarias", () => {
  it("convierte UTC a la hora local del consultorio", () => {
    const utc = new Date("2026-10-23T02:30:00Z");
    expect(formatEnZona(utc, "yyyy-MM-dd HH:mm", "America/Mexico_City")).toBe("2026-10-22 20:30");
    expect(hoyISO("America/Mexico_City", utc)).toBe("2026-10-22");
    expect(hoyISO("Europe/Madrid", utc)).toBe("2026-10-23");
  });
});

describe("formatFechaISO", () => {
  it("no se desplaza un día por la zona horaria", () => {
    expect(formatFechaISO("1990-01-01")).toBe("1 de enero 1990");
  });
});
