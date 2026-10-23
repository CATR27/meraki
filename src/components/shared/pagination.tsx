import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  pagina: number;
  paginas: number;
  /** Construye la URL de una página conservando los demás filtros. */
  href: (pagina: number) => string;
  total?: number;
  /** Cantidad de filas por página; con ella se muestra "Mostrando a–b de N". */
  porPagina?: number;
};

const CIRCULO =
  "flex size-9 items-center justify-center rounded-full border border-border bg-card text-sm font-bold text-deep transition-colors hover:bg-tint-2";

/** Páginas visibles: primera, última y la ventana alrededor de la actual. */
function ventana(pagina: number, paginas: number) {
  const visibles = new Set([1, paginas, pagina - 1, pagina, pagina + 1]);
  return [...visibles].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b);
}

export function Pagination({ pagina, paginas, href, total, porPagina }: PaginationProps) {
  if (paginas <= 1) return null;

  const desde = porPagina ? (pagina - 1) * porPagina + 1 : null;
  const hasta = porPagina && total != null ? Math.min(pagina * porPagina, total) : null;
  const numeros = ventana(pagina, paginas);

  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <p>
        {desde != null && hasta != null && total != null
          ? `Mostrando ${desde}–${hasta} de ${total}`
          : `Página ${pagina} de ${paginas}${total != null ? ` · ${total} en total` : ""}`}
      </p>
      <div className="flex items-center gap-1.5">
        {pagina > 1 && (
          <Link href={href(pagina - 1)} rel="prev" aria-label="Página anterior" className={CIRCULO}>
            <ChevronLeftIcon className="size-4" />
          </Link>
        )}
        {numeros.map((n, i) => (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 && n - numeros[i - 1] > 1 && <span aria-hidden="true">…</span>}
            {n === pagina ? (
              <span
                aria-current="page"
                className="flex size-9 items-center justify-center rounded-avatar bg-primary text-sm font-extrabold text-primary-foreground"
              >
                {n}
              </span>
            ) : (
              <Link href={href(n)} className={cn(CIRCULO)}>
                {n}
              </Link>
            )}
          </span>
        ))}
        {pagina < paginas && (
          <Link href={href(pagina + 1)} rel="next" aria-label="Página siguiente" className={CIRCULO}>
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
