import { describe, expect, it } from "vitest";
import { cambiarContrasenaSchema, loginSchema } from "./schemas";

describe("loginSchema", () => {
  it("normaliza el correo", () => {
    const r = loginSchema.parse({ email: "  Ana@Ejemplo.COM ", password: "x" });
    expect(r.email).toBe("ana@ejemplo.com");
  });

  it("rechaza correos inválidos", () => {
    expect(loginSchema.safeParse({ email: "ana", password: "x" }).success).toBe(false);
  });
});

describe("cambiarContrasenaSchema", () => {
  const base = { actual: "Temporal123", nueva: "NuevaClave9", confirmar: "NuevaClave9" };

  it("acepta una contraseña válida", () => {
    expect(cambiarContrasenaSchema.safeParse(base).success).toBe(true);
  });

  it("exige letras y números", () => {
    const r = cambiarContrasenaSchema.safeParse({
      ...base,
      nueva: "solotexto",
      confirmar: "solotexto",
    });
    expect(r.success).toBe(false);
  });

  it("exige que la confirmación coincida", () => {
    const r = cambiarContrasenaSchema.safeParse({ ...base, confirmar: "Otra12345" });
    expect(r.error?.issues[0]?.path).toEqual(["confirmar"]);
  });

  it("no permite repetir la contraseña actual", () => {
    const r = cambiarContrasenaSchema.safeParse({
      ...base,
      nueva: "Temporal123",
      confirmar: "Temporal123",
    });
    expect(r.error?.issues[0]?.path).toEqual(["nueva"]);
  });
});
