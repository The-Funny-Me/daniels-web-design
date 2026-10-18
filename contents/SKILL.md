---
name: web-design
description: Build web UI (landing pages, apps, dashboards, auth, chat) in a luxury, minimal, spacious style using a token-driven design system with swappable palette packs, strict UI/UX rules, Good Design Anatomy physics, a fixed Next.js + Tailwind v4 + shadcn/ui stack, and signature motion. Use for any request to design, build, restyle or review front-end UI.
---

# /web-design

Luxury, spacious, token-driven UI. Feeling: white velvet sheets in a golden hotel room. Few elements, each with room, one considered detail. Calm springs, quiet glass, hairlines, serif display.

This file is the operating spec. Apply it as written. Open another file only when the router names it, and open only that file.

## Do not load

Never read these into context. Import or run them:

- `01-fundamentals/tokens.css`, `tokens.json`, `tailwind-theme.css`, `shadcn-bridge.css`, `contrast-report.json`, `preview.html`, and the copies under `05-golden-examples/app/src/design/` and the repo-root `preview.html`
- `01-fundamentals/palette.md` (generated swatches). Pack choice uses the table below.
- `05-golden-examples/app/` source, `node_modules`, `.next`, `package-lock.json`, i18n dictionaries
- `README.md`, `references.md`

Do not open every file in `02-rules/` or `04-signature-moves/` "to be safe".

## Pack (ask once)

Default `champagne-wine`. If the user did not name a pack, offer 2–3 of these in the first message, then continue with their pick or the default.

| id | Feel |
|---|---|
| `champagne-wine` | ivory, champagne-bronze, wine secondary |
| `wine-gold` | deeper wine, gold-bronze, evening |
| `navy-cream-green` | navy ink, cream, forest accent |
| `brown-navy-lightblue` | paper, espresso, sky-blue; navy dark |
| `deep-green-brown` | felt green, leather brown |
| `silver-white` | cool clinical luxe |
| `monochrome` | tonal only; graphite accent |
| `toxic-white-orange` | lime on white, hot orange; lime is decorative |

Set `<html data-pack="…" data-theme="light|dark" dir="ltr|rtl" lang="en|he">`. Examples also accept `?pack=&theme=&dir=&motion=`.

New pack: add `01-fundamentals/palettes/<id>.json` (`canvas` light/dark, `accent`, `secondary`, optional `ink`, optional `metal`) and run `node 01-fundamentals/scripts/build-tokens.mjs`. Read only the FAIL lines it prints.

## Roles (no raw values)

Import the generated CSS. Never paste it, and never write hex, `rgb(`, `hsl(`, `oklch(`, a Tailwind palette class (`gray-` `slate-` `neutral-`), or a raw duration, radius, or shadow.

`bg-canvas` `bg-surface` `bg-surface-raised` `bg-surface-sunken` `text-ink` `text-ink-2` `text-ink-3` `border-hairline` `border-hairline-strong` `border-control`

Accent is Tailwind `brand-*` (CSS `--ds-accent*`): `bg-brand-solid` `hover:bg-brand-solid-hover` `text-on-brand` `text-brand-text` `text-brand-ui`. Raw `bg-brand` is decorative only. Text uses `text-brand-text`. Icons, rings, and charts use `text-brand-ui` / `ring-focus`.

Secondary is `deep-*`: `bg-deep-solid` `text-on-deep` `text-deep-text`.

Status: `text-success|warning|danger|info` with `bg-*-bg` and `border-*-border`, always paired with an icon or words.

Shape and rhythm: `rounded-pill` controls, `rounded-card` cards, `rounded-sheet` on the leading corners of sheets, `rounded-sm` small pieces, `rounded-editorial` images. `shadow-sm|md`. `font-display` `font-sans` `font-mono`. `py-section-xs|sm|md|lg|xl` between sections. `min-h-touch` / `size-touch` (44). `max-w-app|marketing|reading`. `ease-soft`. Token arbitrary values: `duration-(--ds-duration-ui)` `z-(--ds-z-modal)` `backdrop-blur-(--ds-glass-blur)`.

Inside components, Tailwind spacing steps 1, 2, 3, 4, 6, 8, 12, 16, 24, 32 only. Logical properties only: `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start` `border-s` `rounded-s-*`. Banned: `ml-` `mr-` `pl-` `pr-` `left-` `right-` `text-left` `text-right`.

Depth: cards are tint + hairline. `.glass` only on overlays (nav, sheet, modal, toast, popover). Never glass on glass. In dark mode, depth is `canvas → surface → surface-raised`, not a heavy shadow.

Type: display serif at `text-2xl` (28px) and up, weight 400, never bold. Smaller headings use sans at emphasis. Labels are `text-2xs`, uppercase, tracked, Latin only. Hebrew drops uppercase, italics, and tracking. Do not center a body paragraph longer than two lines. Figures use `font-sans tabular-nums`. Ghost numerals use `text-ink` at opacity ≤ 0.08 and `aria-hidden`. Text on an image or gradient sits on a `scrim` or a glass panel. A marketing viewport holds one idea and one primary action.

Icons: Phosphor `thin`, `light` at ≤16px. `aria-hidden` unless the icon is the control. Icon buttons need an accessible name and a 44px target. Mirror arrows and chevrons in RTL (`rtl:-scale-x-100`). Do not mirror play, check, logo, or clock.

