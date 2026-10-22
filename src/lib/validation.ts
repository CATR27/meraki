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

/** Correo opcional de formulario. */
export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.email("Escribe un correo válido.").nullable())
  .nullish();
