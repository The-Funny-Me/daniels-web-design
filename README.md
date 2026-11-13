# `/web-design` — agent skill for luxury, token-driven web UI

A Cursor agent skill plus the design system behind it: OKLCH tokens with 8 palette packs, numbered UI/UX rules, a C1–C40 craft checklist, signature motion, and a verified Next.js reference app ("white velvet sheets in a golden hotel room").

## Install

```bash
git clone https://github.com/The-Funny-Me/daniels-web-design web-design
cd web-design
./unpack.sh
```

`unpack.sh` copies `contents/` (the skill, the only copy) to `~/.cursor/skills/web-design`, skipping build output. It also removes the old duplicate `~/.cursor/skills/Daniels-web-design` install if one exists, so agents see one skill. No sudo. Override the target with `CURSOR_SKILLS_DIR=…`.

## How agents load it

`contents/SKILL.md` is the router: a short digest of the rules every UI task needs, a task table that names the one or two extra files to open, and a concrete done check. Rule ids are stable and unique: `U` ui-rules, `X` ux-rules, `C` craft-checklist, `R` i18n-rtl. Generated files (`tokens.css`, `palette.md`, `preview.html`, …) are imported or run, never read.

## Layout

```
unpack.sh                     installer
contents/                     the skill
├── SKILL.md                  router + digest + done check
├── references.md             sources (not loaded by agents)
├── 01-fundamentals/          core.json, palettes/*.json → build-tokens.mjs → tokens.css/json, tailwind-theme.css,
│                             shadcn-bridge.css, palette.md, contrast-report.json, preview.html; foundations.md
├── 02-rules/                 ui-rules (U), ux-rules (X), craft-checklist (C), i18n-rtl (R), design-anatomy (implementation notes)
├── 03-libraries/stack.md     stack, CSS wiring, library boundaries
├── 04-signature-moves/       interactions, animated-inputs, scroll-and-focus, accent-intensity, type-moves
└── 05-golden-examples/       api.md, landing/auth/chat/dashboard briefs, app/ (Next.js reference)
```

## Commands

```bash
# Tokens (fails on any WCAG AA break); open contents/01-fundamentals/preview.html to see every pack
node contents/01-fundamentals/scripts/build-tokens.mjs

# Reference app
cd contents/05-golden-examples/app
npm install                 # also generates src/design/ from 01-fundamentals (npm run tokens)
npm run typecheck
npm run check:raw           # raw colours, palette classes, physical directions, off-grid spacing
npm run build && npx next start -p 3100
npx playwright install chromium   # once
npm run shots -- /landing   # 2 packs × light/dark × LTR/RTL screenshots + console/overflow check
npm run verify:behaviour    # end-to-end behaviour suite
```
