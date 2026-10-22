import { describe, expect, it } from "vitest";
import { passwordSchema } from "@/features/auth/schemas";
import { generarContrasenaTemporal } from "./password";

describe("generarContrasenaTemporal", () => {
  it("cumple la política de contraseñas", () => {
    for (let i = 0; i < 200; i++) {
      const pwd = generarContrasenaTemporal();
      expect(pwd).toHaveLength(12);
      expect(passwordSchema.safeParse(pwd).success).toBe(true);
    }
  });

  it("no usa caracteres ambiguos", () => {
    const muestra = Array.from({ length: 100 }, () => generarContrasenaTemporal()).join("");
    expect(muestra).not.toMatch(/[0O1lI]/);
  });
});
