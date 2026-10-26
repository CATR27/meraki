// Genera los iconos de la PWA a partir del logo oficial: node scripts/generar-iconos.mjs
// Fuente: public/Logo_oscuro.png (1254×1254, fondo morado oscuro, el logo ocupa el centro).
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// `sharp` llega como dependencia de Next; con pnpm no está en la raíz, así que se resuelve desde Next.
const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next/package.json")] }));

const FUENTE = "public/Logo_oscuro.png";

/** Recorte cuadrado centrado en el logo; `zoom` > 1 acerca (el logo ocupa ≈ 52 % del ancho original). */
async function desde({ px, zoom = 1, soloLoto = false }) {
  const lado = 1254;
  let region;
  if (soloLoto) {
    // Solo la flor (sin la palabra) para tamaños donde el texto no se lee.
    const w = 760;
    region = { left: Math.round((lado - w) / 2), top: 270, width: w, height: w };
  } else {
    const w = Math.round(lado / zoom);
    const o = Math.round((lado - w) / 2);
    region = { left: o, top: o, width: w, height: w };
  }
  return sharp(FUENTE).extract(region).resize(px, px).png().toBuffer();
}

mkdirSync("public/icons", { recursive: true });

const salidas = [
  ["public/icons/icon-512.png", { px: 512, zoom: 1.15 }],
  ["public/icons/icon-192.png", { px: 192, zoom: 1.15 }],
  // Maskable: el sistema recorta hasta un círculo; el logo (≈ 52 % del lienzo) queda en la zona segura.
  ["public/icons/maskable-512.png", { px: 512, zoom: 1 }],
  ["src/app/apple-icon.png", { px: 180, zoom: 1.15 }],
  ["src/app/icon.png", { px: 64, soloLoto: true }],
];

for (const [ruta, opciones] of salidas) {
  writeFileSync(ruta, await desde(opciones));
  console.log(`✓ ${ruta} (${opciones.px}px)`);
}
