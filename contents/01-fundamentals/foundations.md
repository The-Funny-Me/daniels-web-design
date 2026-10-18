> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# 01 · Fundamentals

The numbers behind every design. Nothing here is a suggestion: if a value is not a token, it is not allowed.

Source of truth: `core.json` (pack-independent) and `palettes/*.json` (color seeds). Run `node 01-fundamentals/scripts/build-tokens.mjs` to regenerate `tokens.json`, `tokens.css`, `tailwind-theme.css`, `palette.md` and `preview.html`. The build **fails** if any functional text or UI role drops below WCAG AA. Open `preview.html` to see every pack in light/dark and LTR/RTL.

## 1. Architecture: semantic core + palette packs

Components only ever reference **roles** (`--ds-text-primary`, `--ds-accent-solid`), never colors. A pack fills the same roles with different values, so switching `data-pack` or `data-theme` on `<html>` restyles everything without touching a component.

```html
<html data-pack="champagne-wine" data-theme="light" dir="ltr">
```

Packs (see `palette.md` for values and contrast tables):

| id | Feel |
|---|---|
| `champagne-wine` (default) | Airy ivory, champagne-bronze, wine-velvet secondary; warm ink midnight dark |
| `wine-gold` | Dramatic sibling: deeper wine, truer gold-bronze, darker |
| `navy-cream-green` | Navy ink on cream, forest-emerald accent |
| `brown-navy-lightblue` | Paper and espresso with a sky-blue highlight; navy dark |
| `monochrome` | Pure tonal; hierarchy from type, space and motion only |
| `silver-white` | Cool, clinical-luxe |
| `deep-green-brown` | Poker-table green, leather-brass brown |
| `toxic-white-orange` | Lime on white with hot orange; high energy |

Palettes express taste, they are not a cage. A new project may get a new pack: add `palettes/<id>.json` (canvas light/dark, accent, secondary, optional ink hints and metal stops), run the build, and fix whatever the contrast check flags.

## 2. Color roles (the contract every pack fills)

| Role | Use for | Never |
|---|---|---|
| `canvas` | Page background | Cards |
| `surface` / `surface-raised` / `surface-sunken` | Cards / popovers, raised cards, wells and input fields | Text |
| `text-primary` / `-secondary` / `-tertiary` | Headings and body / supporting copy / captions and meta | Decorative watermarks (use opacity on primary instead) |
| `border-hairline` / `border-strong` | Dividers, card edges / emphasized edges | Input boundaries |
| `border-control` | Input, select and toggle boundaries (guaranteed 3:1) | Decoration |
| `accent` | Decorative only: glints, hairlines, fills carrying no information | **Text, icons that convey meaning** |
| `accent-ui` | Icons, focus ring, chart marks (guaranteed 3:1) | Body text |
| `accent-text` | Accent-colored text and links (guaranteed 4.5:1) | Large fills |
| `accent-solid` + `on-accent` | Filled buttons and chips; always pair these two | Mixing with another on-color |
| `secondary`, `-ui`, `-text`, `-solid`, `on-secondary` | Same five roles for the deep secondary (wine, navy, slate, ...) | |
| `success` / `warning` / `danger` / `info` (+ `-bg`, `-border`) | Status; calm chroma by design | Brand color |
| `glass-bg`, `glass-border`, `scrim` | Overlays and focus mode (see Depth) | Base cards |
| `shadow-sm/md/lg` | Elevation, tinted to the pack, never gray-black | |
| `glow`, `fx-1/2/3` | Accent effects (see `04-signature-moves/accent-intensity.md`) | Text |
| `metal-gradient`, `metal-hairline` | Only exist in packs that define metals. Borders, glints, icon fills | **Text, large surfaces** |

Tailwind class names: the `accent*` family is exposed as **`brand-*`** (e.g. `bg-brand-solid`, `text-on-brand`, `text-brand-text`) and the `secondary*` family as **`deep-*`**, because shadcn/ui owns the Tailwind keys `accent` and `secondary`. CSS variables keep the `--ds-accent*` / `--ds-secondary*` names. Full list in `03-libraries/stack.md`.

Rules that follow from the table:
- No raw hex, `rgb()`, `hsl()` or named color in component code. If a role is missing, add a role to the build, not a one-off.
- Light mode never uses pure `#FFF`/`#000` text or surfaces; dark mode never uses pure black or white. All neutrals carry the pack tint.
- A pack whose accent cannot be text (lime, light blue, silver) is fine: it uses `accent-text` for text and `accent` for decoration. The build derives `accent-text`.

## 3. Typography

- **Display**: serif. `Cormorant Garamond` with `Frank Ruhl Libre` as the Hebrew fallback (font-family stack; the browser picks per glyph).
- **Body/UI**: `Inter` with `Heebo` as the Hebrew fallback.
- **Mono**: `JetBrains Mono`.
- Cormorant is a high-contrast display face: never below `text-2xl` (28px). Headings smaller than that use the body font at `weight-emphasis`.
- Scale tokens: `2xs`(labels) `xs` `sm` `base` `lg` `xl` `2xl` `3xl` `4xl` (fluid), `display-lg`, `display-xl` (fluid), `numeral-ghost` (fluid, for ghost numerals).
- Weights: display 400, body 400, emphasis 500. Never 600+ on display type; luxury is thin, not loud.
- Labels: `text-2xs`, uppercase, `tracking-label` (0.18em), weight 500, `text-secondary`.
- Line height: display 1.05, heading 1.2, body 1.55, **body in RTL 1.65** (applied automatically via `[dir="rtl"]`).
- Hebrew has no italics and no small caps. Any signature move that relies on them (serif italic accent words, tracked uppercase labels) needs the RTL fallback in `04-signature-moves/type-moves.md`.

