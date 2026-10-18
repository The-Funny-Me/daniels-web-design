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
- **U16a (Elevation via Surface Tinting in Dark Mode)** Communicate visual depth in dark mode using lightness layering (`canvas` → `surface` → `surface-raised`) and surface opacity overlays rather than heavy drop shadows, which disappear against dark backgrounds.
- **U16b (Skeleton Reserve Areas / Zero CLS)** Reserve fixed structural aspect-ratio space (`aspect-ratio` or explicit height bounds) for dynamic images, charts, and asynchronous media before they load so Cumulative Layout Shift (CLS) is zero.

## Typography
- **U17** Display serif ≥ 28px only; below that use the body face. No bold display. Max two typefaces per page (display + body; mono only for code/data). Hero/stat figures use the proportional sans face (`font-sans tabular-nums`), and headings enforce `font-variant-numeric: lining-nums` so Cormorant numerals never read as letters.
- **U18** Labels: 2xs, uppercase, 0.18em tracking, secondary text, **Latin script only**. In Hebrew, labels use no uppercase and no tracking (see `i18n-rtl.md`).
- **U19** Never center-align body paragraphs longer than two lines.

## Iconography and imagery
- **U20** Phosphor only, `thin` default, `light` ≤ 16px or for emphasis. No mixed icon sets, no emoji as UI.
- **U21** Icons are decorative (`aria-hidden`) unless they stand alone; standalone icon buttons need an accessible name and a 44×44 minimum target.
- **U21a (Optical Alignment vs. Mathematical Centering)** Nudge asymmetric icons, play triangles, or directional glyphs slightly off-center (1–2px toward their visual weight center) to satisfy human perception rather than relying solely on raw mathematical centering.

## Interaction targets and states
- **U22 (Expanded Hit Targets / Fitts's Law)** Minimum touch target 44×44px (`min-h-touch` / `size-touch`). Extend interactive hit targets (`padding` or full-card `<Link>` wrappers) to fill the entire container or card rather than anchoring click listeners strictly to inline text or icons. Hover, focus-visible, active, disabled and loading states exist for every interactive element.
- **U23** Focus ring: `2px solid var(--ds-focus-ring)` with 3px offset, on every focusable element, never removed.
- **U24 (Natural Spring Curves over Linear Transitions)** Hover/press default: `scale(1.02)` hover, `scale(.98)` active, `duration-press`, `ease-soft`; disabled elements do neither. Modal pop-ins, drawer slides, and UI transitions use directional cubic-bezier curves (`--ds-ease-soft` / `cubic-bezier(0.16, 1, 0.3, 1)`) or critically damped springs (`springs.overlay`, `springs.ui`) — never linear or default CSS `ease` transitions.
- **U25** Disabled is communicated by opacity 0.5 *and* `aria-disabled`/`disabled`, not by color alone.

## Delivery checklist (the agent runs this before saying "done")
1. Run `npm run check:raw` (or grep the diff for `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(`, `oklch(`, `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `gray-`, `slate-`, `neutral-`, and banned spacing steps `5, 7, 9, 10, 11`): 0 violations.
2. Render in two packs × two modes × LTR/RTL (at both desktop `1280×860` and mobile `390×844`) and inspect each screenshot.
3. Tab through the page; every focus is visible, modals trap focus and restore focus to the trigger on close.
4. Toggle `prefers-reduced-motion` and `?motion=off`; nothing moves except opacity fades.
5. Confirm zero layout shift (CLS) when content loads and button dimensions stay locked during loading states.
