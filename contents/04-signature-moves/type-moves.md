> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# Type moves

## 1. Ghost oversized numerals

Huge, low-contrast serif numbers that mark chapters or sections (`01`, `02`...). Chosen from the reference portfolio's chapter-based, serif-numeral editorial feel.

| | |
|---|---|
| Font | `font-display`, weight 400 |
| Size | `text-numeral-ghost` (fluid 8rem → 20rem) |
| Color | `text-primary` at opacity **0.04–0.08** (never a color from the accent family) |
| Position | absolute, anchored to the inline-end (or inline-start) edge of the section, cropped slightly by the section's `overflow: hidden`; behind the content (`z-index` below content) |
| Semantics | `aria-hidden="true"`, `pointer-events: none`, `user-select: none`; the section's real number, if meaningful, also appears as a tracked label (`01 / Chapter`) |
| Motion | optional parallax at 0.85× scroll speed (Motion `useScroll`); none under reduced motion |
| Digits | always Latin digits, also in Hebrew (visual form) |
| Limit | one per section, at most three per page |

It is decoration (UI rule U11). It must never be the only carrier of any information and never sit behind small text with less than AA after the opacity: place it on empty space.

## 2. Tracked small-caps labels

Tiny, widely tracked uppercase eyebrows above headings and above grouped content.

| | |
|---|---|
| Size | `text-2xs` (11px) |
| Transform | uppercase |
| Tracking | `tracking-label` (0.18em) |
| Weight | 500 |
| Color | `text-secondary` (≥7:1) |
| Use | above headings, card categories, metadata; keep to 1–3 words |
| Not | body copy, buttons, long strings |

**Hebrew:** no uppercase exists and tracking damages letter joins. `[dir="rtl"]` sets `--ds-tracking-label: 0`. Hebrew labels use `text-sm` (14px), weight 500, `text-secondary`, with a short phrase. The visual hierarchy comes from size/weight and spacing instead of caps. Use `lang` and `dir` correctly so `text-transform: uppercase` is a no-op rather than a bug.

## 3. Hebrew type notes

- Display fallback `Frank Ruhl Libre` pairs well with Cormorant; weight 400–500.
- Body `Heebo` 400/500; avoid weight 300 below 18px.
- Hebrew display needs +0.05 line-height versus Latin (tokens handle body; for display set `leading-[1.1]` in RTL).
- Do not letter-space Hebrew at any size.
- Punctuation and numerals: wrap Latin runs in `<bdi>`.

## 4. Deliberately *not* in the catalog

The reference list suggested other type moves (serif italic accent words, line-by-line mask reveals); they were **not selected**. They may be added later; until then, agents do not use them. Hebrew has no italics, which is a further reason the serif-italic accent move is left out.
