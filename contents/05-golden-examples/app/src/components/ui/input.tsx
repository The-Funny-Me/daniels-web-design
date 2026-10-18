"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "min-h-touch w-full rounded-pill border border-control bg-surface-raised px-6 text-base text-ink " +
  "placeholder:text-ink-3 transition-[border-color,box-shadow] duration-(--ds-duration-ui) ease-soft " +
  "hover:border-hairline-strong focus-visible:border-brand-ui aria-[invalid=true]:border-danger disabled:opacity-50";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, ref, ...props }: InputProps) {
  return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  /** Render-prop so the control receives the generated id and aria wiring. */
  children: (control: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode;
  className?: string;
  trailing?: ReactNode;
}

/** Label + control + hint/error, with the aria relationships wired once. */
export function Field({ label, hint, error, children, className, trailing }: FieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-2">
          {label}
        </label>
        {trailing}
      </div>
      {children({ id, "aria-describedby": note ? noteId : undefined, "aria-invalid": error ? true : undefined })}
      {note && (
        <p id={noteId} role={error ? "alert" : undefined} className={cn("px-3 text-sm", error ? "text-danger" : "text-ink-2")}>
          {note}
        </p>
      )}
    </div>
  );
}
