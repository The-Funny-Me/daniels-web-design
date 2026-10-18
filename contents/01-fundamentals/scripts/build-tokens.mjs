#!/usr/bin/env node
// Design-token generator. Zero dependencies.
//
//   node 01-fundamentals/scripts/build-tokens.mjs           build everything, exit 1 on hard failures
//   node 01-fundamentals/scripts/build-tokens.mjs --check   verify only, write nothing
//
// Inputs : core.json (pack-independent) + palettes/*.json (seeds)
// Outputs: tokens.json, tokens.css, tailwind-theme.css, palette.md, preview.html, contrast-report.json
//
// Everything is derived in OKLCH. Functional text and UI roles are *tuned* (lightness walked) until they
// pass WCAG 2.x contrast against every surface they can sit on. If a role cannot pass, the build fails.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CHECK_ONLY = process.argv.includes('--check');

// ---------------------------------------------------------------- color math
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const RAD = Math.PI / 180;

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const rgbToHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function rgbToOklab([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function oklabToLinear(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const hexToOklch = (hex) => {
  const [L, a, b] = rgbToOklab(hexToRgb(hex));
  return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) / RAD + 360) % 360 };
};
const inGamut = (lin) => lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
function oklchToHex({ L, C, h }) {
  L = clamp01(L);
  const at = (c) => oklabToLinear(L, c * Math.cos(h * RAD), c * Math.sin(h * RAD));
  let c = C;
  if (!inGamut(at(C))) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(at(mid))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  return rgbToHex(at(c).map((v) => linearToSrgb(clamp01(v))));
}

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * 255));
  return `rgb(${r} ${g} ${b} / ${a})`;
};
const compose = (fgHex, alpha, bgHex) => {
  const f = hexToRgb(fgHex);
  const b = hexToRgb(bgHex);
  return rgbToHex(f.map((v, i) => v * alpha + b[i] * (1 - alpha)));
};

/** Walk lightness in `dir` (+1 lighter, -1 darker) until contrast >= min against every bg. */
function tune(base, bgs, min, dir) {
  const margin = min + 0.06;
  let L = base.L;
  for (let i = 0; i < 400; i++) {
    const hex = oklchToHex({ ...base, L });
    const ratio = Math.min(...bgs.map((b) => contrast(hex, b)));
    if (ratio >= margin) return { hex, ratio, ok: true, oklch: { ...base, L } };
    L += dir * 0.004;
    if (L < 0 || L > 1) break;
  }
  const hex = oklchToHex({ ...base, L: clamp01(L) });
  const ratio = Math.min(...bgs.map((b) => contrast(hex, b)));
  return { hex, ratio, ok: ratio >= min, oklch: { ...base, L: clamp01(L) } };
}

/** Fill + readable on-color. Moves the fill away from the chosen on-color until >= 4.5:1. */
function makeSolid(base, darkOn, lightOn) {
  let L = base.L;
  let last = null;
  for (let i = 0; i < 300; i++) {
    const fill = oklchToHex({ ...base, L });
    const cd = contrast(fill, darkOn);
    const cl = contrast(fill, lightOn);
    const useDark = cd >= cl;
    last = { fill, on: useDark ? darkOn : lightOn, ratio: useDark ? cd : cl, onIsDark: useDark, oklch: { ...base, L } };
    if (last.ratio >= 4.56) break;
    L += (useDark ? 1 : -1) * 0.004;
    if (L < 0 || L > 1) break;
  }
  const hoverL = last.oklch.L + (last.onIsDark ? 0.035 : -0.035);
  last.hover = oklchToHex({ ...last.oklch, L: hoverL });
  last.hoverRatio = contrast(last.hover, last.on);
  return last;
}

// ---------------------------------------------------------------- derivation
const STATUS_HUES = { success: 152, warning: 78, danger: 22, info: 245 };

