/** Duración de cada fragmento de audio independiente. */
export const FRAGMENTO_MS = 3 * 60_000;

/** Tope por fragmento: muy por debajo del límite de 4.5 MB por petición en Vercel. */
export const MAX_BYTES_FRAGMENTO = 4 * 1024 * 1024;

/** Días que se conserva el audio tras finalizar la sesión. */
export const RETENCION_AUDIO_DIAS = 30;

/** Voz: mono a 32 kbps basta para transcribir y ≈ 0.7 MB por fragmento. */
export const BITS_POR_SEGUNDO = 32_000;

// Orden de preferencia: Opus (Chrome/Android/Firefox) y AAC en MP4 (Safari/iOS).
const CANDIDATOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

const EXTENSIONES: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
};

/** Formato de grabación que admite el navegador, o null si no puede grabar audio. */
export function elegirFormato(admite: (tipo: string) => boolean): string | null {
  return CANDIDATOS.find((tipo) => admite(tipo)) ?? null;
}

/** "audio/webm;codecs=opus" → "audio/webm". */
export function tipoBase(mime: string) {
  return mime.split(";")[0].trim().toLowerCase();
}

/** Extensión de archivo para un tipo de audio permitido, o null si no se acepta. */
export function extensionAudio(mime: string): string | null {
  return EXTENSIONES[tipoBase(mime)] ?? null;
}

/** "grabaciones/<id>/007.webm": el índice con ceros mantiene el orden al listar. */
export function rutaFragmento(grabacionId: string, indice: number, mime: string) {
  return `grabaciones/${grabacionId}/${String(indice).padStart(3, "0")}.${extensionAudio(mime)}`;
}
