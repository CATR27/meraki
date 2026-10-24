import { ViewTransition } from "react";
import { cn } from "@/lib/utils";

/** Isotipo de Meraki: flor de loto de tres pétalos. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 6c4.8 5.2 7 10.6 7 16.2S28.8 33 24 38.4C19.2 33 17 27.8 17 22.2S19.2 11.2 24 6Z" />
      <path
        opacity=".55"
        d="M6.5 20.5c6.8-.4 12 1.8 15.2 6s3.9 9 2.3 14c-6.8.4-12-1.8-15.2-6s-3.9-9-2.3-14Z"
      />
      <path
        opacity=".55"
        d="M41.5 20.5c-6.8-.4-12 1.8-15.2 6s-3.9 9-2.3 14c6.8.4 12-1.8 15.2-6s3.9-9 2.3-14Z"
      />
    </svg>
  );
}

export function Logo({
  variant = "default",
  className,
  morph = false,
  bloom = false,
}: {
  variant?: "default" | "light";
  className?: string;
  /** Nombra el isotipo para que viaje entre el login y la app al iniciar sesión. */
  morph?: boolean;
  /** Los pétalos se abren al montar (solo en la pantalla de acceso). */
  bloom?: boolean;
}) {
  const mark = (
    <LogoMark
      className={cn(
        "size-8",
        variant === "light" ? "text-lavanda-100" : "text-lavanda-600",
        bloom && "logo-bloom",
      )}
    />
  );
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {morph ? (
        <ViewTransition name="logo-mark" share="logo-morph" default="none">
          {mark}
        </ViewTransition>
      ) : (
        mark
      )}
      <span
        className={cn(
          "font-heading text-2xl font-bold tracking-tight",
          variant === "light" ? "text-white" : "text-lavanda-800",
        )}
      >
        Meraki
      </span>
    </span>
  );
}
