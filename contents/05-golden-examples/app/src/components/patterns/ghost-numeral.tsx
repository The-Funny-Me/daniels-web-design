"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useMotionOk } from "./design-provider";

/**
 * Oversized outline-weight numeral that sits behind a section. Decorative (aria-hidden), never carries meaning,
 * and drifts slowly against the scroll. Place it with logical offsets (`start-0` / `end-0`), never `left`/`right`.
 */
export function GhostNumeral({ value, className, drift = 56 }: { value: string; className?: string; drift?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  return (
    <motion.span
      ref={ref}
      aria-hidden
      style={motionOk ? { y } : undefined}
      className={cn(
        "pointer-events-none absolute select-none font-display text-numeral-ghost leading-none text-brand-ui/15",
        className,
      )}
    >
      {value}
    </motion.span>
  );
}