## 4. Spacing

Two systems, deliberately separate.

**Components: 8pt.** Allowed steps (token `space-*`, Tailwind step in brackets): 4 [1], 8 [2], 12 [3], 16 [4], 24 [6], 32 [8], 48 [12], 64 [16], 96 [24], 128 [32]. Nothing else inside components. Odd Tailwind steps (5, 7, 9, 10, 11) are banned.

**Sections: Fibonacci rhythm**, fluid: `section-xs` 21→34, `section-sm` 34→55, `section-md` 55→89, `section-lg` 89→144, `section-xl` 144→233 (px). Use as `py-section-md` etc. Vertical rhythm between page sections steps *down one level on mobile automatically* via the clamp; do not hand-tune.

Whitespace is a feature: when in doubt between two section tokens, take the larger.

## 5. Radius (provisional, see note)

`editorial` 2px (image and editorial blocks) · `xs` 6 · `sm` 12 (small elements, chips) · `md` 16 · `card` 24 · `sheet` 32 (bottom sheets, large modals, top corners) · `pill` 9999 (buttons, inputs, nav, tags).

Pill controls plus 24px cards is the soft-luxe default. **This is my inference, not a measurement:** the reference pages I could fetch exposed text and metadata only, not rendered geometry. Treat it as a placeholder to confirm against screenshots in `05-golden-examples/references/`.

Nested radii: inner radius = outer radius minus the padding between them.

## 6. Depth: glass + tint

Goal: the focused element is obvious, the style never breaks.

- **Base layer (cards, panels)**: *tint*, not glass. Elevation is expressed by surface steps (`surface` → `surface-raised`; lighter in dark mode) plus a 1px `border-hairline` and a pack-tinted `shadow-sm|md`.
- **Overlay layer (nav, popovers, sheets, modals, composer)**: *glass*. `background: var(--ds-glass-bg); backdrop-filter: blur(var(--ds-glass-blur)) saturate(var(--ds-glass-saturate)); border: 1px solid var(--ds-glass-border); box-shadow: var(--ds-shadow-md)`.
- **Focus mode**: opening a modal or sheet places a `scrim` (pack-tinted, never gray) behind it and applies `backdrop-filter: blur(var(--ds-scrim-blur))` to the page. Only the focused layer stays crisp.
- `glass-bg` alpha is *derived per pack and mode* so that `text-primary` stays ≥7:1 and `text-secondary` ≥4.5:1 even over the worst-case backdrop. Do not override the alpha.
- Glass fallback: if `backdrop-filter` is unsupported, or under `prefers-reduced-transparency: reduce`, use `surface-raised` fully opaque with the same border and shadow.
- Never stack glass on glass. One glass layer per viewport region.

## 7. Motion

Calm springs. Nothing snaps, nothing bounces.

| Token | Value | Use |
|---|---|---|
| `duration-press` | 120ms | Press/hover feedback only |
| `duration-ui` | 320ms | Component state changes |
| `duration-slow` | 450ms | Larger panels, route-level fades |
| `duration-hero` | 900ms | Hero reveals and storytelling sequences (maximum) |
| `stagger` | 60ms | Between siblings (allowed range 40–80ms) |
| `ease-soft` | cubic-bezier(.22,1,.36,1) | Default for CSS transitions |
| `ease-in-out` | cubic-bezier(.65,0,.35,1) | Symmetric moves |

Springs (Motion library, `core.json → motion.spring`): `overlay` {260, 34}, `ui` {380, 40}, `hero` {120, 22}. All are critically damped or over, so **overlays never overshoot**; the build verifies `damping ≥ 2·√(stiffness·mass)`.

Overlay entrance: rise ~12px, fade, slight blur-in, `overlay` spring.

Reduced motion (`prefers-reduced-motion: reduce`): all transforms, parallax, particles, shiver and typing animations collapse to opacity fades or static states. No exceptions; each signature move specifies its own reduced state.

## 8. Loading

Fade-in reveal, with an adaptive loading screen. Parameters in `core.json → loading`.

1. Start a timer when the load begins.
2. If content resolves in **< 300ms** (`showAfterMs`): never show the loader; reveal content with the staggered fade-in (`revealDurationMs` 700, `staggerMs` 60).
3. If it takes longer: after 300ms show the loading screen (branded, calm, on `canvas`). Once shown it stays **at least 600ms** (`minVisibleMs`) so it never flashes.
4. When data arrives, the loading screen cross-fades into the same staggered reveal.
5. Reserve layout space up front (fixed aspect ratios, min-heights) so reveal never shifts layout.
6. Under reduced motion: a plain 200ms opacity fade, no stagger.

## 9. Layout

- Containers: app `1200px`, marketing `1360px`, reading `680px`. Gutter `clamp(16px, 4vw, 64px)`. 12-column grid, gap `clamp(16px, 2vw, 32px)`.
- Margins grow with the viewport so whitespace stays generous; content never touches the edge.
- Breakpoints: Tailwind defaults (640/768/1024/1280/1536). Design mobile-first.
- Marketing sections: one idea per viewport. Asymmetric 12-column placements preferred over centered stacks.

## 10. Icons

Phosphor, weight `thin` by default (matches the hairline aesthetic), `light` for emphasis or small sizes (≤16px, where thin disappears). Sizes 16/20/24. Icons are `currentColor`; informational icons use `accent-ui` or text roles, never raw `accent`.
