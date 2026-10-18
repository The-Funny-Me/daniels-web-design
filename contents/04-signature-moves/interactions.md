# Interactions

## 1. Lift & press

The default tactile feel for every pressable surface (buttons, cards that are links, chips).

| | |
|---|---|
| Trigger | hover, active (press) |
| Hover | `scale(1.02)`, hairline brightens (`border-hairline` → `border-strong`), `shadow-sm` → `shadow-md` |
| Active | `scale(0.98)` |
| Timing | `duration-press` (120ms), `ease-soft`; release returns on `duration-ui` |
| Library | CSS transitions (preferred) or Motion `whileHover`/`whileTap` |
| Reduced motion | no scale; hairline brightening only |
| Disabled | no hover or press effect |
| Touch | hover styles gated with `@media (hover: hover)`; press still applies |

```tsx
// Tailwind form
"transition-[transform,box-shadow,border-color] duration-(--ds-duration-press) ease-soft " +
"motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] hover:shadow-md hover:border-hairline-strong"
```

Large cards (wider than ~480px) use `scale(1.01)` instead; 2% of a wide card is visible jitter.

## 2. Specular glint sweep

A slow diagonal light pass across metallic or glass elements. Signals "precious".

| | |
|---|---|
| Trigger | hover or focus-visible on the element; also once on first reveal of a hero element |
| Visual | a ~30% wide band at 20° skew, gradient `transparent → rgb(255 255 255 / 0.35) → transparent` (dark mode: 0.18), `mix-blend-mode: soft-light` on glass, `normal` on metal |
| Travel | inline-start → inline-end across the element; **reverses in RTL** (use `--ds-dir`) |
| Timing | 900ms (`duration-hero`), `ease-in-out`, plays once per trigger; no loop |
| Where | primary CTA, metal-gradient hairlines, hero card, glass nav on route change. Not on body text, lists or every card |
| Library | CSS (pseudo-element + `background-position` or `transform: translateX(calc(var(--ds-dir) * …))`) |
| Reduced motion | no sweep; a static soft highlight at 10% is allowed |
| A11y | pseudo-element only; `pointer-events: none`, no content impact |

Budget: at most one glint element in view at a time.

## 3. Overlay entrance (modal, sheet, popover)

| | |
|---|---|
| Motion | rise ~12px (`translateY`), fade 0→1, blur-in 6px→0, `overlay` spring {stiffness 260, damping 34}: critically damped, **no overshoot** |
| Exit | reverse, 200ms, `ease-soft` (no spring on exit) |
| Sheets | slide from the bottom (mobile) or inline-end (desktop), same spring |
| Surface | glass (see foundations §6) |
| Focus | trap, return focus on close, `Esc` closes |
| Reduced motion | 200ms opacity fade only |

## 4. Tinted-scrim focus mode

Opening an overlay puts the rest of the page into the background.

- `background: var(--ds-scrim)` full-viewport, `z-(--ds-z-overlay)`.
- Page content behind gets `backdrop-filter: blur(var(--ds-scrim-blur))` via the scrim layer (do not blur the whole app tree; blur the scrim's backdrop).
- Only the focused layer is crisp. Scrim fades in over `duration-slow`.
- The scrim color is pack-tinted (never gray). Clicking it closes non-destructive overlays; for typed-confirmation modals it does nothing.
- Reduced transparency: scrim stays tinted but without blur.