function deriveMode(seed, mode, checks) {
  const dark = mode === 'dark';
  const dir = dark ? 1 : -1;
  const t = {}; // output tokens
  const record = (name, fg, bgs, min, severity = 'hard', note = '') => {
    const list = bgs.map((b) => ({ b, r: contrast(fg, b) }));
    const worst = list.reduce((m, x) => (x.r < m.r ? x : m));
    checks.push({
      pack: seed.id, mode, name, fg, bg: worst.b, ratio: +worst.r.toFixed(2), min, severity, pass: worst.r >= min, note,
    });
  };

  // ---- surfaces
  const canvas = seed.canvas[mode];
  const cv = hexToOklch(canvas);
  let surface, raised, sunken;
  if (!dark) {
    surface = oklchToHex({ L: Math.min(0.997, cv.L + 0.02), C: cv.C * 0.6, h: cv.h });
    raised = surface;
    sunken = oklchToHex({ L: cv.L - 0.03, C: cv.C * 1.15 + 0.002, h: cv.h });
  } else {
    surface = oklchToHex({ L: cv.L + 0.032, C: cv.C, h: cv.h });
    raised = oklchToHex({ L: cv.L + 0.065, C: cv.C, h: cv.h });
    sunken = oklchToHex({ L: Math.max(0.04, cv.L - 0.012), C: cv.C, h: cv.h });
  }
  const bgs = dark ? [canvas, surface, raised, sunken] : [canvas, surface, sunken];
  const uiBgs = dark ? [canvas, surface, raised] : [canvas, surface];
  Object.assign(t, { canvas, surface, 'surface-raised': raised, 'surface-sunken': sunken });

  // ---- text
  const inkSeed = seed.ink && seed.ink[mode] ? hexToOklch(seed.ink[mode]) : null;
  const tint = inkSeed || { C: Math.max(0.012, Math.min(cv.C * 1.5, 0.04)), h: cv.h };
  const startP = inkSeed ? inkSeed.L : dark ? 0.95 : 0.22;
  const p = tune({ L: startP, C: dark ? Math.min(tint.C, 0.03) : tint.C, h: tint.h }, bgs, 12, dir);
  const s = tune({ L: dark ? 0.8 : 0.42, C: tint.C * 0.9, h: tint.h }, bgs, 7, dir);
  const q = tune({ L: dark ? 0.66 : 0.54, C: tint.C * 0.8, h: tint.h }, bgs, 4.5, dir);
  Object.assign(t, { 'text-primary': p.hex, 'text-secondary': s.hex, 'text-tertiary': q.hex });
  record('text-primary', p.hex, bgs, 12);
  record('text-secondary', s.hex, bgs, 7);
  record('text-tertiary', q.hex, bgs, 4.5);

  // ---- borders
  t['border-hairline'] = rgba(p.hex, dark ? 0.12 : 0.1);
  t['border-strong'] = rgba(p.hex, dark ? 0.26 : 0.22);
  const bc = tune({ L: dark ? 0.42 : 0.72, C: tint.C * 0.6, h: tint.h }, uiBgs, 3, dir);
  t['border-control'] = bc.hex;
  record('border-control (inputs, WCAG 1.4.11)', bc.hex, uiBgs, 3);

  // ---- on-colors (pack-tinted darkest/lightest ink)
  const darkOn = oklchToHex({ L: 0.17, C: Math.min(tint.C, 0.03), h: tint.h });
  const lightOn = oklchToHex({ L: 0.985, C: Math.min(tint.C, 0.01), h: tint.h });

  // ---- accent + secondary
  const roles = (name, seedHex, adapt) => {
    const o0 = hexToOklch(seedHex);
    const o = dark ? adapt(o0) : o0;
    const deco = oklchToHex(o);
    t[name] = deco;
    record(`${name} (decorative, info)`, deco, [canvas], 3, 'info', 'Decorative only: borders, glints, fills with no information. Not for text.');
    const ui = tune(o, uiBgs, 3, dir);
    t[`${name}-ui`] = ui.hex;
    record(`${name}-ui (icons, rings, focus)`, ui.hex, uiBgs, 3);
    const tx = tune(o, bgs, 4.5, dir);
    t[`${name}-text`] = tx.hex;
    record(`${name}-text`, tx.hex, bgs, 4.5);
    const so = makeSolid(o, darkOn, lightOn);
    t[`${name}-solid`] = so.fill;
    t[`${name}-solid-hover`] = so.hover;
    t[`on-${name}`] = so.on;
    record(`on-${name} on ${name}-solid`, so.on, [so.fill], 4.5);
    record(`on-${name} on ${name}-solid-hover`, so.on, [so.hover], 4.5);
  };
  roles('accent', seed.accent, (o) => ({ ...o, L: o.L < 0.65 ? 0.68 : Math.min(0.9, o.L + 0.03) }));
  // near-neutral secondaries (monochrome) invert to a bright fill in dark mode; chromatic ones (wine, navy) lift only enough to keep presence
  roles('secondary', seed.secondary, (o) => (o.C < 0.03 ? { ...o, L: 0.92 } : { ...o, L: Math.max(o.L + 0.1, 0.42) }));
  t['focus-ring'] = t['accent-ui'];

  // ---- status colors (calm: low chroma, never alarm-red by default)
  for (const [name, hue] of Object.entries(STATUS_HUES)) {
    const f = tune({ L: dark ? 0.78 : 0.45, C: dark ? 0.11 : 0.12, h: hue }, bgs, 4.5, dir);
    t[name] = f.hex;
    t[`${name}-bg`] = rgba(f.hex, dark ? 0.14 : 0.1);
    t[`${name}-border`] = rgba(f.hex, 0.35);
    record(name, f.hex, bgs, 4.5);
  }

  // ---- glass: smallest alpha whose worst-case composite keeps text readable
  const worstBackdrop = dark ? '#FFFFFF' : '#000000';
  let alpha = 0.6;
  let glassOk = false;
  for (; alpha <= 0.941; alpha += 0.04) {
    const comp = compose(surface, alpha, worstBackdrop);
    if (contrast(p.hex, comp) >= 7 && contrast(s.hex, comp) >= 4.5) {
      glassOk = true;
      break;
    }
  }
  alpha = +Math.min(alpha, 0.94).toFixed(2);
  const comp = compose(surface, alpha, worstBackdrop);
  t['glass-bg'] = rgba(surface, alpha);
  t['glass-border'] = rgba(p.hex, dark ? 0.16 : 0.14);
  checks.push({
    pack: seed.id, mode, name: `glass worst-case (alpha ${alpha}, text-secondary over ${dark ? 'white' : 'black'} backdrop)`,
    fg: s.hex, bg: comp, ratio: +contrast(s.hex, comp).toFixed(2), min: 4.5, severity: 'hard', pass: glassOk, note: '',
  });

  // ---- shadows, scrim, fx
  const shadowBase = oklchToHex({ L: dark ? 0.05 : 0.28, C: dark ? 0.02 : 0.05, h: cv.h });
  const k = dark ? 2.2 : 1;
  const a = (v) => +(v * k).toFixed(3);
  t['shadow-color'] = shadowBase;
  t['shadow-sm'] = `0 1px 2px ${rgba(shadowBase, a(0.06))}, 0 2px 8px -2px ${rgba(shadowBase, a(0.05))}`;
  t['shadow-md'] = `0 2px 4px ${rgba(shadowBase, a(0.04))}, 0 12px 32px -8px ${rgba(shadowBase, a(0.12))}`;
  t['shadow-lg'] = `0 4px 8px ${rgba(shadowBase, a(0.04))}, 0 32px 80px -20px ${rgba(shadowBase, a(0.22))}`;
  t['scrim'] = rgba(shadowBase, dark ? 0.62 : 0.46);
  t['glow'] = rgba(t['accent-ui'], 0.35);
  t['fx-1'] = t['accent'];
  t['fx-2'] = oklchToHex({ ...hexToOklch(t['accent']), L: Math.min(0.95, hexToOklch(t['accent']).L + 0.12) });
  t['fx-3'] = t['secondary-ui'];

  // ---- metals (only packs that define them)
  if (seed.metal) {
    const stops = seed.metal[mode];
    t['metal-gradient'] = `linear-gradient(135deg, ${stops.join(', ')})`;
    t['metal-hairline'] = `linear-gradient(90deg, transparent, ${stops[1]}, ${stops[2]}, ${stops[3]}, transparent)`;
  } else {
    // Packs without metals must reset the variables, otherwise the default pack's metals leak through the cascade.
    // `initial` makes var(--ds-metal-*, fallback) take its fallback.
    t['metal-gradient'] = 'initial';
    t['metal-hairline'] = 'initial';
  }
  t['color-scheme'] = mode;
  return t;
}

