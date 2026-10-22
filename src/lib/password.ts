import { randomInt } from "node:crypto";

// Sin caracteres ambiguos (0/O, 1/l/I) para que se pueda dictar o copiar sin errores.
const LETRAS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITOS = "23456789";
const TODOS = LETRAS + DIGITOS;

/** Contraseña temporal criptográficamente aleatoria con al menos una letra y un número. */
export function generarContrasenaTemporal(longitud = 12): string {
  const chars = [LETRAS[randomInt(LETRAS.length)], DIGITOS[randomInt(DIGITOS.length)]];
  while (chars.length < longitud) chars.push(TODOS[randomInt(TODOS.length)]);

  // Fisher–Yates para no dejar la letra y el dígito siempre al inicio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
