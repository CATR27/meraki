export const ZONAS_HORARIAS = [
  { value: "America/Mexico_City", label: "Centro de México (CDMX, Guadalajara, Monterrey)" },
  { value: "America/Cancun", label: "Quintana Roo" },
  { value: "America/Chihuahua", label: "Chihuahua" },
  { value: "America/Mazatlan", label: "Pacífico (Sinaloa, Nayarit, BCS)" },
  { value: "America/Hermosillo", label: "Sonora" },
  { value: "America/Tijuana", label: "Baja California" },
  { value: "America/Bogota", label: "Colombia, Perú, Ecuador" },
  { value: "America/Santiago", label: "Chile" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina" },
  { value: "Europe/Madrid", label: "España" },
] as const;

export const ZONA_VALUES = ZONAS_HORARIAS.map((z) => z.value) as [string, ...string[]];
