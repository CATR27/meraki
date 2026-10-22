import { StatusBadge, type Tono } from "@/components/shared/status-badge";
import type { ESTADOS_CONSULTANTE } from "@/db/schema";
import { ESTADO_CONSULTANTE_LABEL } from "../schemas";

const TONO: Record<(typeof ESTADOS_CONSULTANTE)[number], Tono> = {
  activo: "primary",
  alta: "success",
  baja: "neutral",
};

export function EstadoConsultanteBadge({
  estado,
}: {
  estado: (typeof ESTADOS_CONSULTANTE)[number];
}) {
  return <StatusBadge tono={TONO[estado]}>{ESTADO_CONSULTANTE_LABEL[estado]}</StatusBadge>;
}
