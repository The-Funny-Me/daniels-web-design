"use client";

import { animate, utils } from "animejs";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { durations } from "@/lib/motion";
import { useMotionOk } from "./design-provider";

/** Accent level 2: eased radial light behind an element. Static; optionally breathes. Decorative. */
export function RadialLight({ className, breathe = false }: { className?: string; breathe?: boolean }) {
  return (
    <span
      aria-hidden
      data-anim={breathe ? "" : undefined}
      className={cn("radial-light pointer-events-none absolute", breathe && "breathe", className)}
    />
  );
}

const PARTICLES = 26;

/**
 * Accent level 4: one burst of light + flying particles from the centre of the nearest positioned ancestor.
 * Fire it by incrementing `trigger`. Particles hang, then drift and fade over 1.5 to 2.6s (anime.js).
 * Motion off: a single soft flash that only fades.
 */
export function AccentBurst({ trigger, className }: { trigger: number; className?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const motionOk = useMotionOk();

  useEffect(() => {
    const el = host.current;
    if (!el || trigger <= 0) return;

    const flash = document.createElement("span");
    flash.className = "radial-light absolute inset-0 m-auto size-full";
    flash.style.opacity = "0";
    el.appendChild(flash);

    if (!motionOk) {
      const quiet = animate(flash, {
        opacity: [0, 0.7, 0],
        duration: durations.hero * 1000 * 2,
        ease: "inOutQuad",
        onComplete: () => flash.remove(),
      });
      return () => {
        quiet.revert();
        flash.remove();
      };
    }

    const fxClasses = ["bg-fx-1", "bg-fx-2", "bg-fx-3"];
    const sizeClasses = ["size-1", "size-1", "size-2"];
    const bits: HTMLSpanElement[] = [];
    for (let i = 0; i < PARTICLES; i++) {
      const bit = document.createElement("span");
      bit.className = cn("absolute start-1/2 top-1/2 rounded-pill opacity-0", fxClasses[i % fxClasses.length], sizeClasses[i % sizeClasses.length]);
      el.appendChild(bit);
      bits.push(bit);
    }

    const light = animate(flash, {
      opacity: [0, 1, 0],
      scale: [0.4, 1.15],
      duration: durations.hero * 1000 * 2,
      ease: "outQuad",
      onComplete: () => flash.remove(),
    });
    const flight = animate(bits, {
      translateX: () => utils.random(-220, 220),
      translateY: () => utils.random(-180, 140),
      scale: () => [utils.random(1, 2), 0],
      opacity: [{ to: 1, duration: 120 }, { to: 0.9, duration: 700 }, { to: 0 }],
      duration: () => utils.random(1500, 2600),
      delay: () => utils.random(0, 240),
      ease: "outExpo",
      onComplete: () => bits.forEach((b) => b.remove()),
    });

    return () => {
      light.revert();
      flight.revert();
      flash.remove();
      bits.forEach((b) => b.remove());
    };
  }, [trigger, motionOk]);

  return <span ref={host} aria-hidden className={cn("pointer-events-none absolute inset-0", className)} />;
}
