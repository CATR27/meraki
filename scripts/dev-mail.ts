/**
 * Servidor SMTP solo para desarrollo: atrapa los correos en lugar de enviarlos.
 * Uso: pnpm mail:dev  → escucha en localhost:1025 y guarda cada correo en .mail/
 * (un .html para previsualizar en el navegador y un .eml con el mensaje original).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";

const PORT = Number(process.env.DEV_MAIL_PORT ?? 1025);
const DIR = path.join(process.cwd(), ".mail");

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  onData(stream, _session, callback) {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", async () => {
      try {
        const raw = Buffer.concat(chunks);
        const mail = await simpleParser(raw);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const base = path.join(DIR, `${stamp}`);
        await mkdir(DIR, { recursive: true });
        await writeFile(`${base}.eml`, raw);
        await writeFile(`${base}.html`, mail.html || `<pre>${mail.text ?? ""}</pre>`);
        const adjuntos = mail.attachments.map((a) => a.filename).join(", ");
        console.log(
          `📬 ${mail.subject} → ${[mail.to]
            .flat()
            .map((t) => t?.text)
            .join(", ")}` +
            (adjuntos ? ` [adjuntos: ${adjuntos}]` : "") +
            `\n   ${base}.html`,
        );
        callback();
      } catch (error) {
        callback(error as Error);
      }
    });
  },
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`✉️  SMTP de desarrollo en localhost:${PORT}. Los correos se guardan en ${DIR}`);
});
