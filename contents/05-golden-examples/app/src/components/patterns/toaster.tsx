"use client";

import { Check, WarningCircle, X } from "@phosphor-icons/react";
import { Toaster, toast } from "sonner";
import { useDesign } from "./design-provider";

/** Sonner, fully unstyled: every toast is our own glass markup so it follows the active pack, theme and direction. */
export function AppToaster() {
  const { dir } = useDesign();
  return (
    <Toaster
      position={dir === "rtl" ? "bottom-right" : "bottom-left"}
      dir={dir}
      visibleToasts={3}
      gap={8}
      offset={{ bottom: 16, left: 16, right: 16 }}
      mobileOffset={{ bottom: 80, left: 16, right: 16 }}
      toastOptions={{ unstyled: true }}
    />
  );
}

export const UNDO_MS = 8000;

interface UndoOptions {
  message: string;
  undoLabel: string;
  closeLabel: string;
  onUndo: () => void;
}

/** Reversible action: act immediately, offer Undo for 8 seconds. A hairline drains to show how long is left. */
export function undoToast({ message, undoLabel, closeLabel, onUndo }: UndoOptions): string | number {
  return toast.custom(
    (id) => (
      <div role="status" className="glass relative flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 overflow-hidden rounded-card py-2 ps-4 pe-2 text-sm text-ink">
        <Check aria-hidden size={18} weight="light" className="shrink-0 text-brand-text" />
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={() => {
            onUndo();
            toast.dismiss(id);
          }}
          className="lift min-h-touch rounded-pill px-3 text-brand-text underline-offset-4 hover:underline"
        >
          {undoLabel}
        </button>
        <button
          type="button"
          aria-label={closeLabel}
          onClick={() => toast.dismiss(id)}
          className="grid size-touch place-items-center rounded-pill text-ink-2 hover:text-ink"
        >
          <X aria-hidden size={16} weight="light" />
        </button>
        <span
          aria-hidden
          data-anim
          className="absolute inset-x-0 bottom-0 block h-px origin-(--drain-origin) bg-brand-ui"
          style={{ animation: `drain ${UNDO_MS}ms linear forwards` }}
        />
      </div>
    ),
    { duration: UNDO_MS },
  );
}

/** Quiet confirmation or failure that needs no action. */
export function noticeToast(message: string, tone: "ok" | "error" = "ok"): string | number {
  return toast.custom(
    () => (
      <div role="status" className="glass flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 rounded-card px-4 py-3 text-sm text-ink">
        {tone === "ok" ? (
          <Check aria-hidden size={18} weight="light" className="shrink-0 text-brand-text" />
        ) : (
          <WarningCircle aria-hidden size={18} weight="light" className="shrink-0 text-danger" />
        )}
        <span>{message}</span>
      </div>
    ),
    { duration: 4000 },
  );
}
