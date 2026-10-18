"use client";

import { animate, createDrawable } from "animejs";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useDesign } from "@/components/patterns/design-provider";
import { cn } from "@/lib/cn";
import { durations, fade } from "@/lib/motion";

export interface ChartSeries {
  id: string;
  name: string;
  values: readonly number[];
  /** The emphasised series wears the accent; the rest recede to gray (the "emphasis" form). */
  emphasis: boolean;
}

interface LineChartProps {
  series: readonly ChartSeries[];
  /** Short tick label for index i, e.g. "W3". */
  tick: (i: number) => string;
  /** Tooltip heading for index i, e.g. "Week 3". */
  heading: (i: number) => string;
  /** Screen-reader sentence for index i. */
  announce: (i: number) => string;
  describe: string;
  className?: string;
}

const HEIGHT = 280;
const PAD = { top: 24, right: 48, bottom: 32, left: 40 }; // ds-allow-physical

const compact = (n: number) => (n >= 1000 ? `${n / 1000}K` : String(n));

/**
 * Hand-built SVG line chart following the dataviz rules: 2px lines, accent vs gray emphasis, area wash at 10%,
 * hairline solid grid, 8px end dots with a 2px surface ring, legend + selective direct labels, crosshair that
 * snaps to the nearest X, one tooltip for every series, keyboard stepping, text in text tokens only.
 * The time axis runs left to right in both directions (numbers and dates do not mirror); text blocks follow the page.
 */
export function LineChart({ series, tick, heading, announce, describe, className }: LineChartProps) {
  const { motionOk, dir, locale } = useDesign();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const drawn = useRef(false);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = series[0]?.values.length ?? 0;
  const max = Math.max(...series.flatMap((s) => [...s.values]));
  const yMax = Math.ceil(max / 100) * 100;
  const ticks = Array.from({ length: yMax / 100 + 1 }, (_, i) => i * 100);
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i * plotW) / (n - 1));
  const y = (v: number) => PAD.top + plotH * (1 - v / yMax);
  const line = (vals: readonly number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const lead = series.find((s) => s.emphasis) ?? series[0];
  const area = lead ? `${line(lead.values)} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z` : "";
  const fmt = new Intl.NumberFormat(locale);

  // draw the lines in once, when the chart first has a real width
  useEffect(() => {
    if (!motionOk || drawn.current || !wrap.current) return;
    drawn.current = true;
    const lines = createDrawable(wrap.current.querySelectorAll("[data-line]"));
    const run = animate(lines, { draw: ["0 0", "0 1"], duration: durations.hero * 1000 * 1.2, ease: "inOutQuad", onComplete: () => run.revert() });
    return () => {
      run.revert();
    };
  }, [motionOk]);

  const nearest = (clientX: number, rect: DOMRect) => {
    const rel = clientX - rect.left - PAD.left;
    return Math.min(n - 1, Math.max(0, Math.round((rel / plotW) * (n - 1))));
  };
  const onMove = (e: PointerEvent<SVGRectElement>) => setActive(nearest(e.clientX, wrap.current!.getBoundingClientRect()));
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = active ?? n - 1;
    if (e.key === "ArrowRight") setActive(Math.min(n - 1, cur + 1));
    else if (e.key === "ArrowLeft") setActive(Math.max(0, cur - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else return;
    e.preventDefault();
  };

  const tipLeft = active === null ? 0 : Math.min(width - 168, Math.max(8, x(active) + 16));

  return (
    <div className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4", className)}>
      {/* legend: always present for two or more series; line keys mirror the marks */}
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
        {series.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span aria-hidden className={cn("block h-0.5 w-4 rounded-pill", s.emphasis ? "bg-brand-ui" : "bg-ink-3")} />
            {s.name}
          </li>
        ))}
      </ul>

      <div
        ref={wrap}
        dir="ltr"
        role="group"
        aria-label={describe}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => {
          setFocused(true);
          setActive((a) => a ?? n - 1);
        }}
        onBlur={() => {
          setFocused(false);
          setActive(null);
        }}
        onPointerLeave={() => !focused && setActive(null)}
        className="relative min-w-0 touch-pan-y rounded-sm"
      >
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="block w-full max-w-full overflow-visible" aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-hairline" strokeWidth={1} />
              <text x={PAD.left - 12} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-2 text-xs tabular-nums">
                {compact(t)}
              </text>
            </g>
          ))}
          {Array.from({ length: n }, (_, i) =>
            i % 2 === 0 ? (
              <text key={i} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-2 text-xs">
                {tick(i)}
              </text>
            ) : null,
          )}

          <motion.path d={area} className="fill-brand-ui/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={motionOk ? { ...fade, duration: durations.hero * 1.4, delay: 0.5 } : fade} />

          {[...series].sort((a, b) => Number(a.emphasis) - Number(b.emphasis)).map((s) => (
            <path
              key={s.id}
              data-line
              d={line(s.values)}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className={s.emphasis ? "stroke-brand-ui" : "stroke-ink-3"}
            />
          ))}

          {/* direct labels, sparingly: the value at each line's end */}
          {series.map((s) => {
            const last = s.values[n - 1] ?? 0;
            return (
              <g key={s.id}>
                <circle cx={x(n - 1)} cy={y(last)} r={4} strokeWidth={2} className={cn("stroke-surface", s.emphasis ? "fill-brand-ui" : "fill-ink-3")} />
                <text x={x(n - 1) + 12} y={y(last)} dy="0.32em" className={cn("text-xs tabular-nums", s.emphasis ? "fill-ink font-medium" : "fill-ink-2")}>
                  {fmt.format(last)}
                </text>
              </g>
            );
          })}

          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-hairline-strong" strokeWidth={1} />
              {series.map((s) => (
                <circle key={s.id} cx={x(active)} cy={y(s.values[active] ?? 0)} r={4} strokeWidth={2} className={cn("stroke-surface", s.emphasis ? "fill-brand-ui" : "fill-ink-3")} />
              ))}
            </g>
          )}
          {/* hit layer: far larger than any mark, snaps to the nearest week */}
          <rect x={PAD.left - 8} y={0} width={plotW + 16} height={HEIGHT} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} />
        </svg>

        {active !== null && (
          <div
            dir={dir}
            className="glass pointer-events-none absolute top-2 grid w-40 gap-1 rounded-sm p-3 text-xs"
            style={{ left: tipLeft /* ds-allow-physical: chart plot is LTR geometry */ }}
          >
            <p className="text-ink-2">{heading(active)}</p>
            {series.map((s) => (
              <p key={s.id} className="flex items-center gap-2">
                <span aria-hidden className={cn("block h-0.5 w-3 rounded-pill", s.emphasis ? "bg-brand-ui" : "bg-ink-3")} />
                <span className="text-sm font-medium tabular-nums text-ink">{fmt.format(s.values[active] ?? 0)}</span>
                <span className="truncate text-ink-2">{s.name}</span>
              </p>
            ))}
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {focused && active !== null ? announce(active) : ""}
        </p>
      </div>
    </div>
  );
}
