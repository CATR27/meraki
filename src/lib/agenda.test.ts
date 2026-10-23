import { describe, expect, it } from "vitest";
import {
  aLocal,
  aUTC,
  navegar,
  posicionEnDia,
  rangoVista,
  seEmpalman,
  tituloVista,
} from "./agenda";

const CDMX = "America/Mexico_City";

describe("aUTC / aLocal", () => {
  it("convierte la hora local del consultorio a UTC y de regreso", () => {
    const utc = aUTC("2026-10-22", "10:30", CDMX);
    expect(utc.toISOString()).toBe("2026-10-22T16:30:00.000Z");
    expect(aLocal(utc, CDMX)).toEqual({ fecha: "2026-10-22", hora: "10:30" });
  });

  it("respeta el horario de verano de otras zonas", () => {
    // Madrid: verano UTC+2 (octubre), invierno UTC+1 (noviembre)
    expect(aUTC("2026-10-20", "10:00", "Europe/Madrid").toISOString()).toBe(
      "2026-10-20T08:00:00.000Z",
    );
    expect(aUTC("2026-11-20", "10:00", "Europe/Madrid").toISOString()).toBe(
      "2026-11-20T09:00:00.000Z",
    );
  });
});

describe("rangoVista", () => {
  it("la semana va de lunes a domingo", () => {
    const { dias, inicio, fin } = rangoVista("semana", "2026-10-22", CDMX);
    expect(dias[0]).toBe("2026-10-19");
    expect(dias[6]).toBe("2026-10-25");
    expect(inicio.toISOString()).toBe("2026-10-19T06:00:00.000Z");
    expect(fin.toISOString()).toBe("2026-10-26T06:00:00.000Z");
  });

  it("el mes muestra 6 semanas desde el lunes de la primera", () => {
    const { dias } = rangoVista("mes", "2026-10-22", CDMX);
    expect(dias).toHaveLength(42);
    expect(dias[0]).toBe("2026-09-28");
    expect(dias).toContain("2026-10-31");
  });

  it("el día cubre 24 horas locales", () => {
    const { dias, inicio, fin } = rangoVista("dia", "2026-10-22", CDMX);
    expect(dias).toEqual(["2026-10-22"]);
    expect(fin.getTime() - inicio.getTime()).toBe(24 * 3600_000);
  });
});

describe("navegar y títulos", () => {
  it("avanza según la vista", () => {
    expect(navegar("dia", "2026-10-31", 1)).toBe("2026-11-01");
    expect(navegar("semana", "2026-10-22", -1)).toBe("2026-10-15");
    expect(navegar("mes", "2026-01-31", 1)).toBe("2026-02-28");
  });

  it("genera títulos legibles", () => {
    expect(tituloVista("mes", "2026-10-22")).toBe("octubre 2026");
    expect(tituloVista("semana", "2026-10-22")).toBe("19 – 25 oct 2026");
    expect(tituloVista("semana", "2026-10-29")).toBe("26 oct – 1 nov 2026");
  });
});

describe("posicionEnDia", () => {
  it("ubica la cita dentro del horario visible", () => {
    const p = posicionEnDia(
      aUTC("2026-10-22", "07:00", CDMX),
      aUTC("2026-10-22", "08:00", CDMX),
      CDMX,
    );
    expect(p.top).toBe(0);
    expect(p.height).toBeCloseTo((60 / (14 * 60)) * 100);
  });
});

describe("seEmpalman", () => {
  const d = (h: string) => aUTC("2026-10-22", h, CDMX);
  it("detecta traslapes y permite citas contiguas", () => {
    expect(seEmpalman(d("10:00"), d("11:00"), d("10:30"), d("11:30"))).toBe(true);
    expect(seEmpalman(d("10:00"), d("11:00"), d("11:00"), d("12:00"))).toBe(false);
  });
});
