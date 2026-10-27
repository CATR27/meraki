import { describe, expect, it } from "vitest";
import { elegirFormato, extensionAudio, rutaFragmento } from "./formato";

describe("elegirFormato", () => {
  it("prefiere Opus y cae a MP4 en Safari", () => {
    expect(elegirFormato(() => true)).toBe("audio/webm;codecs=opus");
    expect(elegirFormato((t) => t === "audio/mp4")).toBe("audio/mp4");
    expect(elegirFormato(() => false)).toBeNull();
  });
});

describe("extensionAudio", () => {
  it("acepta solo audio conocido, ignorando los codecs", () => {
    expect(extensionAudio("audio/webm;codecs=opus")).toBe("webm");
    expect(extensionAudio("audio/mp4")).toBe("m4a");
    expect(extensionAudio("video/mp4")).toBeNull();
    expect(extensionAudio("text/html")).toBeNull();
  });
});

describe("rutaFragmento", () => {
  it("rellena el índice para conservar el orden", () => {
    expect(rutaFragmento("g1", 7, "audio/webm;codecs=opus")).toBe("grabaciones/g1/007.webm");
  });
});
