import { describe, expect, it } from "vitest";
import { consultanteSchema } from "./schemas";

const base = { nombre: "Sofía", apellidos: "Ramírez" };

describe("consultanteSchema", () => {
  it("solo exige nombre y apellidos; los vacíos se guardan como null", () => {
    const r = consultanteSchema.parse({ ...base, telefono: "  ", sexo: "", email: "" });
    expect(r).toMatchObject({
      telefono: null,
      sexo: null,
      email: null,
      consentimientoInformado: false,
    });
  });

  it("rechaza fechas de nacimiento futuras o inválidas", () => {
    expect(consultanteSchema.safeParse({ ...base, fechaNacimiento: "2999-01-01" }).success).toBe(
      false,
    );
    expect(consultanteSchema.safeParse({ ...base, fechaNacimiento: "2020-02-30" }).success).toBe(
      false,
    );
  });

  it("descarta la fecha de consentimiento si no hay consentimiento", () => {
    const r = consultanteSchema.parse({ ...base, consentimientoFecha: "2026-01-10" });
    expect(r.consentimientoFecha).toBeNull();
    const firmado = consultanteSchema.parse({
      ...base,
      consentimientoInformado: "on",
      consentimientoFecha: "2026-01-10",
    });
    expect(firmado).toMatchObject({
      consentimientoInformado: true,
      consentimientoFecha: "2026-01-10",
    });
  });

  it("valida el correo opcional", () => {
    expect(consultanteSchema.safeParse({ ...base, email: "sofia@" }).success).toBe(false);
  });
});