Motion comes from `lib/motion.ts` (`durations`, `springs.overlay|ui|hero`, `ease.soft`). Overlays use `springs.overlay` (no overshoot): about 12px rise, fade, slight blur. Hover `scale(1.02)`, press `scale(.98)`. Never `linear` or CSS `ease` for UI motion. Reduced motion (`prefers-reduced-motion` and `data-motion="reduced"`) is opacity fades only.

Accent budget per viewport: one level 4 (particles, once), at most one level 3 (shiver, three cycles), few level 2 (radial light), level 1 is a hairline or icon. Open `04-signature-moves/accent-intensity.md` only when building a level 2+ effect.

## Anatomy

- **Safe triangle.** A nested menu stays open while the pointer travels toward its submenu (~180ms). Mirror the triangle in RTL.
- **Hit targets.** The clickable box is the whole row, card, or nav item, not the label. Minimum `min-h-touch`.
- **Hover intent.** Wait 150ms (range 100–200) before a heavy popover. Once it is open, siblings in the group switch immediately.
- **Search.** Local state is instant. Remote autocomplete waits 250ms (range 200–300) and aborts the previous request. Backspace and an empty query read a local cache immediately.
- **Submit loading.** The label stays in flow at `opacity-0`; the spinner is `absolute inset-0`. Width, height, and accessible name stay put. `disabled` + `aria-busy`.
- **Keyboards.** Set `inputmode` (`numeric`, `decimal`, `email`) and `autocomplete` (`email`, `name`, `current-password`, `new-password`, `one-time-code`) on every field. Labels stay visible. Validate on blur with `aria-describedby`. Never clear the value.
- **Optimistic UI.** Flip the control in the same frame, send the request behind it, and reverse with a toast if it fails.
- **Focus.** Trap Tab inside the open dialog. Esc closes. Restore focus to the trigger. One modal at a time: close the first, then open the next. A typed confirmation does not dismiss on scrim click, and Cancel takes initial focus.
- **Scroll memory.** Restore the feed's scroll position on the way back. Do not move a reader who has scrolled up. Chat scrolls natively upward; within 80px of the end it snaps after 140ms of idle; pulling past the end latches the options panel at 72px.
- **Zero CLS.** Give images, charts, and async media an `aspect-ratio` or a fixed block size before they load.
- **Optical alignment.** Shift play triangles and similar glyphs 1–2px toward inline-end. Leave that offset in place.
- **Undo and errors.** A reversible destructive action happens immediately, with a glass toast and 8s undo, kept at least 16px from the primary action. At most three toasts; undo drains a hairline, errors wait for a dismiss. An irreversible action needs a typed phrase; danger styling exists only inside that dialog. No `window.confirm`. Errors stay in the failing region, in plain language, and offer Retry. An empty state says what belongs there and offers the next action.

Loading: under 300ms, show nothing; after 300ms, keep the loader up for at least 600ms; then use the same staggered fade-in (700ms, 60ms between siblings). The in-button spinner is the only spinner. No skeletons. Route changes crossfade; do not blank the page.

Stack, and do not add to it: Next.js App Router, React 19, TypeScript strict, Tailwind v4, hand-written shadcn-style components on Radix, Phosphor, Motion for UI, anime.js for SVG and particles, Lenis on marketing pages only, Fontsource (Cormorant Garamond, Frank Ruhl Libre, Inter, Heebo, JetBrains Mono). User-visible strings go through `t()` with `en` and `he`. Put `"use client"` on the smallest leaf that needs it.

## Router

| You are… | Open only |
|---|---|
| Reusing a primitive that already exists | `05-golden-examples/api.md`, then that one source file |
| Building the marketing page | `05-golden-examples/landing.md` |
| Building auth | `05-golden-examples/auth.md` |
| Building the dashboard | `05-golden-examples/dashboard.md` |
| Building chat scroll | `04-signature-moves/scroll-and-focus.md` |
| Building the cycling placeholder | `04-signature-moves/animated-inputs.md` |
| Building a level 2–4 accent | `04-signature-moves/accent-intensity.md` |
| Unsure about a Hebrew or RTL exception | `02-rules/i18n-rtl.md` |
| Adding a dependency or wiring CSS imports | `03-libraries/stack.md` |
| Implementing safe-triangle math beyond the rule above | `02-rules/design-anatomy.md` |
| Changing a token value | `01-fundamentals/core.json` or one `palettes/<id>.json`, then the build script |

`02-rules/ui-rules.md` and `02-rules/ux-rules.md` are the numbered checklists (U1–U25, X1–X25) behind this file. Open one only to settle a dispute about a rule id. `01-fundamentals/foundations.md` is the same for token numbers. `04-signature-moves/interactions.md` and `type-moves.md` are the parameter sheets for lift, glint, and ghost numerals.

## Done when

1. `npm run check:raw` in `05-golden-examples/app` (or the same grep): 0 hits.
2. Two packs × light/dark × LTR/RTL, at 1280×860 and 390×844.
3. Tab order is visible; dialogs trap focus and restore it to the trigger.
4. Reduced motion is opacity only.
5. Nothing shifts on load, and a loading button keeps its box.
