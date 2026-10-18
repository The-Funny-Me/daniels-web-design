# 05 · Golden examples

Coding agents pattern-match. A golden example is a small set of pristine, fully working components and pages that fix import structure, typing and visual aesthetic. **Pointing an agent at these files is how the system stays consistent.**

## Status

**Briefs and acceptance criteria only. The component code is not built yet**, by agreement: you review the folder, docs and token generator first, and approve before the examples are written. This directory defines exactly what will be built.

## The four examples

| Brief | Showcases |
|---|---|
| `landing.md` | Hero, ghost numerals, tracked labels, scroll-focus, accent-intensity ladder, metal hairlines |
| `auth.md` | Animated inputs, password dotting (LTR/RTL), overlay physics, inline error recovery |
| `chat.md` | Native up-scroll, bottom snap, over-scroll reveal, glass composer, streaming rules |
| `dashboard.md` | Cards, table, adaptive loading, hybrid destructive actions, glass + tint depth |

## Requirements shared by all four

1. **Stack:** Next.js App Router, TypeScript strict, Tailwind v4, shadcn/ui on Radix, Phosphor thin/light, Motion + anime.js as bounded in `03-libraries/stack.md`.
2. **Default pack** (`champagne-wine`), built with a **runtime switcher** in a shared `DesignSwitcher` pattern component: pack (all 8), light/dark, **LTR/RTL**. Swapping any of these restyles every example without touching a component.
3. **Logical properties everywhere.** Each example ships with Hebrew sample content through the `t()` dictionary and a live LTR/RTL toggle.
4. **Zero raw values:** the grep checklist in `02-rules/ui-rules.md` returns nothing.
5. **Motion discipline:** one hero move per page, budget from `04-signature-moves/README.md`; reduced-motion state verified.
6. **Verification:** `tsc --noEmit`, lint, and a screenshot matrix for the default pack in light/dark × LTR/RTL, plus two other packs, are produced when the examples are built.

## Shared pattern components (built once, reused)

`DesignSwitcher` · `AnimatedInput` · `GlassPanel` · `GlassSheet` · `ScrimDialog` · `Toast` (Sonner, glass) · `Loader` (adaptive) · `GhostNumeral` · `Label` (tracked) · `AccentBurst` (levels 1–4) · `Reveal` (staggered fade-in) · `ErrorRegion` (inline recovery with Retry)

## Order of work (after your approval)

1. Project scaffold + token wiring + switcher + `t()` and direction helpers
2. Shared pattern components, each with a tiny isolated demo route
3. Auth → Dashboard → Chat → Landing (increasing animation complexity)
4. Verification pass and screenshot matrix; update `SKILL.md` status

## References

`references/` is where your inspiration screenshots go; see `../references.md`.
