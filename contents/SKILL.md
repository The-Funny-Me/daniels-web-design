---
name: web-design
description: Design, build, restyle or review web UI (landing, app, dashboard, auth/forms, chat) in a calm luxury style on this skill's tokens, rules and Next.js + Tailwind v4 + shadcn stack. Not for backend, native apps, email or print.
---

# /web-design

Luxury, spacious, token-driven UI: white velvet sheets in a golden hotel room. Few elements, each with room, one considered detail. Calm springs, quiet glass, hairlines, serif display.

This file is the router. Read it whole, then open only the files your task row names. Rule ids are stable; cite them in reviews: `U` `02-rules/ui-rules.md`, `X` `02-rules/ux-rules.md`, `C` `02-rules/craft-checklist.md`, `R` `02-rules/i18n-rtl.md`.

Never read into context (import or run them): generated tokens in `01-fundamentals/` (`tokens.css`, `tokens.json`, `tailwind-theme.css`, `shadcn-bridge.css`, `palette.md`, `contrast-report.json`, `preview.html`), `05-golden-examples/app/` beyond the one file you copy, `references.md`.

## 1. Before building

1. **Pack.** Default `champagne-wine`. If the user named none, offer 2–3 in your first message: `champagne-wine` (ivory, champagne, wine), `wine-gold` (evening), `navy-cream-green`, `brown-navy-lightblue` (paper, espresso, sky), `deep-green-brown` (felt, leather), `silver-white` (cool clinical), `monochrome` (tonal), `toxic-white-orange` (lime is decorative). Set `<html data-pack="…" data-theme="light|dark" dir="ltr|rtl" lang="en|he">`.
2. **Tokens.** Import the generated CSS (wiring in `03-libraries/stack.md`); never paste it.
3. **Read** `02-rules/craft-checklist.md` once, then your task row.

| Task | Open | Example route |
|---|---|---|
| Landing / marketing | `05-golden-examples/landing.md`, `04-signature-moves/type-moves.md` | `/landing` |
| Dashboard, tables, charts | `05-golden-examples/dashboard.md`, `02-rules/ux-rules.md` | `/dashboard` |
| Forms, auth, validation | `05-golden-examples/auth.md`, `02-rules/ux-rules.md`; cycling placeholder: `04-signature-moves/animated-inputs.md` | `/auth` |
| Chat, live feed, smooth scroll | `05-golden-examples/chat.md`, `04-signature-moves/scroll-and-focus.md` | `/chat` |
| Menus, popovers, modals, toasts | `02-rules/ux-rules.md`; safe-triangle and timer details: `02-rules/design-anatomy.md` | — |
| Motion, hover, glint, overlays | `04-signature-moves/interactions.md`; level 2–4 accent: `04-signature-moves/accent-intensity.md` | — |
| Hebrew, RTL, i18n | `02-rules/i18n-rtl.md` | any, `?dir=rtl` |
| Tokens, palette, new pack | `01-fundamentals/foundations.md`; edit `core.json` or `palettes/<id>.json`, run `node 01-fundamentals/scripts/build-tokens.mjs`, read only FAIL lines | — |
| Dependency or CSS wiring | `03-libraries/stack.md` | — |
| Reusing a component | `05-golden-examples/api.md`, then that one source file | any |
| Review or audit | `02-rules/ui-rules.md`, `02-rules/ux-rules.md`; report by id | — |

## 2. While building (every task)

- **Tokens (U1, U13).** No hex, `rgb(`, `hsl(`, `oklch(`, Tailwind palette class, or raw duration, radius or shadow. Roles: `bg-canvas` `bg-surface|surface-raised|surface-sunken` `text-ink|ink-2|ink-3` `border-hairline|hairline-strong|control`. Accent is `brand-*`: `bg-brand-solid` + `text-on-brand`, text `text-brand-text`, icons/rings/charts `text-brand-ui` / `ring-focus`; raw `bg-brand` is decorative. Secondary `deep-*`. Status `text-success|warning|danger|info` + `bg-*-bg` + `border-*-border`, always with an icon or words (U12). Token values: `duration-(--ds-duration-ui)`, `z-(--ds-z-modal)`.
- **Space (U4–U7).** Tailwind steps 1, 2, 3, 4, 6, 8, 12, 16, 24, 32 only; `py-section-xs…xl` between sections; `max-w-app|marketing|reading`. Logical properties only (`ms- me- ps- pe- start- end- text-start border-s rounded-s-*`); `ml- mr- pl- pr- left- right- text-left text-right` are banned.
- **Shape, depth (U14–U16a).** `rounded-pill` controls, `rounded-card` cards, `rounded-sheet` leading corners, `rounded-sm` small, `rounded-editorial` images. Cards: tint + hairline + `shadow-sm|md`. `.glass` only on overlays, never glass on glass. Dark depth is canvas → surface → surface-raised.
- **Type (U10, U11, U17–U19).** `font-display` from `text-2xl` (28px), weight 400, never bold; smaller headings sans. Labels `text-2xs` uppercase tracked, Latin only. Figures `font-sans tabular-nums`. No centered body over two lines. Text on imagery sits on `scrim` or glass. Ghost numerals `text-ink` at ≤0.08 opacity, `aria-hidden`.
- **Icons (U20, U21).** Phosphor `thin`, `light` ≤16px; `aria-hidden` unless the icon is the control, then a name and a 44px target. Mirror arrows and chevrons in RTL, not play, check, logo or clock.
- **Motion (U24).** Only from `lib/motion.ts` (`durations`, `stagger`, `ease`, `springs.overlay|ui|hero`). Overlays: `springs.overlay`, ~12px rise, fade, slight blur, no overshoot. Hover `scale(1.02)`, press `scale(.98)`. Never `linear` or CSS `ease`. Reduced motion (`prefers-reduced-motion`, `data-motion="reduced"`) is opacity fades only.
- **Behaviour.** Whole row/card clickable, `min-h-touch` (U22). Press feedback <120ms, optimistic toggles (X19). No loader under 300ms, then ≥600ms; the in-button spinner is the only spinner; no skeletons (X1, X2). Reserve space, zero CLS (U16b, X3). A loading submit keeps its box, `disabled` + `aria-busy` (X16). Visible labels, `inputmode` + `autocomplete`, validate on blur, never clear input (X12, X14, X15). Dialogs trap focus, Esc closes, focus returns, one at a time (X17, X18). Reversible: act now + 8s undo toast; irreversible: typed phrase; no `window.confirm` (X6–X8). Errors stay in their region with Retry; empty states offer the next action (X9, X21).
- **Accent budget.** Per viewport: one level 4 (once), ≤1 level 3, few level 2; level 1 is a hairline or icon.
- **Stack (U2).** Next.js App Router, React 19, TS strict, Tailwind v4, shadcn-style on Radix, Phosphor, Motion, anime.js (SVG, particles), Lenis (marketing only), Fontsource. Strings via `t()` in `en` and `he`. `"use client"` on the smallest leaf. Add nothing else without asking.

## 3. Before done

In `05-golden-examples/app` (after `npm install`), or the same checks on the user's app:

1. `npm run check:raw` → 0 hits; `npm run typecheck` passes.
2. `npm run build && npx next start -p 3100`, then `npm run shots -- /<route>` (2 packs × light/dark × LTR/RTL; `W=390 H=844` for mobile; first time `npx playwright install chromium`). It must report no console errors or overflow; look at every shot. Golden app: `npm run verify:behaviour`.
3. Tab through: focus visible, dialogs trap and restore. `?motion=off`: opacity only. Nothing shifts on load.
4. Walk C1–C40 and name any rule you broke on purpose.
