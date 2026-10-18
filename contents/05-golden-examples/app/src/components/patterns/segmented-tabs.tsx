"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { fade, springs } from "@/lib/motion";
import { useDesign } from "./design-provider";

interface Tab<T extends string> {
  value: T;
  label: string;
}

/** Accessible tablist (roving tabindex, arrow keys that respect direction) with a sliding pill on the `ui` spring. */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idPrefix,
  className,
}: {
  tabs: ReadonlyArray<Tab<T>>;
  value: T;
  onChange: (v: T) => void;
  label: string;
  idPrefix: string;
  className?: string;
}) {
  const { dir, motionOk } = useDesign();
  const group = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = dir === "rtl" ? { next: "ArrowLeft", prev: "ArrowRight" } : { next: "ArrowRight", prev: "ArrowLeft" };
    const i = tabs.findIndex((t) => t.value === value);
    let n = i;
    if (e.key === keys.next) n = (i + 1) % tabs.length;
    else if (e.key === keys.prev) n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    else return;
    e.preventDefault();
    const next = tabs[n];
    if (next) {
      onChange(next.value);
      refs.current[n]?.focus();
    }
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className={cn("grid auto-cols-fr grid-flow-col rounded-pill bg-surface-sunken p-1", className)}>
      {tabs.map((tab, i) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idPrefix}-tab-${tab.value}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative min-h-touch rounded-pill px-6 text-sm font-medium transition-colors duration-(--ds-duration-ui) ease-soft",
              active ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${group}-pill`}
                aria-hidden
                className="absolute inset-0 rounded-pill bg-surface-raised shadow-sm"
                transition={motionOk ? springs.ui : fade}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
