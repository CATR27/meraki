import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONOS = {
  primary: "bg-lavanda-100 text-lavanda-800 ring-lavanda-200",
  success: "bg-success-soft text-success ring-success/20",
  warning: "bg-warning-soft text-warning ring-warning/20",
  danger: "bg-destructive-soft text-destructive ring-destructive/20",
  neutral: "bg-muted text-muted-foreground ring-border",
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ring-1 ring-inset",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
