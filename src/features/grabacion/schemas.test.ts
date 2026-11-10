import { describe, expect, it } from "vitest";
import { asignarHablantes, segmentosParaModelo, unirFragmentos } from "./schemas";

describe("unirFragmentos", () => {
  it("ordena los fragmentos, desplaza los tiempos y quita segmentos vacíos", () => {
    const unidos = unirFragmentos([
      { inicioMs: 180_000, segmentos: [{ texto: " Segundo ", inicioSeg: 1.5, finSeg: 3 }] },
      {
        inicioMs: 0,
        segmentos: [
          { texto: "Primero", inicioSeg: 0, finSeg: 2 },
          { texto: "   ", inicioSeg: 2, finSeg: 2.5 },
        ],
      },
    ]);
    expect(unidos).toEqual([
      { inicioMs: 0, finMs: 2000, texto: "Primero", hablante: null },
      { inicioMs: 181_500, finMs: 183_000, texto: "Segundo", hablante: null },
    ]);
  });
});

describe("asignarHablantes", () => {
  const base = unirFragmentos([
    {
      inicioMs: 0,
      segmentos: [
        { texto: "¿Cómo llegas hoy?", inicioSeg: 0, finSeg: 2 },
        { texto: "Bien, algo cansada.", inicioSeg: 2, finSeg: 4 },
        { texto: "Dormí poco esta semana.", inicioSeg: 4, finSeg: 6 },
        { texto: "¿Qué crees que influyó?", inicioSeg: 6, finSeg: 8 },
      ],
    },
  ]);

  it("cada segmento hereda el hablante del último cambio y conserva el texto literal", () => {
    const r = asignarHablantes(base, [
      { indice: 0, hablante: "psicologo" },
      { indice: 1, hablante: "consultante" },
      { indice: 3, hablante: "psicologo" },
    ]);
    expect(r.map((s) => [s.hablante, s.texto, s.inicioMs])).toEqual([
      ["psicologo", "¿Cómo llegas hoy?", 0],
      ["consultante", "Bien, algo cansada.", 2000],
      ["consultante", "Dormí poco esta semana.", 4000],
      ["psicologo", "¿Qué crees que influyó?", 6000],
    ]);
  });

  it("los segmentos antes del primer cambio quedan sin hablante", () => {
    const r = asignarHablantes(base, [{ indice: 2, hablante: "consultante" }]);
    expect(r.map((s) => s.hablante)).toEqual([null, null, "consultante", "consultante"]);
  });

  it("ignora cambios con índices fuera de rango", () => {
    const r = asignarHablantes(base, [{ indice: 9, hablante: "psicologo" }]);
    expect(r.every((s) => s.hablante === null)).toBe(true);
  });
});

describe("segmentosParaModelo", () => {
  it("numera cada segmento con su minuto", () => {
    const texto = segmentosParaModelo([
      { inicioMs: 65_000, finMs: 70_000, texto: "Hola", hablante: null },
    ]);
    expect(texto).toBe("[0] (01:05) Hola");
  });
});
