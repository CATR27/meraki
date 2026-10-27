import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    // Borra los audios de sesiones con más de 30 días (09:00 UTC ≈ 03:00 en CDMX).
    { path: "/api/cron/limpiar-grabaciones", schedule: "0 9 * * *" },
  ],
};
