"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { durations, ease, fade, springs } from "@/lib/motion";
import { useDesign } from "./design-provider";

interface OverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** sheet: glass panel docked to the inline-end edge. modal: centred glass dialog. */
  variant?: "sheet" | "modal";
  /** Clicking the scrim closes it. Off for confirmations: a destructive decision is never dismissed by a stray click. */
  dismissOnScrim?: boolean;
  /** Receives focus when it opens (Radix focuses the first focusable otherwise). Confirmations focus Cancel. */
  initialFocus?: () => HTMLElement | null;
  className?: string;
  showClose?: boolean;
}

/**
 * The single overlay primitive. Glass panel over a blurred scrim, focus trapped by Radix, Esc closes.
 * Entrance: 12px rise + blur-in on the critically damped overlay spring (no overshoot). Motion off: opacity only.
 */
export function Overlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "sheet",
  dismissOnScrim = true,
  initialFocus,
  className,
  showClose = true,
}: OverlayProps) {
  const { t, motionOk } = useDesign();
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    } else if (triggerRef.current && document.contains(triggerRef.current)) {
      const target = triggerRef.current;
      triggerRef.current = null;
      requestAnimationFrame(() => {
        if (document.contains(target)) target.focus();
      });
    }
  }, [open]);

  const hidden = motionOk ? { opacity: 0, y: 12, filter: "blur(8px)" } : { opacity: 0 };
  const shown = motionOk ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1 };
  const exit = motionOk
    ? { opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: durations.ui, ease: ease.soft } }
    : { opacity: 0, transition: fade };

  const contentProps: Partial<ComponentProps<typeof Dialog.Content>> = {
    onOpenAutoFocus: (e) => {
      const el = initialFocus?.();
      if (el) {
        e.preventDefault();
        el.focus();
      }
    },
    ...(dismissOnScrim ? {} : { onPointerDownOutside: (e) => e.preventDefault(), onInteractOutside: (e) => e.preventDefault() }),
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="scrim fixed inset-0 z-(--ds-z-overlay) bg-scrim backdrop-blur-(--ds-scrim-blur)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount {...contentProps}>
              <motion.div
                className={cn(
                  "glass fixed z-(--ds-z-modal) flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-sheet",
                  variant === "sheet"
                    ? "inset-y-4 end-4 w-[min(28rem,calc(100vw-2rem))]"
                    : "inset-0 m-auto h-fit w-[min(30rem,calc(100vw-2rem))]",
                  className,
                )}
                initial={hidden}
                animate={shown}
                exit={exit}
                transition={motionOk ? springs.overlay : fade}
              >
                <div className="flex items-start justify-between gap-4 px-6 pt-6">
                  <div className="grid gap-1">
                    <Dialog.Title className="font-display text-2xl leading-heading text-ink">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="text-sm text-ink-2">{description}</Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{title}</Dialog.Description>
                    )}
                  </div>
                  {showClose && (
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon" aria-label={t("close")} className="-me-2 -mt-2">
                        <X aria-hidden size={20} weight="light" />
                      </Button>
                    </Dialog.Close>
                  )}
                </div>
                <div className="overflow-y-auto px-6 pb-6 pt-4">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export const GlassSheet = (props: Omit<OverlayProps, "variant">) => <Overlay {...props} variant="sheet" />;
