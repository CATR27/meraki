import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONOS = {
  primary: "bg-tint-2 text-soft-foreground ring-transparent",
  success: "bg-success-soft text-success ring-transparent",
  warning: "bg-warning-soft text-warning ring-transparent",
  danger: "bg-destructive-soft text-destructive ring-transparent",
  neutral: "bg-muted text-muted-foreground ring-transparent",
} as const;

export type Tono = keyof typeof TONOS;

export function StatusBadge({
  tono = "neutral",
  children,
  className,
}: {
  tono?: Tono;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-xs font-extrabold whitespace-nowrap ring-1 ring-inset",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
