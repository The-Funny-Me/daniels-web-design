---
name: web-design
description: Build web UI (landing pages, apps, dashboards, auth, chat) in a luxury, minimal, spacious style using a token-driven design system with swappable palette packs, strict UI/UX rules, a fixed Next.js + Tailwind v4 + shadcn/ui stack, and signature motion. Use for any request to design, build, restyle or review front-end UI.
---

# /web-design

A specification-first design system. Everything is a token, every rule is checkable, and every look is a swappable palette pack.

**Feeling to hit:** white velvet sheets in a golden hotel room. "Minimal maximum": few elements, each with generous room, each with a considered detail. Calm springs, quiet glass, hairlines, serif display type.

## Workflow (follow in order)

1. **Pick the palette pack.** Read the brief, then propose 2–3 packs from `01-fundamentals/palette.md` as a short this-or-that, default `champagne-wine`. Ask once; do not skip the question unless the user already named a pack. State the choice in your first message. (Palettes express taste; if none fits, add a seed in `01-fundamentals/palettes/` and run the build.)
2. **Load tokens.** Use `01-fundamentals/tokens.css`, `tailwind-theme.css` and `shadcn-bridge.css`. Set `data-pack`, `data-theme`, `dir` on `<html>`. Never write a raw color, radius, shadow, spacing or duration.
3. **Read the rules before writing code:** `02-rules/ui-rules.md`, `02-rules/ux-rules.md`, `02-rules/i18n-rtl.md`.
4. **Stay inside the stack:** `03-libraries/stack.md`. No new dependencies, fonts or icon sets without asking.
5. **Apply signature moves** from `04-signature-moves/` deliberately, within the accent-intensity budget. Restraint is the brand.
6. **Pattern-match golden examples** in `05-golden-examples/` for import structure, typing and visual aesthetic. (Status: briefs only; component code is built in the next phase. Until then follow the briefs and the rules.)
7. **Run the delivery checklist** at the end of `02-rules/ui-rules.md`, in two packs × light/dark × LTR/RTL, before reporting done.

## Hard rules (the short list)

- Roles, not colors: `bg-canvas text-ink border-hairline`, `var(--ds-accent-solid)`.
- 8pt inside components, Fibonacci `section-*` between sections.
- Logical properties only; every component works in RTL (Hebrew) and LTR.
- AA contrast is a hard fail. Raw `accent` is decorative only; use `accent-text` / `accent-ui` / `accent-solid`.
- Pill controls, 24px cards. Tint for base surfaces, glass only for overlays, never glass on glass.
- Calm springs: overlays use the critically damped `overlay` spring, no overshoot. Reduced motion collapses everything to fades.
- No spinners. Adaptive loading: <300ms no loader, then loader ≥600ms, hand off into a staggered fade-in.
- Reversible destructive → undo toast; irreversible → typed-confirmation modal. Errors contained inline with Retry.
- Phosphor icons (thin/light). Motion for UI, anime.js for SVG/scroll sequences. shadcn/ui on Radix.

## Files

| Path | What |
|---|---|
| `01-fundamentals/foundations.md` | Type, spacing, radius, depth, motion, loading, layout, color roles |
| `01-fundamentals/core.json`, `palettes/*.json` | Token sources |
| `01-fundamentals/scripts/build-tokens.mjs` | Generator with WCAG hard-fail checks |
| `01-fundamentals/{tokens.json,tokens.css,tailwind-theme.css,shadcn-bridge.css,palette.md,preview.html}` | Generated outputs |
| `02-rules/` | UI rules, UX rules, i18n/RTL |
| `03-libraries/stack.md` | Approved stack and boundaries |
| `04-signature-moves/` | Interactions, animated inputs, scroll/focus, accent intensity, type moves |
| `05-golden-examples/` | Briefs (landing, auth, chat, dashboard) and reference catalogue |
| `references.md` | Inspiration sources and what is verified about each |
