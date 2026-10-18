import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Tracked small-caps label. Latin uppercase and tracking switch off under RTL (see .ds-label). */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("ds-label", className)} {...props} />;
}
