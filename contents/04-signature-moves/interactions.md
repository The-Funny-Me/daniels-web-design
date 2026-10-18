> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

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
## 5. Cursor, form & state physics (Good Design Anatomy)

- **Submenu Aiming (Safe Triangle Buffer):** In nested dropdown menus, predict cursor trajectory toward submenus using dynamic triangular buffers or pointer-tracking vector math so submenus do not collapse when moving diagonally across sibling items.
- **Expanded Hit Targets (Fitts's Law):** Extend interactive hit areas (`padding`, `min-h-touch`, or full-card `<Link>` wrappers) to fill the entire container or card rather than anchoring click listeners solely to inline text or icons.
- **Hover Intent Delay:** Delay heavy popovers or rich tooltips by 100–200ms (`pointerenter` timer cleared on `pointerleave`) so rapid cursor sweeps across the screen do not trigger unwanted popovers.
- **Debounced Intent vs. Raw Input Queries:** Delay autocomplete network queries until a 200–300ms typing pause occurs, and serve instant local cache hits on backspace, avoiding flashing dropdowns and race conditions.
- **Button Dimension Lock on Loading States:** Preserve exact `width` and `height` on submit buttons when transitioning to a loading spinner (`opacity-0` on the label span in flow + centered `absolute inset-0` `<Spinner />`).
- **Optimistic UI Updates with Graceful Rollback:** Immediately reflect state toggles (archiving, bookmarking, liking) in the UI before the network request resolves, paired with `undoToast` (8s draining hairline) or automatic rollback + toast on failure.
- **Focus Trap & Focus Restoration:** Trap `Tab` focus inside active modals/sheets and explicitly restore focus to the triggering element once closed (`Overlay`).
- **Optical Alignment & Spring Curves:** Nudge asymmetric icons 1–2px toward visual center, enforce `lining-nums` on serif headings and `tabular-nums` on figures, and use directional cubic-bezier curves (`--ds-ease-soft`, `cubic-bezier(0.16, 1, 0.3, 1)`) or critically damped springs instead of linear transitions.
