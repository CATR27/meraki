"use client";

import { EyeIcon, EyeOffIcon, type LucideIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string | string[];
  /** Enlace o texto a la derecha de la etiqueta (p. ej. "¿La olvidaste?"). */
  accion?: ReactNode;
  /** Muestra el botón de ojo para revelar la contraseña. */
  revelable?: boolean;
};

/** Campo translúcido de las pantallas de acceso (fondo oscuro con loto). */
export function CampoAuth({ id, label, icon: Icon, error, accion, revelable, className, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const mensaje = Array.isArray(error) ? error[0] : error;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-extrabold text-lavanda-200">
          {label}
        </label>
        {accion}
      </div>
      <div
        className={cn(
          "flex h-[clamp(44px,6.5dvh,50px)] items-center gap-2.5 rounded-[14px] border border-white/20 bg-white/8 pl-4 transition-colors focus-within:border-lavanda-300 focus-within:bg-white/12",
          revelable ? "pr-2" : "pr-4",
          mensaje && "border-[#ff9db9]",
        )}
      >
        <Icon aria-hidden="true" className="size-[18px] shrink-0 text-lavanda-300" />
        <input
          id={id}
          aria-invalid={mensaje ? true : undefined}
          aria-describedby={mensaje ? `${id}-error` : undefined}
          {...props}
          type={revelable ? (visible ? "text" : "password") : props.type}
          className={cn(
            "h-full min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-white outline-none placeholder:text-lavanda-200/55",
            className,
          )}
        />
        {revelable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-lavanda-200 transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
          >
            {visible ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
          </button>
        )}
      </div>
      {mensaje && (
        <p id={`${id}-error`} role="alert" className="text-xs font-bold text-[#ffb3c9]">
          {mensaje}
        </p>
      )}
    </div>
  );
}
