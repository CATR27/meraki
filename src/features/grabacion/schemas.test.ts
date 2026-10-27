import { describe, expect, it } from "vitest";
import { construirTurnos, segmentosParaModelo, unirFragmentos } from "./schemas";

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

describe("construirTurnos", () => {
  // Whisper juntó pregunta y respuesta en el primer segmento.
  const base = unirFragmentos([
    {
      inicioMs: 0,
      segmentos: [
        { texto: "¿Cómo estás? Mejor, gracias.", inicioSeg: 0, finSeg: 3 },
        { texto: "Me alegra.", inicioSeg: 3, finSeg: 4 },
      ],
    },
  ]);

  it("separa un segmento con dos hablantes y conserva el tiempo de inicio", () => {
    const r = construirTurnos(base, [
      { indice: 0, hablante: "psicologo", texto: "¿Cómo estás?" },
      { indice: 0, hablante: "consultante", texto: "Mejor, gracias." },
      { indice: 1, hablante: "psicologo", texto: "Me alegra." },
    ]);
    expect(r.map((s) => [s.hablante, s.texto, s.inicioMs])).toEqual([
      ["psicologo", "¿Cómo estás?", 0],
      ["consultante", "Mejor, gracias.", 0],
      ["psicologo", "Me alegra.", 3000],
    ]);
  });

  it("si el modelo resumió, conserva el texto literal y solo toma los hablantes", () => {
    const r = construirTurnos(base, [{ indice: 0, hablante: "consultante", texto: "Está bien." }]);
    expect(r.map((s) => [s.hablante, s.texto])).toEqual([
      ["consultante", "¿Cómo estás? Mejor, gracias."],
      [null, "Me alegra."],
    ]);
  });

  it("ignora turnos con índices fuera de rango", () => {
    const r = construirTurnos(base, [{ indice: 9, hablante: "psicologo", texto: "x" }]);
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
