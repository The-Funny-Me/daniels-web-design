"use client";

import { cn } from "@/lib/cn";

/** Pill switch (role=switch). The thumb travels toward the inline-end side in both directions. */
export function Switch({ checked, onCheckedChange, label, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn("inline-flex min-h-touch items-center gap-2 rounded-pill pe-2 text-sm text-ink-2 hover:text-ink", className)}
    >
      <span
        aria-hidden
        className={cn(
          "relative block h-6 w-12 shrink-0 rounded-pill border transition-colors duration-(--ds-duration-ui) ease-soft",
          checked ? "border-brand-ui bg-brand-solid" : "border-control bg-surface-sunken",
        )}
      >
        <span
          className={cn(
            "absolute start-1 top-1 block size-4 rounded-pill bg-surface-raised shadow-sm transition-transform duration-(--ds-duration-ui) ease-soft",
            checked && "ltr:translate-x-6 rtl:-translate-x-6",
          )}
        />
      </span>
      {label}
    </button>
  );
}
