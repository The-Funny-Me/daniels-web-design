/**
 * The only place spring, duration and easing numbers appear in code. Everything is read from core.json
 * (01-fundamentals/core.json, synced by `npm run tokens`), so changing a token changes the whole app.
 */
import core from "@/design/core.json";

const seconds = (ms: string): number => Number.parseInt(ms, 10) / 1000;

function bezier(value: string): [number, number, number, number] {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  const parts = (match?.[1] ?? "0.22, 1, 0.36, 1").split(",").map((n) => Number.parseFloat(n));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 1, parts[3] ?? 1];
}

export const durations = {
  press: seconds(core.motion.duration.press),
  ui: seconds(core.motion.duration.ui),
  slow: seconds(core.motion.duration.slow),
  hero: seconds(core.motion.duration.hero),
} as const;

export const stagger = seconds(core.motion.stagger);

export const ease = {
  soft: bezier(core.motion.ease.soft),
  inOut: bezier(core.motion["ease"]["in-out"]),
} as const;

/** Critically damped or over (damping >= 2*sqrt(stiffness*mass)): overlays never overshoot. Verified by the token build. */
export const springs = {
  overlay: { type: "spring", ...core.motion.spring.overlay, restDelta: 0.5, restSpeed: 2 },
  ui: { type: "spring", ...core.motion.spring.ui, restDelta: 0.5, restSpeed: 2 },
  hero: { type: "spring", ...core.motion.spring.hero, restDelta: 0.5, restSpeed: 2 },
} as const;

export const loadingConfig = core.loading;

/** A plain fade, the reduced-motion replacement for every transform-based transition. */
export const fade = { duration: 0.2, ease: "linear" } as const;