// ---------------------------------------------------------------- load
const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'core.json'), 'utf8'));
const paletteDir = path.join(ROOT, 'palettes');
const seeds = fs
  .readdirSync(paletteDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(paletteDir, f), 'utf8')))
  .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0) || a.id.localeCompare(b.id));
if (seeds.filter((s) => s.isDefault).length !== 1) throw new Error('Exactly one palette must set "isDefault": true');

const checks = [];
const packs = {};
for (const seed of seeds) {
  packs[seed.id] = {
    name: seed.name,
    description: seed.description,
    isDefault: !!seed.isDefault,
    light: deriveMode(seed, 'light', checks),
    dark: deriveMode(seed, 'dark', checks),
  };
}

// spring sanity: damping >= critical so overlays never overshoot
for (const [name, sp] of Object.entries(core.motion.spring)) {
  if (name.startsWith('$')) continue;
  const critical = 2 * Math.sqrt(sp.stiffness * sp.mass);
  checks.push({
    pack: '(core)', mode: '-', name: `spring.${name} damping ${sp.damping} >= critical ${critical.toFixed(1)}`,
    fg: '-', bg: '-', ratio: +(sp.damping / critical).toFixed(2), min: 1, severity: 'hard', pass: sp.damping >= critical, note: '',
  });
}

