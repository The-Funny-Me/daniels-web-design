> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# 02 · Direction, language and RTL

Hebrew (RTL) and English (LTR) are first-class. Direction support is not a final polish pass; it is a property of every component from the first line.

## Setup
- Set `lang` and `dir` on `<html>` (`dir="rtl" lang="he"`). Never flip with CSS `direction` on arbitrary elements. Isolate mixed-direction runs with `<bdi>` or `dir="auto"` (usernames, emails, numbers in prose).
- Fonts: every font stack ends with a Hebrew fallback (display `Frank Ruhl Libre`, body `Heebo`). They are already in the tokens.
- `[dir="rtl"]` raises body line-height to 1.65 automatically.

## Layout
- Logical properties only: `margin-inline`, `padding-inline`, `inset-inline-start/end`, `border-inline-start`, `text-align: start`; Tailwind `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s-* rounded-e-*`.
- For centered or offset transforms that use `translate-x`, pair with `rtl:` (e.g. `-translate-x-1/2 rtl:translate-x-1/2`).
- Flex and grid follow direction automatically; never reorder with `row-reverse` to fake RTL.
- Mirror directional icons (arrows, chevrons, back/forward, send) with `rtl:-scale-x-100`. Do **not** mirror: logos, media controls (play), clocks, checkmarks, charts' time axes (`LineChart` keeps the time axis plot `dir="ltr"` while tooltips and surrounding text follow `dir`).
- Progress, sliders and timelines run in the reading direction; the undo toast drain hairline sets `--drain-origin: 0% 50%` in LTR and `100% 50%` in RTL.
- Numbers and Latin runs inside Hebrew text stay LTR; wrap with `<bdi>` when dynamic (e.g. `24 / 7`, `3 : 1`, `28 dB`).

## Typography in RTL
- No italics, no small caps. In RTL `<em>` uses `font-style: normal` and weight 500 rather than synthetic oblique.
- Labels: no uppercase and **no letter-spacing** in Hebrew (tracking breaks letterform joins and reads wrong). `.ds-label` switches to `font-size: var(--ds-text-sm)` and `--ds-tracking-label: 0` under `:root[dir="rtl"]`.
- Display tracking and leading: `:root[dir="rtl"]` zeroes `--ds-tracking-display` and raises `--ds-leading-display` to `1.12`.
- Ghost numerals stay Latin digits (they are visual form, `aria-hidden`). Hero and stat figures use the proportional sans face (`font-sans tabular-nums`), not the display serif.
- Prefer `Heebo` 400/500; avoid weight 300 below 18px (thin Hebrew strokes fail).

## Animation direction
- Slides, reveals and sheets enter from the **inline-start/end** side, not a fixed left/right. Use `translateX(calc(var(--ds-dir) * ...))` where `--ds-dir` is `1` in LTR and `-1` in RTL (set once on `:root` and `:root[dir="rtl"]`).
- Staggers run in reading order (right-to-left in RTL).
- Typing and dotting animations (see `animated-inputs.md`) write and convert in the page's reading direction (`useCycler` + `AnimatedInput`). The input and its `aria-hidden` overlay share the page direction, and RTL demos use Hebrew password examples so masking sweeps right-to-left naturally.
- Marquees and carousels start at inline-start.

## Testing
- Every golden example ships with a live LTR/RTL toggle (`DesignSwitcher` or `?dir=rtl`, which switches both direction and language `en` ↔ `he`). A component is not done until it has been viewed in RTL at both desktop (`1280×860`) and mobile (`390×844`).
- Check: icon mirroring, label rendering without tracking, chart time axis kept LTR with localized tooltip, focus ring and tab order, text overflow with long Hebrew strings, mixed English/Hebrew lines.
