import { beforeEach, describe, expect, it } from "vitest";
import { citas, consultantes, notasSesion } from "@/db/schema";
import { crearDbPrueba, sembrarPsicologo } from "@/test/db";
import { resumenAgenda } from "./resumen-agenda";

const AHORA = Date.UTC(2026, 9, 22, 18, 0);
const hora = (h: number) => new Date(Date.UTC(2026, 9, 22, h, 0));

describe("resumenAgenda (integración con SQLite)", () => {
  let db: Awaited<ReturnType<typeof crearDbPrueba>>;

  beforeEach(async () => {
    db = await crearDbPrueba();
    const psicologoId = await sembrarPsicologo(db);
    await db.insert(consultantes).values([
      { id: "c1", psicologoId, nombre: "Ana", apellidos: "Uno" },
      { id: "c2", psicologoId, nombre: "Beto", apellidos: "Dos" },
    ]);
    await db.insert(citas).values([
      // c1: una pasada, una cancelada futura y una vigente futura
      { id: "x1", psicologoId, consultanteId: "c1", inicio: hora(10), fin: hora(11) },
      {
        id: "x2",
        psicologoId,
        consultanteId: "c1",
        inicio: hora(19),
        fin: hora(20),
        estado: "cancelada",
      },
      { id: "x3", psicologoId, consultanteId: "c1", inicio: hora(21), fin: hora(22) },
      // c2: solo una futura confirmada
      {
        id: "x4",
        psicologoId,
        consultanteId: "c2",
        inicio: hora(20),
        fin: hora(21),
        estado: "confirmada",
      },
    ]);
    await db.insert(notasSesion).values({
      psicologoId,
      consultanteId: "c1",
      citaId: "x1",
      numeroSesion: 1,
      fecha: hora(10),
    });
  });

  it("calcula próxima cita vigente y última sesión por consultante", async () => {
    const filas = await db
      .select({ id: consultantes.id, ...resumenAgenda(AHORA) })
      .from(consultantes)
      .orderBy(consultantes.id);

    expect(filas).toEqual([
      { id: "c1", proximaCita: hora(21).getTime(), ultimaSesion: hora(10).getTime() },
      { id: "c2", proximaCita: hora(20).getTime(), ultimaSesion: null },
    ]);
  });
});
