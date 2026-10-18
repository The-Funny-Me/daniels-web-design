# `/web-design` Work Folder & Skill System

A complete design-system repository and agentic skill specification for high-craft, luxury web application design ("minimal maximum", white velvet sheets aesthetic).

---

## Directory Structure

```
web-design/
  SKILL.md                 # Primary skill definition & system prompt
  README.md                # System documentation & folder map
  references.md            # Sourced design references & verified guidelines
  HANDOFF.md               # Continuous build logs and state handoff specs
  preview.html             # Standalone interactive showcase page
  01-fundamentals/         # Token generator pipeline, OKLCH rules, contrast checks
    core.json              # Core values, timings, springs, elevation rules
    contrast-report.json   # Automated WCAG AA hard-fail test output
    foundations.md         # Design principles documentation
    palette.md             # Color swatches and palette guide
    preview.html           # Living design tokens preview
    palettes/*.json        # 8 curated color palettes
    scripts/               # Token build & preview generator scripts
  02-rules/                # Mandatory UI/UX rules and physics
    ui-rules.md            # Spatial 8pt grid, dark mode elevation, optical alignment
    ux-rules.md            # Cursor dynamics, form physics, state & motion
    i18n-rtl.md            # Logical properties & Hebrew RTL guidelines
  03-libraries/            # Stack specifications & library rules
    stack.md               # Next.js 16, React 19, Tailwind v4, Motion, Radix
  04-signature-moves/      # Signature interaction move blueprints
    accent-intensity.md    # 5-level dynamic accent ladder
    animated-inputs.md     # Cycling placeholder & password physics
    interactions.md        # Code patterns for safe triangle, debouncing, optimistic UI
    scroll-and-focus.md    # Smooth scroll focus & chat scroll latch mechanics
    type-moves.md          # Ghost numerals, tracked labels, serif headlines
  05-golden-examples/      # Production Next.js reference codebase
    app/                   # Complete Next.js application with 4 pages
    landing.md             # Landing page specifications
    auth.md                # Auth flow & security sheet specifications
    chat.md                # Chat interface & scroll latch specifications
    dashboard.md           # Dashboard & dataviz specifications
```

---

## System Capabilities

- **8 Design Packs:** Default `champagne-wine`, `brown-navy-lightblue`, `deep-green-brown`, `monochrome`, `navy-cream-green`, `silver-white`, `toxic-white-orange`, `wine-gold`.
- **Navigation & Cursor Physics:** Submenu aiming safe-triangle vector buffer, expanded hit targets (Fitts's Law), 150ms hover intent delay.
- **Search & Input Physics:** 250ms debounced queries, backspace cache lookup, submit button dimension locks, mobile `inputmode` tailoring.
- **State & Motion Physics:** Instant optimistic UI updates with silent background sync and rollback toasts, focus trapping/restoration, natural cubic-bezier spring curves.
- **Visual Polish:** Zero-CLS skeleton reserve areas, 1–2px optical icon alignments, dark mode elevation tint layering.

---

## Running the Showcase & App

- Open `preview.html` directly in any browser to interactively test all signature moves, cursor dynamics, form physics, and design packs in real time.
- Launch the Next.js golden examples:
  ```bash
  cd 05-golden-examples/app
  npm install
  npm run dev
  ```
