"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useT } from "./design-provider";
import { Overlay } from "./overlay";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** The phrase the person must type. The irreversible action stays disabled until it matches. */
  phrase: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * Irreversible actions only (reversible ones get an undo toast instead).
 * Cancel holds initial focus, the scrim does not dismiss, and confirmation requires typing the phrase.
 */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, phrase, onConfirm }: ConfirmDialogProps) {
  const { t } = useT();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = typed.trim().toLowerCase() === phrase.toLowerCase();

  const close = (next: boolean) => {
    if (!next) setTyped("");
    onOpenChange(next);
  };

  return (
    <Overlay
      open={open}
      onOpenChange={close}
      variant="modal"
      title={title}
      description={description}
      dismissOnScrim={false}
      initialFocus={() => cancelRef.current}
      showClose={false}
    >
      <form
        className="grid gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!matches || busy) return;
          setBusy(true);
          try {
            await onConfirm();
            close(false);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label={t("typeToConfirm", { phrase })}>
          {(control) => (
            <Input {...control} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} />
          )}
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="quiet" onClick={() => close(false)}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="danger" disabled={!matches} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Overlay>
  );
}
