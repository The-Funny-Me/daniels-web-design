"use client";

import { animate, createDrawable, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { durations } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useMotionOk } from "./design-provider";

/** The suite mark: a ring and a single folded line. With `draw`, anime.js traces the strokes once on mount. */
export function BrandMark({ className, draw = false }: { className?: string; draw?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const motionOk = useMotionOk();

  useEffect(() => {
    if (!draw || !motionOk || !ref.current) return;
    const strokes = createDrawable(ref.current.querySelectorAll("[data-stroke]"));
    const run = animate(strokes, {
      draw: ["0 0", "0 1"],
      duration: durations.hero * 1000 * 1.4,
      delay: stagger(180),
      ease: "inOutQuad",
    });
    return () => {
      run.revert();
    };
  }, [draw, motionOk]);

  return (
    <svg ref={ref} viewBox="0 0 64 64" fill="none" aria-hidden className={cn("size-8 text-brand-ui", className)}>
      <circle data-stroke cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path
        data-stroke
        d="M20 38c6 7 20 6 24-2 3-7-3-11-12-13s-14-5-11-12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
