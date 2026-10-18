"use client";

import { useEffect, useState } from "react";

/** Timings from 04-signature-moves/animated-inputs.md. Milliseconds. */
export const typing = {
  startDelay: 600,
  type: 55,
  jitter: 15,
  hold: 1600,
  erase: 28,
  gap: 300,
  /** password flavour: characters appear, then are dotted out one by one, then the dots are removed in reverse */
  maskStart: 600,
  mask: 45,
  maskedHold: 900,
  unmask: 30,
} as const;

const DOT = "•";
export type CyclerMode = "text" | "password";

interface CyclerOptions {
  examples: readonly string[];
  mode: CyclerMode;
  /** false while the field is focused or has a value: the cycle stops and shows nothing */
  active: boolean;
  /** false under reduced motion: show the first example statically, no typing */
  motionOk: boolean;
}

export interface CyclerView {
  text: string;
  /** a caret is drawn only while the cycle is actually typing */
  caret: boolean;
}

/**
 * Placeholder cycler for animated inputs: types each example, holds, erases, moves on.
 * Passwords are typed, dotted out character by character, held, then unmasked in reverse order.
 * Returns plain text for an aria-hidden overlay; the real input is never touched.
 */
export function useCycler({ examples, mode, active, motionOk }: CyclerOptions): CyclerView {
  const [view, setView] = useState<CyclerView>({ text: "", caret: false });

  useEffect(() => {
    if (!active || examples.length === 0) {
      setView({ text: "", caret: false });
      return;
    }
    if (!motionOk) {
      const first = examples[0] ?? "";
      setView({ text: mode === "password" ? DOT.repeat(Array.from(first).length) : first, caret: false });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });
    const show = (chars: string[], shown: number, dots: number) => {
      if (cancelled) return;
      setView({ text: DOT.repeat(dots) + chars.slice(dots, shown).join(""), caret: true });
    };

    void (async () => {
      let index = 0;
      await wait(typing.startDelay);
      while (!cancelled) {
        const chars = Array.from(examples[index % examples.length] ?? "");
        const n = chars.length;

        for (let i = 1; i <= n && !cancelled; i++) {
          show(chars, i, 0);
          await wait(typing.type + (Math.random() * 2 - 1) * typing.jitter);
        }

        if (mode === "password") {
          await wait(typing.maskStart);
          for (let d = 1; d <= n && !cancelled; d++) {
            show(chars, n, d);
            await wait(typing.mask);
          }
          await wait(typing.maskedHold);
          for (let left = n - 1; left >= 0 && !cancelled; left--) {
            show(chars, left, left);
            await wait(typing.unmask);
          }
        } else {
          await wait(typing.hold);
          for (let left = n - 1; left >= 0 && !cancelled; left--) {
            show(chars, left, 0);
            await wait(typing.erase);
          }
        }
        await wait(typing.gap);
        index += 1;
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, examples, mode, motionOk]);

  return view;
}
