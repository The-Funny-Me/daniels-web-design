import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex min-h-6 items-center gap-1 rounded-pill border px-3 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "border-hairline-strong bg-surface-sunken text-ink-2",
      brand: "border-hairline-strong bg-surface-raised text-brand-text",
      success: "border-success-border bg-success-bg text-success",
      warning: "border-warning-border bg-warning-bg text-warning",
      danger: "border-danger-border bg-danger-bg text-danger",
      info: "border-info-border bg-info-bg text-info",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
