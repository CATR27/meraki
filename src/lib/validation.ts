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

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function esFechaValida(v: string) {
  if (!FECHA_ISO.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
}

/** Fecha opcional (YYYY-MM-DD de un <input type="date">); "" → null. */
export const optionalDate = (opts: { noFutura?: boolean } = {}) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || esFechaValida(v), "Escribe una fecha válida.")
    .refine(
      (v) => !opts.noFutura || v === null || v <= new Date().toISOString().slice(0, 10),
      "La fecha no puede ser futura.",
    )
    .nullish();

/** Checkbox de formulario: presente ("on") → true, ausente → false. */
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** Correo opcional de formulario. */
export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.email("Escribe un correo válido.").nullable())
  .nullish();
