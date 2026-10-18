"use client";

import type { HTMLAttributes, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMotionOk } from "@/components/patterns/design-provider";

/** Base surface: tint, hairline, soft shadow. Never glass; glass is for overlay layers only. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-hairline bg-surface shadow-sm", className)} {...props} />;
}

interface GlowCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Classes for the outer shell (radius, border, surface). `className` styles the inner content box. */
  shellClassName?: string;
  children: ReactNode;
}

/** Accent level 1: a soft radial light follows the cursor inside the card. Static (fade only) when motion is off. */
export function GlowCard({ className, shellClassName, children, ...props }: GlowCardProps) {
  const motionOk = useMotionOk();
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!motionOk) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--cx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--cy", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onPointerMove={onMove}
      className={cn("glow-card overflow-hidden rounded-card border border-hairline bg-surface shadow-sm", shellClassName)}
    >
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </div>
  );
}
