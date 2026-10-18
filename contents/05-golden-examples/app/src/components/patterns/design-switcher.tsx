"use client";

import { Check, Palette } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { durations, fade, springs } from "@/lib/motion";
import { PACKS, useDesign, type Dir, type MotionPref, type Theme } from "./design-provider";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-pill bg-surface-sunken p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-8 rounded-pill px-3 text-sm transition-colors duration-(--ds-duration-ui) ease-soft",
              active ? "bg-surface-raised text-ink shadow-sm" : "text-ink-2 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Runtime switcher for the design system itself: palette pack, light/dark, LTR/RTL (with language), motion. */
export function DesignSwitcher() {
  const d = useDesign();
  const { t } = d;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const pages = [
    { href: "/", label: t("overview") },
    { href: "/landing", label: t("exLanding") },
    { href: "/auth", label: t("exAuth") },
    { href: "/chat", label: t("exChat") },
    { href: "/dashboard", label: t("exDashboard") },
  ];
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const theme: ReadonlyArray<{ value: Theme; label: string }> = [
    { value: "light", label: t("light") },
    { value: "dark", label: t("dark") },
    { value: "system", label: t("system") },
  ];
  const dir: ReadonlyArray<{ value: Dir; label: string }> = [
    { value: "ltr", label: "LTR · EN" },
    { value: "rtl", label: "RTL · עב" },
  ];
  const motionOpts: ReadonlyArray<{ value: MotionPref; label: string }> = [
    { value: "on", label: t("motionOn") },
    { value: "off", label: t("motionOff") },
  ];

  return (
    <div ref={rootRef} data-design-switcher className="fixed bottom-4 end-4 z-(--ds-z-toast) flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="group"
            aria-label={t("designPanel")}
            initial={d.motionOk ? { opacity: 0, y: 12, filter: "blur(6px)" } : { opacity: 0 }}
            animate={d.motionOk ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1 }}
            exit={d.motionOk ? { opacity: 0, y: 8 } : { opacity: 0 }}
            transition={d.motionOk ? springs.overlay : fade}
            className="glass w-[min(22rem,calc(100vw-2rem))] rounded-sheet p-4"
          >
            <p className="ds-label mb-2">{t("examples")}</p>
            <nav aria-label={t("examples")} className="mb-4 flex flex-wrap gap-1">
              {pages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  aria-current={pathname === p.href ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-pill px-3 text-sm transition-colors duration-(--ds-duration-ui) ease-soft",
                    pathname === p.href ? "bg-surface-raised text-ink" : "text-ink-2 hover:bg-surface-raised/60 hover:text-ink",
                  )}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
            <p className="ds-label mb-2">{t("designPack")}</p>
            <ul className="mb-4 grid gap-1">
              {PACKS.map((p) => {
                const active = p.id === d.pack;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => d.setPack(p.id)}
                      className={cn(
                        "flex min-h-touch w-full items-center gap-3 rounded-pill px-3 text-start text-sm transition-colors duration-(--ds-duration-ui) ease-soft",
                        active ? "bg-surface-raised text-ink" : "text-ink-2 hover:bg-surface-raised/60 hover:text-ink",
                      )}
                    >
                      <span aria-hidden className="relative block size-6 shrink-0 overflow-hidden rounded-pill border border-hairline-strong">
                        <span className="absolute inset-0" style={{ background: p.swatch.canvas }} />
                        <span className="absolute inset-y-0 start-1/3 w-1/3" style={{ background: p.swatch.accent }} />
                        <span className="absolute inset-y-0 end-0 w-1/3" style={{ background: p.swatch.secondary }} />
                      </span>
                      <span className="flex-1 truncate">{p.name}</span>
                      {active && <Check aria-hidden size={16} weight="light" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="grid gap-3">
              <div>
                <p className="ds-label mb-2">{t("designMode")}</p>
                <Segmented label={t("designMode")} value={d.theme} options={theme} onChange={d.setTheme} />
              </div>
              <div>
                <p className="ds-label mb-2">{t("designDir")}</p>
                <Segmented label={t("designDir")} value={d.dir} options={dir} onChange={d.setDir} />
              </div>
              <div>
                <p className="ds-label mb-2">{t("designMotion")}</p>
                <Segmented label={t("designMotion")} value={d.motion} options={motionOpts} onChange={d.setMotion} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("designPanel")}
        onClick={() => setOpen((o) => !o)}
        whileTap={d.motionOk ? { scale: 0.98 } : undefined}
        transition={{ duration: durations.press }}
        className="glass lift grid size-touch place-items-center rounded-pill text-ink"
      >
        <Palette aria-hidden size={20} weight="light" />
      </motion.button>
    </div>
  );
}
