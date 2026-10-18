"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "lift relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-pill",
    "font-medium select-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand-solid text-on-brand hover:bg-brand-solid-hover shadow-sm",
        secondary: "bg-deep-solid text-on-deep hover:bg-deep-solid-hover shadow-sm",
        quiet: "border border-control bg-surface-raised text-ink hover:border-hairline-strong",
        ghost: "text-ink-2 hover:bg-surface-sunken hover:text-ink",
        danger: "border border-danger-border bg-danger-bg text-danger hover:border-danger",
      },
      size: {
        sm: "min-h-8 px-4 text-sm",
        md: "min-h-touch px-6 text-base",
        lg: "min-h-12 px-8 text-base",
        icon: "size-touch",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Specular glint sweep on hover/focus. Reserve for the primary action of a view. */
  glint?: boolean;
  /** In-button pending state: the only place a spinner is allowed. Width is kept; the button is disabled and aria-busy. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("spinner size-4 shrink-0", className)} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Button({ className, variant, size, asChild, glint, loading, disabled, children, ref, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), glint && "glint", className);
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      type={props.type ?? "button"}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
