---
name: web-design
description: Complete design system, core rules, signature moves, and golden examples for luxury web applications. Use when designing, building, or reviewing web UI/UX, tokens, micro-interactions, layout physics, cursor dynamics, forms, dark mode elevation, or Next.js components.
---

# /web-design Skill

A comprehensive design system and engineering framework for building high-craft, luxury web applications ("minimal maximum", white velvet sheets aesthetic).

## System Architecture

The skill is organized into five core pillars:

1. **`01-fundamentals/`**: Semantic tokens (OKLCH color pipeline), 8 design packs, WCAG AA contrast rules, dark mode elevation tinting.
2. **`02-rules/`**: Mandatory UI, UX, i18n/RTL, navigation, cursor dynamics, form physics, and state management rules.
3. **`03-libraries/`**: Pinned technology stack (Next.js App Router, React 19, Tailwind v4, Motion, anime.js, Radix).
4. **`04-signature-moves/`**: Specialized interaction patterns (Safe Triangle Buffer, Hover Intent Delay, Animated Inputs, Glint Sweep, Lift & Press, Scroll Latch, Optimistic Rollbacks).
5. **`05-golden-examples/`**: Fully deployable Next.js reference applications (`landing`, `auth`, `chat`, `dashboard`).

## Core Principles & Physics

- **Semantic Token Discipline:** Use semantic roles only (`canvas`, `surface`, `ink`, `brand-ui`, `brand-text`, `hairline`). Raw palette colors in component code are strictly prohibited.
- **8pt Spatial Rhythm:** All internal spacing adheres strictly to 8pt increments (Tailwind steps 1, 2, 3, 4, 6, 8, 12, 16, 24, 32). Banned steps: 5, 7, 9, 10, 11.
- **Logical Directionality:** Exclusively use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Never use physical `left`, `right`, `margin-left`, etc.
- **Cursor & Navigation Dynamics:**
  - **Safe Triangle Buffer:** Dynamic pointer tracking vector math on nested submenus to prevent accidental collapse when moving diagonally.
  - **Fitts's Law Target Expansion:** Interactive click listeners cover the entire container/card, not just inline text.
  - **Hover Intent Delay:** 100–200ms debounce on tooltips and popovers to prevent flickering during cursor sweeps.
- **Form Physics:**
  - **Debounced Intent:** 200–300ms typing pause before autocomplete API calls; instant local cache lookup on backspace.
  - **Button Dimension Lock:** Submit buttons preserve explicit width/height during loading transitions to guarantee 0px layout shift.
  - **Native Keyboard Tailoring:** Mandatory `inputmode` (`numeric`, `decimal`, `email`, `tel`) and `autocomplete` attributes.
- **State & Motion Physics:**
  - **Optimistic UI & Rollback:** Toggles update instantly in UI; silent network retries automatically revert state with an undo toast on failure.
  - **Focus Trap & Restoration:** Keyboard focus is trapped within active modals and restored to the trigger element upon dismissal.
  - **Natural Spring Curves:** Use directional spring physics or `cubic-bezier(0.16, 1, 0.3, 1)` over linear transitions.
- **Layout & Visual Polish:**
  - **Zero-CLS Skeletons:** Aspect-ratio and bounding box reservations for async media.
  - **Optical Alignment:** Manual 1–2px nudges for asymmetrical icons/play buttons over raw mathematical flex centering.
  - **Dark Mode Surface Elevation:** Visual depth via lightness layering and opacity overlays rather than invisible drop shadows.

## Verification & Workflow

Always verify builds using the provided tooling:
```bash
npm run typecheck       # Validate TypeScript strict mode
npm run check:raw       # Enforce semantic tokens, logical properties, and 8pt rules
node 01-fundamentals/scripts/build-tokens.mjs  # Re-derive OKLCH tokens & WCAG contrast report
```
