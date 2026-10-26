import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Meraki",
    short_name: "Meraki",
    description: "Gestión de consultorio psicológico: expedientes, agenda y sesiones.",
    lang: "es",
    dir: "ltr",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fcfaff",
    theme_color: "#6534a8",
    categories: ["health", "medical", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Agenda", url: "/agenda", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Consultantes", url: "/consultantes", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
