import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  pagina: number;
  paginas: number;
  /** Construye la URL de una página conservando los demás filtros. */
  href: (pagina: number) => string;
  total?: number;
};

export function Pagination({ pagina, paginas, href, total }: PaginationProps) {
  if (paginas <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-muted-foreground">
        Página {pagina} de {paginas}
        {total != null && ` · ${total} en total`}
      </p>
      <div className="flex gap-2">
        {pagina > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={href(pagina - 1)} rel="prev">
              <ChevronLeftIcon /> Anterior
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeftIcon /> Anterior
          </Button>
        )}
        {pagina < paginas ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={href(pagina + 1)} rel="next">
              Siguiente <ChevronRightIcon />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Siguiente <ChevronRightIcon />
          </Button>
        )}
      </div>
    </nav>
  );
}
