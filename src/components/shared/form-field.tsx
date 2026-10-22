import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  error?: string[] | string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactElement<Record<string, unknown>>;
};

/** Etiqueta + control + ayuda/error, con atributos ARIA conectados. */
export function Field({ id, label, error, hint, required, className, children }: FieldProps) {
  const errorText = Array.isArray(error) ? error[0] : error;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": errorText ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-semibold text-lavanda-950">
        {label}
        {required && (
          <span aria-hidden="true" className="text-lavanda-600">
            *
          </span>
        )}
      </Label>
      {control}
      {hint && !errorText && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {errorText && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {errorText}
        </p>
      )}
    </div>
  );
}
