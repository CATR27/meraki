import { describe, expect, it } from "vitest";
import { homeFor, safeRedirectPath } from "./routes";

describe("safeRedirectPath", () => {
  it("acepta rutas internas", () => {
    expect(safeRedirectPath("/consultantes/123?tab=sesiones")).toBe(
      "/consultantes/123?tab=sesiones",
    );
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "consultantes", "", null, 42])(
    "rechaza %s",
    (value) => {
      expect(safeRedirectPath(value)).toBeNull();
    },
  );
});

describe("homeFor", () => {
  it("envía a cada rol a su inicio", () => {
    expect(homeFor("admin")).toBe("/admin/psicologos");
    expect(homeFor("psicologo")).toBe("/panel");
  });
});
