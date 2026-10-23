"use client";

import { EyeIcon, EyeOffIcon, type LucideIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  className,
  icon: Icon,
  ...props
}: ComponentProps<typeof Input> & { icon?: LucideIcon }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-lavanda-500"
        />
      )}
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", Icon && "pl-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[14px] text-muted-foreground transition-colors hover:text-deep focus-visible:text-deep focus-visible:outline-none"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
      </button>
    </div>
  );
}
