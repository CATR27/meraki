import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

/** Mensaje general (éxito/error) devuelto por una Server Action. */
export function FormMessage({
  state,
  className,
}: {
  state: ActionState<unknown>;
  className?: string;
}) {
  if (!state?.message) return null;
  const Icon = state.ok ? CircleCheckIcon : CircleAlertIcon;

  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
        state.ok ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{state.message}</span>
    </div>
  );
}
