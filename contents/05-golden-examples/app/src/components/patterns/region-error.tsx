"use client";

import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useT } from "./design-provider";

/** Contained inline recovery: the failure stays in the region that failed; the rest of the page keeps working. */
export function RegionError({ onRetry, title, body, className, loading }: { onRetry: () => void; title?: string; body?: string; className?: string; loading?: boolean }) {
  const { t } = useT();
  return (
    <div role="alert" className={cn("grid place-items-center gap-3 rounded-card border border-danger-border bg-danger-bg px-6 py-8 text-center", className)}>
      <WarningCircle aria-hidden size={28} weight="light" className="text-danger" />
      <div className="grid max-w-reading gap-1">
        <p className="font-medium text-ink">{title ?? t("errTitle")}</p>
        <p className="text-sm text-ink-2">{body ?? t("errBody")}</p>
      </div>
      <Button variant="quiet" size="sm" onClick={onRetry} loading={loading}>
        {!loading && <ArrowClockwise aria-hidden size={16} weight="light" />}
        {t("retry")}
      </Button>
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
}

/** Catches render errors in one region and offers the same Retry. */
export class RegionBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("region failed", error, info.componentStack);
  }
  reset = () => this.setState({ failed: false });
  render() {
    return this.state.failed ? this.props.fallback(this.reset) : this.props.children;
  }
}