const hardFails = checks.filter((c) => c.severity === 'hard' && !c.pass);
const infoLow = checks.filter((c) => c.severity === 'info' && !c.pass);

// ---------------------------------------------------------------- emit helpers
const P = '--ds-';
const decl = (obj, indent = '  ') =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}${k.startsWith('color-scheme') ? 'color-scheme' : P + k}: ${v};`)
    .join('\n');

function coreVars() {
  const o = {};
  for (const [k, v] of Object.entries(core.font)) o[`font-${k}`] = v;
  for (const [k, v] of Object.entries(core.text)) o[`text-${k}`] = v;
  for (const [k, v] of Object.entries(core.leading)) o[`leading-${k}`] = v;
  for (const [k, v] of Object.entries(core.tracking)) o[`tracking-${k}`] = v;
  for (const [k, v] of Object.entries(core.weight)) o[`weight-${k}`] = v;
  for (const [k, v] of Object.entries(core.radius)) o[`radius-${k}`] = v;
  for (const [k, v] of Object.entries(core.space)) o[`space-${k.replace('.', '_')}`] = v;
  for (const [k, v] of Object.entries(core.section)) o[`section-${k}`] = v;
  for (const [k, v] of Object.entries(core.layout)) o[k] = v;
  for (const [k, v] of Object.entries(core.motion.duration)) o[`duration-${k}`] = v;
  o['stagger'] = core.motion.stagger;
  o['dir'] = '1';
  o['reveal-duration'] = core.loading.revealDurationMs + 'ms';
  for (const [k, v] of Object.entries(core.motion.ease)) o[`ease-${k}`] = v;
  o['glass-blur'] = core.glass.blur;
  o['glass-saturate'] = core.glass.saturate;
  o['scrim-blur'] = core.glass['scrim-blur'];
  for (const [k, v] of Object.entries(core.z)) o[`z-${k}`] = v;
  return o;
}

function colorVars(tokens) {
  const o = {};
  for (const [k, v] of Object.entries(tokens)) o[k] = v;
  return o;
}

// ---------------------------------------------------------------- tokens.css
function buildCss() {
  const def = seeds.find((s) => s.isDefault).id;
  const out = [];
  out.push('/* GENERATED by 01-fundamentals/scripts/build-tokens.mjs. Do not edit; change core.json or palettes/*.json. */');
  out.push('/* Selectors: [data-pack="<id>"] and [data-theme="light|dark"] on <html>. With no data-theme, prefers-color-scheme decides. */\n');
  out.push(`:root {\n${decl(coreVars())}\n}\n`);
  // default pack (no data-pack attribute)
  out.push(`/* default pack: ${def} */`);
  out.push(`:root,\n:root[data-theme="light"] {\n${decl(colorVars(packs[def].light))}\n}`);
  out.push(`:root[data-theme="dark"] {\n${decl(colorVars(packs[def].dark))}\n}`);
  out.push(`@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${decl(colorVars(packs[def].dark), '    ')}\n  }\n}\n`);
  for (const seed of seeds) {
    const pk = packs[seed.id];
    out.push(`/* pack: ${seed.id} (${seed.name}) */`);
    out.push(`:root[data-pack="${seed.id}"],\n:root[data-pack="${seed.id}"][data-theme="light"] {\n${decl(colorVars(pk.light))}\n}`);
    out.push(`:root[data-pack="${seed.id}"][data-theme="dark"] {\n${decl(colorVars(pk.dark))}\n}`);
    out.push(`@media (prefers-color-scheme: dark) {\n  :root[data-pack="${seed.id}"]:not([data-theme]) {\n${decl(colorVars(pk.dark), '    ')}\n  }\n}\n`);
  }
  out.push(`/* direction: --ds-dir is +1 in LTR, -1 in RTL (use in translateX); Hebrew gets taller leading and no letter-spacing (labels and display) */\n:root[dir="rtl"] {\n  ${P}dir: -1;\n  ${P}leading-body: ${core.leading['body-rtl']};\n  ${P}leading-display: ${core.leading['heading']};\n  ${P}tracking-label: 0;\n  ${P}tracking-display: 0;\n}\n`);
  return out.join('\n');
}

// ---------------------------------------------------------------- tailwind theme (Tailwind v4)
function buildTailwind() {
  const def = packs[seeds.find((s) => s.isDefault).id].light;
  const color = (name, token) => `  --color-${name}: var(${P}${token});`;
  const rows = [];
  rows.push('/* GENERATED by 01-fundamentals/scripts/build-tokens.mjs. Import after tokens.css:  @import "tailwindcss"; @import "./tokens.css"; @import "./tailwind-theme.css"; */');
  rows.push('@theme inline {');
  rows.push('  /* colors: semantic roles only. There is no raw palette, so arbitrary hex values have nothing to hide behind. */');
  const colorMap = {
    canvas: 'canvas', surface: 'surface', 'surface-raised': 'surface-raised', 'surface-sunken': 'surface-sunken',
    ink: 'text-primary', 'ink-2': 'text-secondary', 'ink-3': 'text-tertiary',
    hairline: 'border-hairline', 'hairline-strong': 'border-strong', control: 'border-control',
    // Tailwind names for the accent family are "brand-*" and for the secondary family "deep-*", because shadcn/ui owns
    // the Tailwind color keys "accent" and "secondary". The CSS roles keep their stable names (--ds-accent*, --ds-secondary*).
    brand: 'accent', 'brand-ui': 'accent-ui', 'brand-text': 'accent-text', 'brand-solid': 'accent-solid',
    'brand-solid-hover': 'accent-solid-hover', 'on-brand': 'on-accent',
    deep: 'secondary', 'deep-ui': 'secondary-ui', 'deep-text': 'secondary-text', 'deep-solid': 'secondary-solid',
    'deep-solid-hover': 'secondary-solid-hover', 'on-deep': 'on-secondary',
    focus: 'focus-ring', glass: 'glass-bg', 'glass-edge': 'glass-border', scrim: 'scrim', glow: 'glow',
    'fx-1': 'fx-1', 'fx-2': 'fx-2', 'fx-3': 'fx-3',
    success: 'success', 'success-bg': 'success-bg', 'success-border': 'success-border',
    warning: 'warning', 'warning-bg': 'warning-bg', 'warning-border': 'warning-border',
    danger: 'danger', 'danger-bg': 'danger-bg', 'danger-border': 'danger-border',
    info: 'info', 'info-bg': 'info-bg', 'info-border': 'info-border',
  };
  for (const [n, tkn] of Object.entries(colorMap)) rows.push(color(n, tkn));
  rows.push('');
  rows.push('  /* type */');
  rows.push(`  --font-display: var(${P}font-display);`);
  rows.push(`  --font-sans: var(${P}font-body);`);
  rows.push(`  --font-mono: var(${P}font-mono);`);
  for (const k of Object.keys(core.text)) rows.push(`  --text-${k}: var(${P}text-${k});`);
  for (const k of ['display', 'heading', 'body']) rows.push(`  --leading-${k}: var(${P}leading-${k});`);
  for (const k of ['display', 'label']) rows.push(`  --tracking-${k}: var(${P}tracking-${k});`);
  rows.push('');
  rows.push('  /* shape + depth */');
  for (const k of Object.keys(core.radius)) rows.push(`  --radius-${k}: var(${P}radius-${k});`);
  for (const k of ['sm', 'md', 'lg']) rows.push(`  --shadow-${k}: var(${P}shadow-${k});`);
  rows.push('');
  rows.push('  /* rhythm + layout: py-section-md, max-w-app, ... */');
  for (const k of Object.keys(core.section)) rows.push(`  --spacing-section-${k}: var(${P}section-${k});`);
  rows.push(`  --spacing-touch: var(${P}space-touch);`);
  rows.push(`  --container-app: var(${P}container-app);`);
  rows.push(`  --container-marketing: var(${P}container-marketing);`);
  rows.push(`  --container-reading: var(${P}container-reading);`);
  rows.push('');
  rows.push('  /* motion */');
  rows.push(`  --ease-soft: var(${P}ease-soft);`);
  rows.push(`  --ease-in-out: var(${P}ease-in-out);`);
  rows.push('}');
  rows.push('');
  rows.push('/* durations, z-index and glass params have no Tailwind namespace; use arbitrary values:');
  rows.push('   duration-(--ds-duration-ui)   z-(--ds-z-modal)   backdrop-blur-(--ds-glass-blur) */');
  rows.push('');
  rows.push('@layer base {');
  rows.push('  html { background: var(--ds-canvas); color: var(--ds-text-primary); font-family: var(--ds-font-body); line-height: var(--ds-leading-body); }');
  rows.push('  :focus-visible { outline: 2px solid var(--ds-focus-ring); outline-offset: 3px; }');
  rows.push('  ::selection { background: color-mix(in oklch, var(--ds-accent) 35%, transparent); }');
  rows.push('}');
  void def;
  return rows.join('\n') + '\n';
}

// ---------------------------------------------------------------- shadcn/ui bridge
function buildShadcnBridge() {
  return `/* GENERATED by 01-fundamentals/scripts/build-tokens.mjs.
   Maps shadcn/ui's CSS variables onto design-system roles, so components added with \`npx shadcn add\` follow the active pack and mode.
   Import order in globals.css:  tailwindcss -> shadcn globals -> tokens.css -> shadcn-bridge.css -> tailwind-theme.css (last, so its radii and colors win). */
