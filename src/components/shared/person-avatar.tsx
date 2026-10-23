import { iniciales } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEGRADADOS = [
  "from-[#c9aef0] to-[#7a45c6]",
  "from-[#e7a6c4] to-[#9466d9]",
  "from-[#8cc6aa] to-[#6534a8]",
  "from-[#b08be6] to-[#4f2985]",
];

/** Avatar del rediseño: forma de gota con degradado estable según el nombre. */
export function PersonAvatar({
  nombre,
  className,
}: {
  nombre: string;
  className?: string;
}) {
  const semilla = [...nombre].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[46px] shrink-0 items-center justify-center rounded-avatar bg-gradient-to-br font-heading font-bold text-white",
        DEGRADADOS[semilla % DEGRADADOS.length],
        className,
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}
