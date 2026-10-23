import { describe, expect, it } from "vitest";
import { iniciales, mayuscula, nombreCompleto } from "./format";

describe("iniciales", () => {
  it("usa la primera letra de los dos primeros nombres", () => {
    expect(iniciales("Ana Sofía López")).toBe("AS");
  });

  it("usa dos letras si solo hay un nombre", () => {
    expect(iniciales("  meraki ")).toBe("ME");
  });

  it("tolera cadenas vacías", () => {
    expect(iniciales("")).toBe("");
  });
});

describe("nombreCompleto", () => {
  it("une nombre y apellidos", () => {
    expect(nombreCompleto({ nombre: "Luis", apellidos: "Pérez Ruiz" })).toBe("Luis Pérez Ruiz");
  });
});

describe("mayuscula", () => {
  it("solo capitaliza la primera letra", () => {
    expect(mayuscula("jueves 22 de octubre")).toBe("Jueves 22 de octubre");
    expect(mayuscula("")).toBe("");
  });
});
