"use client";

import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorApp({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <TriangleAlertIcon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold">Algo no salió como esperábamos</h1>
      <p className="mt-2 text-muted-foreground">
        Tu información está a salvo. Intenta de nuevo; si el problema continúa, recarga la página.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>
          <RefreshCwIcon /> Intentar de nuevo
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