:root {
  --background: var(--ds-canvas);
  --foreground: var(--ds-text-primary);
  --card: var(--ds-surface);
  --card-foreground: var(--ds-text-primary);
  --popover: var(--ds-glass-bg);
  --popover-foreground: var(--ds-text-primary);
  --primary: var(--ds-accent-solid);
  --primary-foreground: var(--ds-on-accent);
  --secondary: var(--ds-secondary-solid);
  --secondary-foreground: var(--ds-on-secondary);
  --muted: var(--ds-surface-sunken);
  --muted-foreground: var(--ds-text-secondary);
  --accent: var(--ds-surface-raised);
  --accent-foreground: var(--ds-text-primary);
  --destructive: var(--ds-danger);
  --border: var(--ds-border-hairline);
  --input: var(--ds-border-control);
  --ring: var(--ds-focus-ring);
  --radius: var(--ds-radius-md);
}
`;
}

// ---------------------------------------------------------------- palette.md
function buildPaletteMd() {
  const L = [];
  L.push('# Palette packs');
  L.push('');
  L.push('> GENERATED by `scripts/build-tokens.mjs` from `palettes/*.json`. Do not edit by hand.');
  L.push('');
  L.push('Every pack fills the same semantic contract, so components never change when the pack does. Pick a pack with `data-pack="<id>"` and a mode with `data-theme="light|dark"` on `<html>`.');
  L.push('');
  L.push(`Verification: ${checks.filter((c) => c.severity === 'hard').length} hard checks, ${hardFails.length} failing. Decorative accent below 3:1 on canvas (allowed, never for text): ${infoLow.length}.`);
  L.push('');
  L.push('| Pack | id | Character |');
  L.push('|---|---|---|');
  for (const s of seeds) L.push(`| ${s.name}${s.isDefault ? ' **(default)**' : ''} | \`${s.id}\` | ${s.description} |`);
  L.push('');
  const keyRoles = ['canvas', 'surface', 'surface-raised', 'surface-sunken', 'text-primary', 'text-secondary', 'text-tertiary', 'border-control',
    'accent', 'accent-ui', 'accent-text', 'accent-solid', 'on-accent', 'secondary', 'secondary-ui', 'secondary-text', 'secondary-solid', 'on-secondary',
    'success', 'warning', 'danger', 'info'];
  for (const seed of seeds) {
    const pk = packs[seed.id];
    L.push(`## ${seed.name} (\`${seed.id}\`)`);
    L.push('');
    L.push(seed.description);
    L.push('');
    L.push('| Role | Light | Dark |');
    L.push('|---|---|---|');
    for (const r of keyRoles) L.push(`| \`${r}\` | \`${pk.light[r]}\` | \`${pk.dark[r]}\` |`);
    if (seed.metal) {
      L.push(`| metal (\`${seed.metal.name}\`) | ${seed.metal.light.map((h) => `\`${h}\``).join(' ')} | ${seed.metal.dark.map((h) => `\`${h}\``).join(' ')} |`);
    }
    L.push('');
    L.push('Contrast checks (worst-case background for each role):');
    L.push('');
    L.push('| Mode | Check | Ratio | Min | Result |');
    L.push('|---|---|---|---|---|');
    for (const c of checks.filter((x) => x.pack === seed.id)) {
      const res = c.pass ? 'pass' : c.severity === 'info' ? 'below 3:1 (decorative only)' : '**FAIL**';
      L.push(`| ${c.mode} | ${c.name} | ${c.ratio} | ${c.min} | ${res} |`);
    }
    L.push('');
  }
  return L.join('\n');
}

// ---------------------------------------------------------------- preview.html (template: scripts/preview.template.html)
function buildPreview(css) {
  const tpl = fs.readFileSync(path.join(HERE, 'preview.template.html'), 'utf8');
  const options = seeds.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
  return tpl
    .replace('/*__TOKENS_CSS__*/', () => css)
    .replace('__PACK_OPTIONS__', () => options)
    .replace('__DEFAULT_PACK__', () => seeds.find((s) => s.isDefault).id);
}

