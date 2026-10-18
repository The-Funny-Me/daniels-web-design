# `/web-design` — Skill System & Design Work Folder

A complete, token-driven design-system repository and Cursor agentic skill specification for high-craft, luxury web application design ("minimal maximum", white velvet sheets in a golden hotel room).

---

## Quick Start (Zero-Password Unpack into Cursor)

Any user on any local machine can install the skill into Cursor in three steps with **no `sudo` or password required**:

```bash
git clone <repo-url> web-design
cd web-design
./unpack.sh
```

`./unpack.sh` unpacks `contents/` directly into `~/.cursor/skills/web-design` (and `~/.cursor/skills/Daniels-web-design` for backwards compatibility), excluding build caches (`node_modules`, `.next`). Once unpacked, invoke `/web-design` directly inside Cursor.

---

## Repository Structure

```
web-design/
├── unpack.sh                   # One-command installer into ~/.cursor/skills/ (no password/sudo)
├── preview.html                # Standalone zero-dependency interactive showcase (8 packs + physics)
├── README.md                   # Repository overview & quick-start guide
├── SKILL.md                    # Primary Cursor skill definition & workflow
├── references.md               # Sourced design references & verified guidelines
├── LICENSE                     # MIT License
└── contents/                   # Unpackable skill payload copied to ~/.cursor/skills/
    ├── SKILL.md
    ├── README.md
    ├── references.md
    ├── preview.html
    ├── 01-fundamentals/        # OKLCH token generator, 8 palette packs, WCAG AA hard-fail verifier
    │   ├── core.json
    │   ├── foundations.md
    │   ├── palette.md
    │   ├── preview.html
    │   ├── tokens.{json,css} · tailwind-theme.css · shadcn-bridge.css · contrast-report.json
    │   ├── palettes/*.json     # 8 curated color packs (champagne-wine default)
    │   └── scripts/            # build-tokens.mjs & preview.template.html
    ├── 02-rules/               # Mandatory UI/UX rules, Good Design Anatomy & RTL/i18n
    │   ├── ui-rules.md         # Spatial 8pt grid, dark mode surface tinting, optical alignment, Zero CLS
    │   ├── ux-rules.md         # Cursor dynamics, form physics, state & motion, focus traps
    │   ├── design-anatomy.md   # Deep reference on cursor, input, state, and layout physics
    │   └── i18n-rtl.md         # Logical properties & Hebrew RTL parity
    ├── 03-libraries/
    │   └── stack.md            # Next.js 16, React 19, Tailwind v4, Motion, anime.js, Lenis, Radix
    ├── 04-signature-moves/
    │   ├── interactions.md     # Lift/press, specular glint, safe triangle, debounce, optimistic UI
    │   ├── animated-inputs.md  # Self-typing & password-masking input overlays
    │   ├── scroll-and-focus.md # Scrim + glass sheet, Lenis, chat scroll latch, scroll memory
    │   ├── accent-intensity.md # 5-level dynamic accent ladder (0..4)
    │   └── type-moves.md       # Ghost numerals, tracked labels, serif headlines
    └── 05-golden-examples/
        ├── README.md           # Golden examples architecture & verification commands
        ├── landing.md · auth.md · chat.md · dashboard.md
        └── app/                # Complete Next.js 16 reference app (/landing, /auth, /chat, /dashboard)
```

---

## Good Design Anatomy Included in the Skill

1. **Navigation & Cursor Dynamics**
   - **Submenu Aiming (The Safe Triangle Buffer):** Predicts diagonal cursor trajectory toward open submenus so passing over neighboring items never collapses the active menu prematurely.
   - **Expanded Hit Targets (Fitts's Law):** Interactive padding (`min-h-touch` / full-card target) fills the entire container rather than anchoring click listeners only to inline text or icons.
   - **Hover Intent Delay:** Delays heavy popovers and rich tooltips by `100–200ms` (`150ms` default) to prevent unwanted triggers during fast cursor sweeps.

2. **Search, Input & Form Physics**
   - **Debounced Intent vs. Raw Input Queries:** Delays network autocomplete requests by `200–300ms` (`250ms` default) while serving instant results from a local `Map` cache on backspace.
   - **Button Dimension Lock on Loading States:** Preserves explicit `width` and `height` on submit buttons when transitioning to a loading spinner (`opacity-0` label in flow + centered overlay `<Spinner />`).
   - **Native Keyboard Tailoring (`inputmode` & `autocomplete`):** Sets explicit `inputmode="numeric"`, `inputmode="decimal"`, or `type="email"` alongside semantic `autocomplete` tokens.

3. **State Management & Motion**
   - **Optimistic UI Updates with Graceful Rollback:** Immediately reflects toggles in the UI before the network request resolves, rolling back automatically with a calm glass toast if the API call fails.
   - **Focus Trap & Focus Restoration:** Traps `Tab` / `Shift+Tab` inside active modal dialogs and sheets, and restores focus to the triggering element on close.
   - **Scroll Position Memory:** Preserves exact scroll coordinates (`sessionStorage` keyed by pathname) when navigating back from a detail view to a feed.

4. **Layout Physics & Visual Polish**
   - **Skeleton Reserve Areas (Zero CLS):** Reserves structural `aspect-ratio` or explicit block-size bounds for async media and charts before load.
   - **Optical Alignment vs. Mathematical Centering:** Nudges asymmetrical icons (such as play triangles by `1–2px` toward `inline-end`) to satisfy human visual perception.
   - **Natural Spring Curves over Linear Transitions:** Uses critically damped springs (`springs.overlay`, `springs.ui`) and directional cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)` / `--ds-ease-soft`).
   - **Elevation via Surface Tinting (Dark Mode):** Communicates depth in dark mode via lightness layering (`canvas` → `surface` → `surface-raised`) and `1px` hairlines rather than heavy drop shadows.

---

## Commands

### Interactive Preview (`preview.html`)

Open `preview.html` directly in any browser to test all 8 palette packs, light/dark modes, LTR/RTL (Hebrew), Levels 0–4 of the accent ladder, animated inputs, glass sheet focus trapping, and the interactive Chapter 05 Good Design Anatomy demos.

### Rebuild & Verify Design Tokens

```bash
node contents/01-fundamentals/scripts/build-tokens.mjs           # regenerate tokens & preview.html (275 WCAG hard checks)
node contents/01-fundamentals/scripts/build-tokens.mjs --check   # verify only
```

### Run & Verify the Golden Examples Next.js App

```bash
cd contents/05-golden-examples/app
npm install
npm run typecheck          # tsc --noEmit
npm run check:raw          # zero raw colors, palette classes, physical directions, or off-grid spacing
npm run build              # production Next.js build (/landing, /auth, /chat, /dashboard)
npm run verify:behaviour   # Playwright end-to-end behavioural verification across all routes
```

---

## Status

| Part | State |
|---|---|
| `01-fundamentals` token generator & 8 packs | Complete; 275 WCAG hard checks pass (`0` failures) |
| `02-rules` (`ui-rules.md`, `ux-rules.md`, `design-anatomy.md`, `i18n-rtl.md`) | Complete |
| `03-libraries` (`stack.md`) | Complete |
| `04-signature-moves` | Complete |
| `05-golden-examples/app` (`/landing`, `/auth`, `/chat`, `/dashboard`) | Complete; verified across packs × light/dark × LTR/RTL × desktop/mobile |
| `unpack.sh` + `preview.html` + `contents/` wrapper | Complete; verified passwordless local unpack into `~/.cursor/skills/` |
