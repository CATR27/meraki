import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearDbPrueba } from "@/test/db";
import { claveLimite, crearLimitador, ipCliente } from "./limitador";

describe("limitador (integración con SQLite)", () => {
  let limitador: ReturnType<typeof crearLimitador>;

  beforeEach(async () => {
    limitador = crearLimitador(await crearDbPrueba());
  });

  it("permite hasta el máximo y luego bloquea con retryAfter", async () => {
    const regla = { window: 60, max: 3 };
    for (let i = 0; i < 3; i++) {
      expect((await limitador.consume("k", regla)).allowed).toBe(true);
    }
    const bloqueado = await limitador.consume("k", regla);
    expect(bloqueado.allowed).toBe(false);
    expect(bloqueado.retryAfter).toBeGreaterThan(0);
  });

  it("es atómico con consumos simultáneos", async () => {
    const regla = { window: 60, max: 5 };
    const resultados = await Promise.all(
      Array.from({ length: 20 }, () => limitador.consume("k", regla)),
    );
    expect(resultados.filter((r) => r.allowed)).toHaveLength(5);
  });

  it("reinicia la ventana al vencer y al limpiar", async () => {
    const regla = { window: 1, max: 1 };
    await limitador.consume("k", regla);
    expect((await limitador.consume("k", regla)).allowed).toBe(false);

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 2000);
    expect((await limitador.consume("k", regla)).allowed).toBe(true);
    vi.useRealTimers();

    await limitador.limpiar("k");
    expect((await limitador.consume("k", regla)).allowed).toBe(true);
  });
});

describe("claveLimite / ipCliente", () => {
  it("no guarda el correo en claro y normaliza mayúsculas", () => {
    const a = claveLimite("login:correo", "Ana@Ejemplo.com");
    expect(a).not.toContain("ana");
    expect(a).toBe(claveLimite("login:correo", " ana@ejemplo.com "));
  });

  it("toma la primera IP de x-forwarded-for", () => {
    expect(ipCliente(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(ipCliente(new Headers())).toBe("desconocida");
  });
});
