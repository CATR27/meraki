"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto y cópialo manualmente.");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copiar} aria-live="polite">
      {copiado ? <CheckIcon className="text-success" /> : <CopyIcon />}
      {copiado ? "Copiado" : label}
    </Button>
  );
}
