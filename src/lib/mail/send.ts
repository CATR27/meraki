import "server-only";
import type { Attachment } from "nodemailer/lib/mailer";
import { env } from "@/lib/env";
import type { EmailContent } from "./templates";
import { getTransport } from "./transport";

type SendOptions = EmailContent & { to: string; attachments?: Attachment[] };

/**
 * Envía un correo. Nunca lanza: devuelve si se envió para que la UI lo informe.
 * No registra el contenido (puede incluir datos personales).
 */
export async function enviarCorreo({ to, subject, html, text, attachments }: SendOptions) {
  try {
    await getTransport().sendMail({ from: env.MAIL_FROM, to, subject, html, text, attachments });
    return { ok: true as const };
  } catch (error) {
    console.error("[mail] Error al enviar correo:", error instanceof Error ? error.message : error);
    return { ok: false as const };
  }
}
