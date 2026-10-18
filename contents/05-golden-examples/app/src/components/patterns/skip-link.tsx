"use client";

import { useT } from "./design-provider";

export function SkipLink() {
  const { t } = useT();
  return (
    <a
      href="#main"
      className="fixed start-4 top-4 z-(--ds-z-toast) -translate-y-24 rounded-pill bg-brand-solid px-4 py-2 text-sm text-on-brand focus:translate-y-0"
    >
      {t("skip")}
    </a>
  );
}
