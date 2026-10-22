import { z } from "zod";
import { emailSchema } from "@/lib/validation";

export const passwordSchema = z
  .string()
  .min(8, "Usa al menos 8 caracteres.")
  .max(128, "Máximo 128 caracteres.")
  .regex(/[a-zA-Z]/, "Incluye al menos una letra.")
  .regex(/\d/, "Incluye al menos un número.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Escribe tu contraseña."),
});

export const cambiarContrasenaSchema = z
  .object({
    actual: z.string().min(1, "Escribe tu contraseña actual."),
    nueva: passwordSchema,
    confirmar: z.string(),
  })
  .refine((data) => data.nueva === data.confirmar, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmar"],
  })
  .refine((data) => data.nueva !== data.actual, {
    message: "La nueva contraseña debe ser distinta a la actual.",
    path: ["nueva"],
  });
