/**
 * Plantillas de correo en HTML con estilos en línea (compatibles con clientes de correo).
 * Todo valor dinámico pasa por `esc` para evitar inyección de HTML.
 */

export type EmailContent = { subject: string; html: string; text: string };

const C = {
  fondo: "#f7f3fd",
  tarjeta: "#ffffff",
  borde: "#e6dcf5",
  morado: "#6534a8",
  moradoClaro: "#efe6fb",
  texto: "#2a1b45",
  suave: "#6b5f80",
};

export function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({ preheader, body }: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meraki</title></head>
<body style="margin:0;padding:0;background:${C.fondo};font-family:'Nunito','Segoe UI',Arial,sans-serif;color:${C.texto};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 8px 20px;font-size:26px;font-weight:800;color:${C.morado};letter-spacing:-0.5px;">❀ Meraki</td></tr>
<tr><td style="background:${C.tarjeta};border:1px solid ${C.borde};border-radius:20px;padding:32px;font-size:16px;line-height:1.6;">
${body}
</td></tr>
<tr><td style="padding:20px 8px;font-size:12px;color:${C.suave};line-height:1.5;">
Este mensaje fue enviado automáticamente por Meraki. Si no esperabas recibirlo, puedes ignorarlo.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function boton(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.morado};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:12px;">${esc(label)}</a>`;
}

function detalle(filas: [string, string][]): string {
  const rows = filas
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:${C.suave};width:140px;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;font-weight:700;">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${C.moradoClaro};border-radius:14px;padding:12px 18px;margin:20px 0;">${rows}</table>`;
}

export function correoBienvenida(p: {
  nombre: string;
  email: string;
  contrasenaTemporal: string;
  loginUrl: string;
}): EmailContent {
  const subject = "Tu cuenta de Meraki está lista";
  const html = layout({
    preheader: "Ya puedes ingresar a Meraki con tu contraseña temporal.",
    body: `
<h1 style="margin:0 0 12px;font-size:22px;">¡Hola, ${esc(p.nombre)}!</h1>
<p style="margin:0 0 8px;">La administración creó tu cuenta en <strong>Meraki</strong>, tu espacio para gestionar expedientes, agenda y sesiones.</p>
${detalle([
  ["Correo", p.email],
  ["Contraseña temporal", p.contrasenaTemporal],
])}
<p style="margin:0 0 24px;">Al ingresar por primera vez te pediremos crear una contraseña nueva.</p>
${boton(p.loginUrl, "Ingresar a Meraki")}`,
  });
  const text = `¡Hola, ${p.nombre}!

La administración creó tu cuenta en Meraki.
Correo: ${p.email}
Contraseña temporal: ${p.contrasenaTemporal}

Al ingresar por primera vez te pediremos crear una contraseña nueva.
Ingresa aquí: ${p.loginUrl}`;
  return { subject, html, text };
}

export function correoContrasenaRestablecida(p: {
  nombre: string;
  contrasenaTemporal: string;
  loginUrl: string;
}): EmailContent {
  const subject = "Se restableció tu contraseña de Meraki";
  const html = layout({
    preheader: "Tienes una nueva contraseña temporal.",
    body: `
<h1 style="margin:0 0 12px;font-size:22px;">Hola, ${esc(p.nombre)}</h1>
<p style="margin:0 0 8px;">La administración restableció tu contraseña. Usa esta contraseña temporal para ingresar:</p>
${detalle([["Contraseña temporal", p.contrasenaTemporal]])}
<p style="margin:0 0 24px;">Por seguridad, cerramos tus sesiones abiertas y te pediremos crear una contraseña nueva.</p>
${boton(p.loginUrl, "Ingresar a Meraki")}`,
  });
  const text = `Hola, ${p.nombre}

La administración restableció tu contraseña de Meraki.
Contraseña temporal: ${p.contrasenaTemporal}

Ingresa aquí: ${p.loginUrl}`;
  return { subject, html, text };
}
