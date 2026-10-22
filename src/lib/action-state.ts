import { z } from "zod";

/** Respuesta estándar de las Server Actions usadas con useActionState. */
export type ActionState =
  | {
      ok: boolean;
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Valores enviados, para no perderlos cuando React reinicia el formulario. */
      values?: Record<string, string>;
    }
  | undefined;

export function zodErrorState(error: z.ZodError, values?: Record<string, string>): ActionState {
  return {
    ok: false,
    message: "Revisa los campos marcados.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
    values,
  };
}

/** Convierte FormData en un objeto plano de strings (omite archivos). */
export function formValues(formData: FormData, omit: string[] = []): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && !omit.includes(key)) {
      values[key] = value;
    }
  }
  return values;
}
