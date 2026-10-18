"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadingConfig } from "@/lib/motion";

export type LoadPhase = "pending" | "loading" | "ready" | "error";

interface State<T> {
  phase: LoadPhase;
  data: T | null;
}

/**
 * Adaptive loading, from 02-rules/ux-rules.md:
 *  - resolves inside `showAfterMs`  -> straight to the fade-in reveal, no loading screen at all
 *  - slower                          -> loading screen, kept at least `minVisibleMs`, then hands off to the same reveal
 *  - rejects                         -> `error` phase, rendered as a contained recovery with Retry
 */
export function useAdaptiveLoading<T>(load: () => Promise<T>): State<T> & { reload: () => void; attempt: number } {
  const [state, setState] = useState<State<T>>({ phase: "pending", data: null });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let alive = true;
    let shownAt = 0;
    setState({ phase: "pending", data: null });
    const showTimer = setTimeout(() => {
      if (!alive) return;
      shownAt = Date.now();
      setState((s) => (s.phase === "pending" ? { phase: "loading", data: null } : s));
    }, loadingConfig.showAfterMs);

    loadRef.current().then(
      (data) => {
        if (!alive) return;
        clearTimeout(showTimer);
        const visibleFor = shownAt ? Date.now() - shownAt : 0;
        const remaining = shownAt ? Math.max(0, loadingConfig.minVisibleMs - visibleFor) : 0;
        setTimeout(() => alive && setState({ phase: "ready", data }), remaining);
      },
      () => {
        if (!alive) return;
        clearTimeout(showTimer);
        setState({ phase: "error", data: null });
      },
    );
    return () => {
      alive = false;
      clearTimeout(showTimer);
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, reload, attempt };
}
