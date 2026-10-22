"use client";

import {
  EllipsisVerticalIcon,
  KeyRoundIcon,
  PencilIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type Credenciales as CredencialesData,
  reactivarPsicologo,
  restablecerContrasena,
  suspenderPsicologo,
} from "../actions";
import { Credenciales } from "./credenciales";

type Confirmacion = "suspender" | "reactivar" | "restablecer" | null;

const TEXTOS = {
  suspender: {
    titulo: "¿Suspender esta cuenta?",
    descripcion:
      "No podrá ingresar y se cerrarán sus sesiones abiertas. Sus expedientes se conservan intactos.",
    boton: "Suspender",
  },
  reactivar: {
    titulo: "¿Reactivar esta cuenta?",
    descripcion: "Podrá volver a ingresar con su contraseña actual.",
    boton: "Reactivar",
  },
  restablecer: {
    titulo: "¿Restablecer la contraseña?",
    descripcion:
      "Generaremos una contraseña temporal, cerraremos sus sesiones y se la enviaremos por correo.",
    boton: "Restablecer",
  },
} as const;

export function PsicologoAcciones({
  id,
  nombre,
  suspendido,
}: {
  id: string;
  nombre: string;
  suspendido: boolean;
}) {
  const [confirmar, setConfirmar] = useState<Confirmacion>(null);
  const [credenciales, setCredenciales] = useState<CredencialesData | null>(null);
  const [pending, startTransition] = useTransition();

  function ejecutar(tipo: Exclude<Confirmacion, null>) {
    startTransition(async () => {
      try {
        const accion = {
          suspender: suspenderPsicologo,
          reactivar: reactivarPsicologo,
          restablecer: restablecerContrasena,
        }[tipo];
        const res = await accion(id);
        if (!res?.ok) {
          toast.error(res?.message ?? "Algo salió mal.");
          return;
        }
        toast.success(res.message);
        if (tipo === "restablecer" && res.data) setCredenciales(res.data as CredencialesData);
      } catch {
        toast.error("No pudimos completar la acción. Inténtalo de nuevo.");
      } finally {
        setConfirmar(null);
      }
    });
  }

  const texto = confirmar ? TEXTOS[confirmar] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Acciones para ${nombre}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/admin/psicologos/${id}`}>
              <PencilIcon /> Editar datos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setConfirmar("restablecer")}>
            <KeyRoundIcon /> Restablecer contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {suspendido ? (
            <DropdownMenuItem onSelect={() => setConfirmar("reactivar")}>
              <ShieldCheckIcon /> Reactivar cuenta
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmar("suspender")}>
              <ShieldBanIcon /> Suspender cuenta
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmar !== null} onOpenChange={(open) => !open && setConfirmar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{texto?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-foreground">{nombre}</span>. {texto?.descripcion}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              variant={confirmar === "suspender" ? "destructive" : "default"}
              onClick={(e) => {
                e.preventDefault();
                if (confirmar) ejecutar(confirmar);
              }}
            >
              {pending ? "Procesando…" : texto?.boton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={credenciales !== null} onOpenChange={(open) => !open && setCredenciales(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva contraseña temporal</DialogTitle>
            <DialogDescription>Para {nombre}.</DialogDescription>
          </DialogHeader>
          {credenciales && <Credenciales data={credenciales} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
