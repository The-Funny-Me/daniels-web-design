#!/usr/bin/env node
/**
 * check-raw-values.mjs
 *
 * Scans `src/` (`*.ts`, `*.tsx`, `*.css`, excluding generated `src/design/`) and fails on:
 * 1. Raw color literals: `#hex`, `rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(`.
 *    - Exempted in `src/app/globals.css`: the documented specular glint highlight
 *      `rgb(255 255 255 / 0.38)` and the inline SVG fractalNoise data URI (`%23n`).
 *    - `color-mix(in oklch, var(--ds-...) ...)` and `color-mix(in srgb, var(--ds-...) ...)`
 *      referencing `--ds-*` tokens are allowed.
 * 2. Tailwind default palette utilities (`slate-`, `gray-`, `zinc-`, `neutral-`, `stone-`,
 *    `red-`, `orange-`, `amber-`, `yellow-`, `lime-`, `green-`, `emerald-`, `teal-`,
 *    `cyan-`, `sky-`, `blue-`, `indigo-`, `violet-`, `purple-`, `fuchsia-`, `pink-`, `rose-`,
 *    plus `bg-white`, `bg-black`, `text-white`, `text-black`).
 * 3. Physical directional classes & CSS properties:
 *    - Tailwind classes: `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`,
 *      `text-left`, `text-right`, `rounded-l-*`, `rounded-r-*`, `border-l-*`, `border-r-*`
 *    - Inline style / CSS properties: `left:`, `right:`, `margin-left:`, `margin-right:`,
 *      `padding-left:`, `padding-right:`, `text-align: left`, `text-align: right`
 *    - Lines containing `ds-allow-physical` are exempt (e.g., LTR time-axis chart tooltip geometry).
 *    - DOM `getBoundingClientRect().left` / `.right` property access is not a CSS rule and is allowed.
 * 4. Banned spacing steps (`5`, `7`, `9`, `10`, `11`) on spacing utilities (`p-`, `px-`, `py-`,
 *    `ps-`, `pe-`, `pt-`, `pb-`, `m-`, `mx-`, `my-`, `ms-`, `me-`, `mt-`, `mb-`, `gap-`,
 *    `gap-x-`, `gap-y-`, `space-x-`, `space-y-`, `top-`, `bottom-`, `start-`, `end-`, `inset-`,
 *    `size-`, `w-`, `h-`).
 *
 * Documented structural allowances:
 * - SVG geometry attributes (`viewBox`, `cx`, `cy`, `r`, `x`, `y`, `width`, `height`, `rx`,
 *   `strokeWidth`, `fill="none"`, `fill="transparent"`, `fill="currentColor"`).
 * - Responsive clamp/viewport widths (`w-[min(24rem,calc(100vw-2rem))]`) and ambient radial light
 *   diameters (`size-[36rem]`, `size-[44rem]`, `size-[48rem]`).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "../src");
const DESIGN_DIR = path.resolve(SRC_DIR, "design");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full === DESIGN_DIR || full.startsWith(DESIGN_DIR + path.sep)) continue;
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const HEX_COLOR_RE = /(?<![A-Za-z0-9_-])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const FUNC_COLOR_RE = /\b(?:rgba?|hsla?|oklch)\s*\(/g;

const TW_PALETTE_RE =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b|\b(?:bg|text|border)-(?:white|black)\b/g;

const PHYSICAL_CLASS_RE =
  /(?:^|[\s"'`:])(?:-?(?:ml|mr|pl|pr|left|right)-(?:\d+|px|auto|full|1\/2|\[[^\]]+\])|text-(?:left|right)|rounded-(?:l|r|tl|tr|bl|br)(?:-[a-z0-9]+)?|border-(?:l|r)(?:-\d+)?)(?=[\s"'`]|$)/g;

const PHYSICAL_STYLE_RE =
  /(?:^|[\s;{])(?:left|right|marginLeft|marginRight|paddingLeft|paddingRight|margin-left|margin-right|padding-left|padding-right)\s*:/g;

const BANNED_SPACING_RE =
  /(?:^|[\s"'`:])(?:-?(?:p|px|py|ps|pe|pt|pb|m|mx|my|ms|me|mt|mb|gap|gap-x|gap-y|space-x|space-y|top|bottom|start|end|inset|inset-x|inset-y|size|w|h)-(?:5|7|9|10|11))(?=[\s"'`]|$)/g;

const violations = [];

for (const file of walk(SRC_DIR)) {
  const rel = path.relative(path.resolve(__dirname, ".."), file);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const isGlobalsCss = rel.replace(/\\/g, "/") === "src/app/globals.css";

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return;
    }

    const allowPhysical = line.includes("ds-allow-physical");

    // 1. Raw hex colors (ignore URL hash fragments like href="#suites" or id="#..." or %23n)
    for (const match of line.matchAll(HEX_COLOR_RE)) {
      const token = match[0];
      const before = line.slice(0, match.index);
      // Skip anchor links like href="#suites" or "#top" or "#main"
      if (/(?:href|id)=\s*["']$/.test(before) || /["']#[a-zA-Z]/.test(line.slice(match.index - 1, match.index + 3))) {
        if (!/^#[0-9a-fA-F]{3,8}$/.test(token)) continue;
      }
      violations.push(`${rel}:${lineNo} [raw-hex] ${token}`);
    }

    // 2. Functional colors: rgb(), hsl(), oklch()
    for (const match of line.matchAll(FUNC_COLOR_RE)) {
      if (isGlobalsCss && line.includes("rgb(255 255 255 / 0.38)")) continue;
      violations.push(`${rel}:${lineNo} [raw-color-fn] ${match[0]})`);
    }

    // 3. Tailwind default color palette classes
    for (const match of line.matchAll(TW_PALETTE_RE)) {
      violations.push(`${rel}:${lineNo} [tw-palette] ${match[0]}`);
    }

    // 4. Physical directional utilities and styles
    if (!allowPhysical) {
      for (const match of line.matchAll(PHYSICAL_CLASS_RE)) {
        violations.push(`${rel}:${lineNo} [physical-class] ${match[0].trim()}`);
      }
      for (const match of line.matchAll(PHYSICAL_STYLE_RE)) {
        violations.push(`${rel}:${lineNo} [physical-style] ${match[0].trim()}`);
      }
    }

    // 5. Banned spacing steps (5, 7, 9, 10, 11)
    for (const match of line.matchAll(BANNED_SPACING_RE)) {
      violations.push(`${rel}:${lineNo} [banned-spacing-step] ${match[0].trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error(`check:raw failed with ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
} else {
  console.log("check:raw passed — 0 raw value or physical property violations found.");
}
