import { describe, expect, it } from "vitest";
import { emailSchema, optionalEmail, optionalText } from "./validation";

describe("emailSchema", () => {
  it("recorta y pasa a minúsculas antes de validar", () => {
    expect(emailSchema.parse("  Ana@Ejemplo.COM ")).toBe("ana@ejemplo.com");
  });
});

describe("optionalText", () => {
  it("convierte vacío en null", () => {
    expect(optionalText().parse("   ")).toBeNull();
  });

  it("respeta el máximo", () => {
    expect(optionalText(3).safeParse("abcd").success).toBe(false);
  });
});

describe("optionalEmail", () => {
  it("permite vacío", () => {
    expect(optionalEmail.parse("")).toBeNull();
  });

  it("valida si hay valor", () => {
    expect(optionalEmail.safeParse("no-es-correo").success).toBe(false);
    expect(optionalEmail.parse(" A@B.MX ")).toBe("a@b.mx");
  });
});