// ---------------------------------------------------------------- write
const css = buildCss();
const report = {
  generatedFrom: seeds.map((s) => s.id),
  hardChecks: checks.filter((c) => c.severity === 'hard').length,
  hardFailures: hardFails.map((c) => ({ pack: c.pack, mode: c.mode, name: c.name, ratio: c.ratio, min: c.min })),
  decorativeBelow3: infoLow.map((c) => ({ pack: c.pack, mode: c.mode, name: c.name, ratio: c.ratio })),
};

if (!CHECK_ONLY) {
  fs.writeFileSync(path.join(ROOT, 'tokens.json'), JSON.stringify({ core, packs }, null, 2) + '\n');
  fs.writeFileSync(path.join(ROOT, 'tokens.css'), css);
  fs.writeFileSync(path.join(ROOT, 'tailwind-theme.css'), buildTailwind());
  fs.writeFileSync(path.join(ROOT, 'shadcn-bridge.css'), buildShadcnBridge());
  fs.writeFileSync(path.join(ROOT, 'palette.md'), buildPaletteMd());
  fs.writeFileSync(path.join(ROOT, 'preview.html'), buildPreview(css));
  fs.writeFileSync(path.join(ROOT, 'contrast-report.json'), JSON.stringify({ ...report, checks }, null, 2) + '\n');
}

console.log(`packs: ${seeds.length}  hard checks: ${report.hardChecks}  failures: ${hardFails.length}  decorative accents <3:1: ${infoLow.length}`);
for (const f of hardFails) console.log(`  FAIL ${f.pack} ${f.mode} ${f.name}: ${f.ratio} < ${f.min}`);
for (const f of infoLow) console.log(`  note ${f.pack} ${f.mode} ${f.name}: ${f.ratio} (decorative only)`);
process.exit(hardFails.length ? 1 : 0);
