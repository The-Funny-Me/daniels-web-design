# 05 · Golden examples

> Agents: start at `api.md`. Open one brief only when `SKILL.md` names that page. Do not read `app/src` until you are copying a single component.

Coding agents pattern-match. A golden example is a small set of pristine, fully working components and pages that fix import structure, typing and visual aesthetic. The index of those components is `api.md`.

## Status

**Complete and verified.** The Next.js 16 + React 19 + Tailwind v4 reference application lives in `05-golden-examples/app/` with all five routes (`/`, `/landing`, `/auth`, `/chat`, `/dashboard`), automated raw-value enforcement (`npm run check:raw`), screenshot matrix (`scripts/screenshot-matrix.mjs`), and Playwright behavioural verification (`npm run verify:behaviour`).

## Running the golden examples

```bash
cd 05-golden-examples/app
npm install
npm run typecheck
npm run check:raw
npm run build
npx next start -p 3100
```

### Routes

| Route | Brief | Showcases |
|---|---|---|
| `/` | — | Index of the four golden examples with pack-tinted `RadialLight` and `GlowCard` links |
| `/landing` | `landing.md` | Sticky glass nav, Lenis smooth scroll, Hero with `GhostNumeral` `01` & level-4 `AccentBurst`, `.hairline-metal`, 3 asymmetric chapters (`02`–`04`) with abstract SVG visuals, 4 `<bdi>` fact `GlowCard`s, statement quote, closing CTA |
| `/auth` | `auth.md` | `AnimatedInput` with password dotting (LTR/RTL), button dimension lock on loading, inline blur validation (`aria-describedby`), contained `RegionError` on `"fail..."` email, `GlassSheet` → typed-phrase `ConfirmDialog` |
| `/chat` | `chat.md` | 201 messages, native upward scroll, downward idle snap within `80px`, rubber-band pull past bottom (`72px` latch) to reveal suggestions panel, streaming + unread pill with `.shiver` |
| `/dashboard` | `dashboard.md` | Stat cards, hand-built SVG `LineChart` (emphasis form, keyboard stepping, table view toggle), sortable `ReservationsTable`, optimistic archive with 8s `undoToast`, adaptive `LoadingGate` (`slow` & `fail` switches), `RegionBoundary` |

### Runtime switcher & URL query parameters

Every page includes the floating `DesignSwitcher` (bottom-`start`) and accepts URL query parameters on load:
`?pack=<id>&theme=light|dark|system&dir=ltr|rtl&motion=on|off`

### Verification scripts

```bash
# Screenshot + console error + horizontal overflow matrix
node scripts/screenshot-matrix.mjs shots /landing full

# Full Playwright interactive behaviour suite
npm run verify:behaviour
```

## References

`references/` is where your inspiration screenshots go; see `../references.md`.
