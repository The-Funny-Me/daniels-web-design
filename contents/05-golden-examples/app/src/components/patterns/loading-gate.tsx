"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import type { LoadPhase } from "@/hooks/use-adaptive-loading";
import { fade } from "@/lib/motion";
import { BrandMark } from "./brand-mark";
import { useDesign } from "./design-provider";
import { RegionError } from "./region-error";

/** Preloaded loading screen: the mark draws itself over a calm hairline track. No spinner, no skeleton. */
export function LoadingScreen() {
  const { t, motionOk } = useDesign();
  const [long, setLong] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLong(true), 4000);
    return () => clearTimeout(id);
  }, []);
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={t("loading")}
      className="fixed inset-0 z-(--ds-z-overlay) grid place-items-center bg-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
    >
      <div className="grid justify-items-center gap-6">
        <BrandMark draw className="size-16" />
        <div aria-hidden className="relative h-px w-32 overflow-hidden bg-hairline">
          <span data-anim className="absolute inset-y-0 start-0 block w-1/3 bg-brand-ui" style={motionOk ? { animation: "track 1.6s var(--ds-ease-in-out) infinite" } : undefined} />
        </div>
        <p className="h-6 text-sm text-ink-2">{long ? t("stillOnIt") : ""}</p>
      </div>
    </motion.div>
  );
}

/** Wraps a page region: loading screen while slow, error with Retry on failure, content (which reveals itself) when ready. */
export function LoadingGate({ phase, onRetry, children, compact = false }: { phase: LoadPhase; onRetry: () => void; children: ReactNode; compact?: boolean }) {
  return (
    <>
      <AnimatePresence>{phase === "loading" && <LoadingScreen key="loading" />}</AnimatePresence>
      {phase === "error" && (
        <div className={compact ? "mx-auto grid max-w-reading place-items-center py-section-md" : "mx-auto grid min-h-dvh max-w-reading place-items-center px-4"}>
          <RegionError onRetry={onRetry} />
        </div>
      )}
      {phase === "ready" && children}
    </>
  );
}
