> Open only when `SKILL.md` routes you here. `SKILL.md` carries the digest; this file is the canonical text behind each id.

# 02 · UI rules

Non-negotiable. Each rule is checkable; if an agent cannot verify a rule from the code it wrote, it has not finished.

## Tokens
- **U1** No raw colors, radii, shadows, spacing, font sizes or durations in components. Use `--ds-*` variables or the Tailwind names mapped in `tailwind-theme.css`.
- **U2** Never introduce a new dependency, font, icon set or color outside `03-libraries/stack.md` and the tokens. Ask first.
- **U3** Every component works in all packs, both modes and both directions. A component hard-coded to one pack is a bug.

## Spacing and layout
- **U4** Component spacing uses 8pt steps only: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. No other values.
- **U5** Page sections are separated with `section-*` (Fibonacci) tokens, never ad-hoc padding.
- **U6** Containers: app 1200px, marketing 1360px, reading 680px; always with the fluid gutter. Body text measure 45–75 characters (`max-w-reading` or `max-w-[62ch]`).
- **U7** Layout uses logical properties only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, `rounded-s-*`). Physical `left/right/ml/mr/pl/pr/text-left/text-right` are banned. See `i18n-rtl.md`.
- **U8** One focal idea per viewport on marketing pages. If a section has more than one primary action, split it.

## Color and contrast
- **U9** AA is a hard fail on all functional text and UI: 4.5:1 body, 3:1 for large text (≥24px, or ≥19px bold) and UI components. The token roles already guarantee this; **using a role for something it was not designed for voids the guarantee** (raw `accent` as text, `text-tertiary` on a tinted fill, text on an image without a scrim).
- **U10** Text on images or gradients requires a `scrim` layer or a glass panel. No bare text over imagery.
- **U11** Decorative text (ghost numerals, watermarks) must be `aria-hidden`, `pointer-events: none`, and built from `text-primary` with opacity ≤ 0.08, so it is clearly decoration and never the only carrier of meaning.
- **U12** Color never carries meaning alone: pair status colors with an icon or text.
- **U13** Neutrals are pack-tinted. No `#000`, `#fff`, `gray-*`, `slate-*`, `neutral-*` Tailwind palette classes.

## Shape and depth
- **U14** Buttons, inputs, tags, nav: `pill`. Cards `card` (24). Small elements `sm` (12). Bottom sheets and large modals `sheet` (32) on the leading corners. Editorial image blocks may use `editorial` (2px). Nest radii: inner = outer − padding.
- **U15** Base cards use tint + hairline + `shadow-sm|md`. Overlays use glass. Never glass on glass; never a drop shadow with a gray-black color.
- **U16** Only one glass layer per viewport region. Glass needs the opaque fallback (`prefers-reduced-transparency`, no `backdrop-filter` support).
- **U16a Dark elevation.** In dark mode, depth is lightness steps (`canvas` → `surface` → `surface-raised`) and tinted overlays, not heavy shadows.
- **U16b Zero CLS.** Images, charts and async media get an `aspect-ratio` or fixed block size before they load.

## Typography
- **U17** Display serif ≥ 28px only; below that use the body face. No bold display. Max two typefaces per page (display + body; mono only for code/data). Hero/stat figures use the proportional sans face (`font-sans tabular-nums`), and headings enforce `font-variant-numeric: lining-nums` so Cormorant numerals never read as letters.
- **U18** Labels: 2xs, uppercase, 0.18em tracking, secondary text, **Latin script only**. In Hebrew, labels use no uppercase and no tracking (see `i18n-rtl.md`).
- **U19** Never center-align body paragraphs longer than two lines.

## Iconography and imagery
- **U20** Phosphor only, `thin` default, `light` ≤ 16px or for emphasis. No mixed icon sets, no emoji as UI.
- **U21** Icons are decorative (`aria-hidden`) unless they stand alone; standalone icon buttons need an accessible name and a 44×44 minimum target.
- **U21a Optical alignment.** Shift asymmetric glyphs (play triangles, arrows) 1–2px toward their visual centre instead of trusting mathematical centring.

## Interaction targets and states
- **U22 Hit targets (Fitts).** Minimum 44×44px (`min-h-touch` / `size-touch`); the hit area fills the whole row, card or nav item, not just the label or icon. Every interactive element has hover, focus-visible, active, disabled and loading states.
- **U23** Focus ring: `2px solid var(--ds-focus-ring)` with 3px offset, on every focusable element, never removed.
- **U24 Press and curves.** Hover `scale(1.02)`, active `scale(.98)`, `duration-press`, `ease-soft`; disabled elements do neither. Transitions use `--ds-ease-soft` or critically damped springs (`springs.overlay`, `springs.ui`), never `linear` or CSS `ease`.
- **U25** Disabled is communicated by opacity 0.5 *and* `aria-disabled`/`disabled`, not by color alone.

## Delivery
Run `SKILL.md` §3 (Before done).
