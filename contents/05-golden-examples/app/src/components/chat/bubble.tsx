"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { ease, fade, loadingConfig } from "@/lib/motion";
import { useMotionOk } from "@/components/patterns/design-provider";

export interface Msg {
  id: string;
  role: "assistant" | "user";
  text: string;
  /** arrived during this session: animates in (history never does) */
  fresh?: boolean;
  streaming?: boolean;
}

export function Bubble({ msg, writing }: { msg: Msg; writing: string }) {
  const motionOk = useMotionOk();
  const user = msg.role === "user";
  const hidden = motionOk ? { opacity: 0, y: 12 } : { opacity: 0 };
  return (
    <motion.li
      initial={msg.fresh ? hidden : false}
      animate={{ opacity: 1, y: 0 }}
      transition={motionOk ? { duration: loadingConfig.revealDurationMs / 1000 / 2, ease: ease.soft } : fade}
      className={cn("flex", user ? "justify-end" : "justify-start")}
    >
      <p
        className={cn(
          "max-w-xl rounded-card px-4 py-3 text-base",
          user ? "rounded-ee-sm bg-brand-solid text-on-brand" : "rounded-es-sm border border-hairline bg-surface text-ink",
        )}
      >
        {msg.text}
        {msg.streaming && (
          <span data-anim className={cn("breathe", msg.text ? "ms-px inline-block h-4 w-px translate-y-0.5 bg-brand-ui align-baseline" : "text-ink-2")}>
            {msg.text ? "" : `${writing}…`}
          </span>
        )}
      </p>
    </motion.li>
  );
}
