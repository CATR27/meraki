import { z } from "zod";

/** Correo obligatorio: recorta y normaliza antes de validar. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Escribe un correo válido."));

/** Texto opcional de formulario: "" o solo espacios se guarda como null. */
export const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v))
    .nullish();

/** Entero opcional de formulario ("" → null). */
export const optionalInt = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(
      z
        .number({ error: "Escribe un número." })
        .int("Usa un número entero.")
        .min(min, `El mínimo es ${min}.`)
        .max(max, `El máximo es ${max}.`)
        .nullable(),
    )
    .nullish();

/** Entero obligatorio de formulario. */
export const requiredInt = (min: number, max: number) =>
  z.coerce
    .number({ error: "Escribe un número." })
    .int("Usa un número entero.")
    .min(min, `El mínimo es ${min}.`)
    .max(max, `El máximo es ${max}.`);

/** Quita comodines de LIKE para que la búsqueda sea literal. */
export function likePattern(q: string): string {
  return `%${q.replace(/[%_\\]/g, "").trim()}%`;
}

/** Correo opcional de formulario. */
export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.email("Escribe un correo válido.").nullable())
  .nullish();
