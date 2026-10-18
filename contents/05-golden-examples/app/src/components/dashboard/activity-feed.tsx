"use client";

import { useDesign } from "@/components/patterns/design-provider";

const AGO: ReadonlyArray<[number, Intl.RelativeTimeFormatUnit]> = [
  [-5, "minute"],
  [-32, "minute"],
  [-2, "hour"],
  [-6, "hour"],
];

export function ActivityFeed() {
  const { tl, locale } = useDesign();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return (
    <ol className="grid gap-4">
      {tl("dashActivities").map((text, i) => {
        const [value, unit] = AGO[i] ?? AGO[0]!;
        return (
          <li key={text} className="grid grid-cols-[auto_1fr] items-start gap-3">
            <span aria-hidden className="mt-2 block size-2 rounded-pill bg-brand-ui" />
            <div className="grid gap-1">
              <p className="text-ink">{text}</p>
              <p className="text-sm text-ink-2">{rtf.format(value, unit)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
