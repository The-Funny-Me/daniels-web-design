# web-design

A complete design work folder: conventions, tokens, rules, stack, signature moves, golden examples. It is built to be used by humans and agents, and to become the `/web-design` agentic coding skill (`SKILL.md` is already the skill entry point).

## Layout

```
web-design/
├── SKILL.md                    skill entry point (workflow + hard rules + file index)
├── README.md
├── references.md               inspiration sources, with what is and is not verified
├── 01-fundamentals/
│   ├── foundations.md          the numbers: roles, type, spacing, radius, depth, motion, loading, layout
│   ├── core.json               pack-independent tokens (edit here)
│   ├── palettes/*.json         8 color packs (seeds; edit here)
│   ├── scripts/build-tokens.mjs  generator + WCAG hard-fail checks (no dependencies)
│   └── tokens.json · tokens.css · tailwind-theme.css · shadcn-bridge.css · palette.md · preview.html · contrast-report.json   (generated)
├── 02-rules/                   ui-rules.md · ux-rules.md · i18n-rtl.md
├── 03-libraries/stack.md       approved stack and library boundaries
├── 04-signature-moves/         interactions · animated-inputs · scroll-and-focus · accent-intensity · type-moves
└── 05-golden-examples/         briefs (landing, auth, chat, dashboard); references/ for your screenshots
```

## Commands

```bash
node 01-fundamentals/scripts/build-tokens.mjs           # regenerate all token outputs; exit 1 on any hard contrast failure
node 01-fundamentals/scripts/build-tokens.mjs --check   # verify only
```

Open `01-fundamentals/preview.html` in a browser. It is a living showcase of the system, not a swatch sheet: switch pack, light/dark, LTR/RTL (full Hebrew), motion on/off and a simulated slow load, and try the animated inputs, the accent ladder (levels 0 to 4, including the particle burst), the glass sheet, the undo toast and the adaptive loader. Its source is `01-fundamentals/scripts/preview.template.html`; the build injects the tokens.

## Adding a palette pack

1. Create `01-fundamentals/palettes/<id>.json`:
   `id`, `name`, `description`, `canvas {light, dark}`, `accent`, `secondary`, optional `ink {light, dark}` (text tint hints), optional `metal {name, light[4], dark[4]}`.
2. Run the build. Fix any failures it reports (it names the pack, mode and role).
3. Review in `preview.html`. Add the pack to the table in `foundations.md §1`.

Mark exactly one pack `"isDefault": true`.

## Status

| Part | State |
|---|---|
| 01 Fundamentals, token generator, 8 packs | Built; 275 hard checks pass |
| 02 Rules | Written |
| 03 Libraries | Written |
| 04 Signature moves | Specified (parameters, states, a11y, RTL, reduced-motion) |
| 05 Golden examples | **Briefs and acceptance criteria only; component code not built yet** |
| Radius choice | Provisional; confirm against reference screenshots |

## Installing as a skill

Copy this folder to the skills directory your agent reads (for Claude Code: `~/.claude/skills/web-design/` or the project's `.claude/skills/web-design/`). `SKILL.md` frontmatter is already valid. Invoke with `/web-design`.
