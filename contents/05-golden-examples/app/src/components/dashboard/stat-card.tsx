import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/ui/card";

/** Stat tile: sentence-case label, proportional sans value, signed delta against a named period (arrow + sign + tone). */
export function StatCard({ label, value, delta, deltaLabel }: { label: string; value: string; delta: string; deltaLabel: string }) {
  return (
    <GlowCard className="grid gap-3 p-6">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="text-3xl font-medium leading-heading text-ink">{value}</p>
      <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
        <Badge tone="success">
          <ArrowUp aria-hidden size={12} weight="bold" />
          {delta}
        </Badge>
        {deltaLabel}
      </p>
    </GlowCard>
  );
}
