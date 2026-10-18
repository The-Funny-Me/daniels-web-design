# 02 · Direction, language and RTL

Hebrew (RTL) and English (LTR) are first-class. Direction support is not a final polish pass; it is a property of every component from the first line.

## Setup
- Set `lang` and `dir` on `<html>` (`dir="rtl" lang="he"`). Never flip with CSS `direction` on arbitrary elements. Isolate mixed-direction runs with `<bdi>` or `dir="auto"` (usernames, emails, numbers in prose).
- Fonts: every font stack ends with a Hebrew fallback (display `Frank Ruhl Libre`, body `Heebo`). They are already in the tokens.
- `[dir="rtl"]` raises body line-height to 1.65 automatically.

## Layout
- Logical properties only: `margin-inline`, `padding-inline`, `inset-inline-start/end`, `border-inline-start`, `text-align: start`; Tailwind `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s-* rounded-e-*`.
- Flex and grid follow direction automatically; never reorder with `row-reverse` to fake RTL.
- Mirror directional icons (arrows, chevrons, back/forward, send) with `rtl:-scale-x-100`. Do **not** mirror: logos, media controls (play), clocks, checkmarks, charts' time axes unless the locale convention differs.
- Progress, sliders and timelines run in the reading direction.
- Numbers and Latin runs inside Hebrew text stay LTR; wrap with `<bdi>` when dynamic.

## Typography in RTL
- No italics, no small caps. For "serif italic accent word": in RTL use `Frank Ruhl Libre` at weight 500 plus the accent color instead of italic.
- Labels: no uppercase and **no letter-spacing** in Hebrew (tracking breaks letterform joins and reads wrong). Use `text-sm`, weight 500, `text-secondary`. Under `[dir="rtl"]` override `tracking-label` to `0`.
- Ghost numerals stay Latin digits (they are visual form, `aria-hidden`).
- Prefer `Heebo` 400/500; avoid weight 300 below 18px (thin Hebrew strokes fail).

## Animation direction
- Slides, reveals and sheets enter from the **inline-start/end** side, not a fixed left/right. Use `translateX(calc(var(--dir) * 12px))` where `--dir` is `1` in LTR and `-1` in RTL (set once on `:root` and `:root[dir="rtl"]`).
- Staggers run in reading order (right-to-left in RTL).
- Typing and dotting animations (see `animated-inputs.md`) write and convert in the reading direction. A password example being masked sweeps inline-start → inline-end.
- Marquees and carousels start at inline-start.

## Testing
- Every golden example ships with a live LTR/RTL toggle and Hebrew sample content. A component is not done until it has been viewed in RTL.
- Check: icon mirroring, label rendering without tracking, focus ring and tab order, text overflow with long Hebrew strings, mixed English/Hebrew lines.
