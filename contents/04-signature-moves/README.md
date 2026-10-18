> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# 04 · Signature moves

The micro-details that make the work recognizable. Each move is specified with parameters, states, accessibility, RTL behavior and reduced-motion behavior, so an agent can build it without guessing.

| File | Moves |
|---|---|
| `interactions.md` | Lift & press · specular glint sweep · overlay entrance · tinted-scrim focus mode |
| `animated-inputs.md` | Cycling example placeholders (type, erase, retype) · password dotting animation (RTL/LTR aware) |
| `scroll-and-focus.md` | Smooth scroll on main focus elements · chat: native up, snap-and-reveal at the bottom |
| `accent-intensity.md` | Accent effects that scale with the importance of the accented item (particles, shiver, radial light) |
| `type-moves.md` | Ghost oversized numerals · tracked small-caps labels · Hebrew fallbacks |

## Governing principle: restraint

"Minimal maximum" means few moves, each with room to be noticed. Budget per viewport: **one hero-level move, up to three supporting moves, everything else static.** If a screen has a particle burst, it does not also have a glint sweep on the same element. Moves are tokens-driven, so they re-tint with the pack.

## Every move must declare

1. **Trigger** (hover, focus, mount, scroll, state change)
2. **Parameters** (from tokens; no ad-hoc numbers)
3. **Library** (Motion or anime.js, per `03-libraries/stack.md`)
4. **Reduced motion** state
5. **RTL** behavior
6. **A11y** (what is announced, what is `aria-hidden`)
