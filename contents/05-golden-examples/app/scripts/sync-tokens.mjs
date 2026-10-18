// Rebuilds the design tokens from 01-fundamentals and copies the outputs the app imports into src/design.
// The app never edits these files; change core.json or palettes/*.json and run `npm run tokens`.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const fundamentals = path.resolve(here, '../../../01-fundamentals');
const dest = path.resolve(here, '../src/design');

execFileSync('node', [path.join(fundamentals, 'scripts/build-tokens.mjs')], { stdio: 'inherit' });
fs.mkdirSync(dest, { recursive: true });
for (const f of ['tokens.css', 'shadcn-bridge.css', 'tailwind-theme.css', 'core.json']) {
  fs.copyFileSync(path.join(fundamentals, f), path.join(dest, f));
}
// pack catalogue for the switcher (ids, names, picker swatches)
const tokens = JSON.parse(fs.readFileSync(path.join(fundamentals, 'tokens.json'), 'utf8'));
// swatches are the one place raw pack colors are read: a picker has to show packs other than the active one
const packs = Object.entries(tokens.packs).map(([id, p]) => ({
  id,
  name: p.name,
  isDefault: p.isDefault,
  swatch: { canvas: p.light.canvas, accent: p.light.accent, secondary: p.light.secondary, night: p.dark.canvas },
}));
fs.writeFileSync(path.join(dest, 'packs.json'), JSON.stringify(packs, null, 2) + '\n');
console.log(`synced tokens -> src/design (${packs.length} packs)`);
