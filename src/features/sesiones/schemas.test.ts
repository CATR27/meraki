import { describe, expect, it } from "vitest";
import { notaSchema, validarCierre } from "./schemas";

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

describe("validarCierre", () => {
  it("exige contenido en al menos un apartado SOAP", () => {
    expect(validarCierre(notaSchema.parse(vacia))).not.toBeNull();
    expect(validarCierre(notaSchema.parse({ ...vacia, plan: "Continuar TCC" }))).toBeNull();
  });
});
