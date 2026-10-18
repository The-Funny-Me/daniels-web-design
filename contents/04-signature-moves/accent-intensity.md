> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# Accent intensity

**The more an item is accented, the more noticeable its effect.** Effects are a ladder: the importance of the element (not the designer's mood) picks the rung. Effects are drawn from the pack's `fx-1/2/3` and `glow` tokens, so they re-tint automatically.

## The ladder

| Level | Meaning | Effect | Budget |
|---|---|---|---|
| 0 | Plain | none | unlimited |
| 1 | Notable | accent hairline or `accent-ui` icon; faint `glow` on hover | many |
| 2 | Important | soft radial light behind the element (`radial-gradient(circle at 50% 50%, glow, transparent 65%)`, 0.5 opacity), slow 6s breathing pulse (opacity 0.35↔0.6) | few per screen |
| 3 | Key | level 2 + a subtle **shiver** (±0.6px, 2.4s loop, low frequency) on attention triggers only (newly arrived, needs action) | one per screen |
| 4 | Hero | level 3 + **flying particles** (12–24 small points in `fx-1/2/3`, 3–5s lifetimes, drifting outward and fading), once on reveal or on an earned event | one per page, one moment |

An element can be raised or lowered a rung by context, but **never skip the budget**: if a screen already has a level-4, nothing else gets above level 2.

## Specs per effect

**Radial light**: absolutely positioned layer behind the element; `blur(24px)` allowed; pack tint from `glow`. Static under reduced motion (no pulse).

**Shiver**: transform-only (`translate`), amplitude ≤0.6px, never on text that is being read, never continuous; triggers on the event and loops at most 3 cycles before settling. Disabled under reduced motion.

**Particles**: anime.js timeline over absolutely positioned, `aria-hidden` spans or a small canvas; count capped at 24 on desktop, 12 on mobile; `will-change: transform, opacity`; removed from the DOM on completion. Particles never overlap text that must stay legible and never carry information. Disabled under reduced motion (replace with a single radial-light flash).

## Where the level comes from

Derive it from semantics, not taste:

- level 4: the single primary value moment (a purchase confirmed, a goal completed, the hero CTA on reveal)
- level 3: something awaiting the user (a new important notification, a required action)
- level 2: the featured card, selected state of a primary choice
- level 1: links, secondary highlights

## RTL and packs

- Radial and particle origin is the element center, so no direction dependency; drift direction for particles biases toward the inline-end side via `--ds-dir`.
- Metallic packs may tint particles with the metal stops; non-metal packs use `fx-*`.
- On `toxic-white-orange`, the raw lime accent is bright enough to be decorative; effects use it freely while text still uses `accent-text`.
- On `monochrome`, effects are luminance-only (white/graphite glints), never invented hues.

## Acceptance

- Never more than one level-3+ element visible at once.
- Static screenshots remain pleasing with all effects off (reduced motion).
- No effect reduces text contrast below AA at any moment of the animation.
