import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoEncontradoApp() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-lavanda-100 text-lavanda-600">
        <SearchXIcon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold">No encontramos lo que buscas</h1>
      <p className="mt-2 text-muted-foreground">
        Es posible que el registro no exista o que no tengas acceso a él.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
