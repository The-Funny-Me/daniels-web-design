"use client";

import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";
import { fade, springs } from "@/lib/motion";

/** Numbers from 04-signature-moves/scroll-and-focus.md (chat model). */
export const scrollSpec = {
  /** within this distance of the end the view counts as "at the end" (follow streaming, snap on idle) */
  snapZone: 80,
  /** scroll must go quiet for this long before the snap fires */
  snapIdleMs: 140,
  /** further than this from the end shows the "Latest" pill */
  farFromEnd: 240,
  /** over-scroll: visual pull = accumulated delta x resistance */
  resistance: 0.4,
  /** pull (px) at which the options latch open */
  latch: 72,
  /** height of the options panel the pull reveals */
  panelHeight: 96,
  releaseIdleMs: 160,
} as const;

export interface ChatScroll {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  /** > farFromEnd away from the newest message */
  farFromEnd: boolean;
  /** within snapZone of the newest message */
  atEnd: boolean;
  /** options panel latched open */
  open: boolean;
  setOpen: (next: boolean) => void;
  /** current rubber-band pull in px (0 .. panelHeight) */
  pull: MotionValue<number>;
  /** synchronous: is the view pinned to the end right now (read before appending content) */
  isPinned: () => boolean;
  scrollToBottom: (smooth: boolean) => void;
  handlers: {
    onScroll: () => void;
    onWheel: (e: WheelEvent<HTMLDivElement>) => void;
    onTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
    onTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
    onTouchEnd: () => void;
  };
}

/**
 * Chat scroll model:
 *  - scrolling up is fully native
 *  - coming back down, once scrolling goes idle within `snapZone` of the end, the view settles onto the end on the `ui` spring
 *  - at the end, pulling further (wheel or touch) is resisted; past `latch` the options panel latches open beneath the messages
 *  - motion off: no spring, no rubber band, instant positioning
 */
export function useChatScroll(motionOk: boolean): ChatScroll {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [farFromEnd, setFar] = useState(false);
  const [atEnd, setAtEnd] = useState(true);
  const [open, setOpenState] = useState(false);
  const pull = useMotionValue(0);

  const acc = useRef(0);
  const openRef = useRef(false);
  const pinned = useRef(true);
  const lastTop = useRef(0);
  const animTop = useRef<number | null>(null);
  const movingDown = useRef(false);
  const touchY = useRef<number | null>(null);
  const snapAnim = useRef<{ stop: () => void } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const distance = (el: HTMLElement) => el.scrollHeight - el.clientHeight - el.scrollTop;

  const interrupt = useCallback(() => {
    snapAnim.current?.stop();
    snapAnim.current = null;
    animTop.current = null;
  }, []);

  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const el = scrollerRef.current;
      if (!el) return;
      interrupt();
      const target = el.scrollHeight - el.clientHeight;
      if (!smooth || !motionOk) {
        el.scrollTop = target;
        lastTop.current = target;
        pinned.current = true;
        setAtEnd(true);
        setFar(false);
        return;
      }
      animTop.current = el.scrollTop;
      snapAnim.current = animate(el.scrollTop, target, {
        ...springs.ui,
        onUpdate: (v) => {
          animTop.current = v;
          el.scrollTop = v;
        },
        onComplete: () => {
          const end = el.scrollHeight - el.clientHeight;
          el.scrollTop = end;
          lastTop.current = end;
          animTop.current = null;
          pinned.current = true;
          setAtEnd(true);
          setFar(false);
          snapAnim.current = null;
        },
      });
    },
    [interrupt, motionOk],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      openRef.current = next;
      setOpenState(next);
      acc.current = 0;
      clearTimeout(releaseTimer.current);
      if (motionOk) animate(pull, next ? scrollSpec.panelHeight : 0, springs.ui);
      else pull.set(next ? scrollSpec.panelHeight : 0);
    },
    [motionOk, pull],
  );

  const release = useCallback(() => {
    acc.current = 0;
    clearTimeout(releaseTimer.current);
    if (!openRef.current) {
      if (motionOk) animate(pull, 0, springs.ui);
      else pull.set(0);
    }
  }, [motionOk, pull]);

  const addPull = useCallback(
    (delta: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (openRef.current) {
        if (delta < -4) setOpen(false);
        return;
      }
      if (distance(el) >= 2 || delta <= 0) {
        if (acc.current > 0) release();
        return;
      }
      acc.current += delta;
      const p = Math.min(acc.current * scrollSpec.resistance, scrollSpec.panelHeight);
      if (motionOk) pull.set(p);
      clearTimeout(releaseTimer.current);
      if (p >= scrollSpec.latch) {
        setOpen(true);
        return;
      }
      releaseTimer.current = setTimeout(release, scrollSpec.releaseIdleMs);
    },
    [motionOk, pull, release, setOpen],
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (snapAnim.current && animTop.current !== null && Math.abs(el.scrollTop - animTop.current) > 2) {
      interrupt();
    }
    const d = distance(el);
    if (el.scrollTop !== lastTop.current) {
      movingDown.current = el.scrollTop > lastTop.current;
      lastTop.current = el.scrollTop;
    }
    pinned.current = d < scrollSpec.snapZone;
    setFar(d > scrollSpec.farFromEnd);
    setAtEnd(d < scrollSpec.snapZone);
    clearTimeout(idleTimer.current);
    if (openRef.current && !movingDown.current && d > 8) {
      setOpen(false);
      return;
    }
    if (snapAnim.current || openRef.current) return;
    if (d > 1 && d < scrollSpec.snapZone && movingDown.current) {
      idleTimer.current = setTimeout(() => {
        const e = scrollerRef.current;
        if (e && distance(e) > 1 && distance(e) < scrollSpec.snapZone) scrollToBottom(true);
      }, scrollSpec.snapIdleMs);
    }
  }, [interrupt, scrollToBottom, setOpen]);

  useEffect(
    () => () => {
      clearTimeout(idleTimer.current);
      clearTimeout(releaseTimer.current);
      snapAnim.current?.stop();
    },
    [],
  );

  return {
    scrollerRef,
    farFromEnd,
    atEnd,
    open,
    setOpen,
    pull,
    isPinned: () => pinned.current,
    scrollToBottom,
    handlers: {
      onScroll,
      onWheel: (e) => {
        interrupt();
        addPull(e.deltaY);
      },
      onTouchStart: (e) => {
        interrupt();
        touchY.current = e.touches[0]?.clientY ?? null;
      },
      onTouchMove: (e) => {
        const y = e.touches[0]?.clientY;
        if (y === undefined || touchY.current === null) return;
        addPull(touchY.current - y);
        touchY.current = y;
      },
      onTouchEnd: () => {
        touchY.current = null;
        release();
      },
    },
  };
}
