"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { ease, fade, loadingConfig, stagger } from "@/lib/motion";
import { useMotionOk } from "./design-provider";

interface RevealProps {
  children: ReactNode;
  /** Position in a staggered group; delay = index x stagger token. */
  index?: number;
  /** Wait for the element to enter the viewport (landing sections) instead of animating on mount. */
  inView?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "p" | "h1" | "h2" | "h3";
}

/** The fade-in reveal: 12px rise + opacity, 700ms, 60ms stagger. Opacity only when motion is off. */
export function Reveal({ children, index = 0, inView = false, className, as = "div" }: RevealProps) {
  const motionOk = useMotionOk();
  const Tag = motion[as] as ElementType;
  const delay = motionOk ? (index * stagger) : 0;
  const transition = motionOk
    ? { duration: loadingConfig.revealDurationMs / 1000, ease: ease.soft, delay }
    : fade;
  const hidden = motionOk ? { opacity: 0, y: 12 } : { opacity: 0 };
  const shown = motionOk ? { opacity: 1, y: 0 } : { opacity: 1 };
  return inView ? (
    <Tag className={className} initial={hidden} whileInView={shown} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={transition}>
      {children}
    </Tag>
  ) : (
    <Tag className={className} initial={hidden} animate={shown} transition={transition}>
      {children}
    </Tag>
  );
}
