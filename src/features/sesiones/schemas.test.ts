import { describe, expect, it } from "vitest";
import { apartadosVacios, notaPorCompletar, notaSchema } from "./schemas";

const vacia = {
  subjetivo: "",
  objetivo: "",
  analisis: "",
  plan: "",
  tareasAsignadas: "",
  observaciones: "",
  estadoAnimo: "",
  nivelRiesgo: "ninguno",
};

describe("notaSchema", () => {
  it("normaliza vacíos a null y convierte el ánimo a número", () => {
    const r = notaSchema.parse({ ...vacia, estadoAnimo: "7" });
    expect(r).toMatchObject({ subjetivo: null, estadoAnimo: 7, nivelRiesgo: "ninguno" });
  });

  it("rechaza ánimo fuera de 1–10 y corrige riesgos desconocidos", () => {
    expect(notaSchema.safeParse({ ...vacia, estadoAnimo: "11" }).success).toBe(false);
    expect(notaSchema.parse({ ...vacia, nivelRiesgo: "extremo" }).nivelRiesgo).toBe("ninguno");
  });
});

describe("apartadosVacios", () => {
  it("lista los apartados SOAP sin texto (espacios cuentan como vacío)", () => {
    const faltan = apartadosVacios({ subjetivo: "Llega tranquila", objetivo: "  ", plan: null });
    expect(faltan.map((c) => c.campo)).toEqual(["objetivo", "analisis", "plan"]);
  });
});

describe("notaPorCompletar", () => {
  it("solo marca notas cerradas sin ningún apartado SOAP", () => {
    expect(notaPorCompletar({ ...notaSchema.parse(vacia), estado: "cerrada" })).toBe(true);
    expect(notaPorCompletar({ ...notaSchema.parse(vacia), estado: "borrador" })).toBe(false);
    expect(notaPorCompletar({ estado: "cerrada", plan: "Continuar TCC" })).toBe(false);
  });
});
