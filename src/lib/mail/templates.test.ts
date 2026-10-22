import { describe, expect, it } from "vitest";
import { correoBienvenida, esc } from "./templates";

describe("esc", () => {
  it("escapa HTML", () => {
    expect(esc(`<script>"x"&'y'</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;",
    );
  });
});

describe("correoBienvenida", () => {
  it("no permite inyectar HTML desde el nombre", () => {
    const correo = correoBienvenida({
      nombre: "<img src=x onerror=alert(1)>",
      email: "a@b.mx",
      contrasenaTemporal: "abc123XYZ",
      loginUrl: "http://localhost:3000/login",
    });
    expect(correo.html).not.toContain("<img src=x");
    expect(correo.text).toContain("abc123XYZ");
  });
});
