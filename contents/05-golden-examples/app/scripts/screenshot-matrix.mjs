// Screenshot matrix + console/overflow check against a running server (default http://localhost:3100).
// usage:  node scripts/screenshot-matrix.mjs <outDir> <path> [full]
// env:    BASE=http://localhost:3100  CONFIGS="pack:theme:dir,pack:theme:dir"  W=1280 H=860  WAIT=2600
//         PLAYWRIGHT_MODULE=/abs/path/to/playwright/index.mjs   CHROMIUM_PATH=/abs/path/to/chromium (optional)
// The app reads ?pack=&theme=&dir=&motion= on load, so every configuration is one URL.
import fs from 'node:fs';

const [, , out = 'shots', page = '/', full] = process.argv;
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE || 'http://localhost:3100';
const configs = (process.env.CONFIGS || 'champagne-wine:light:ltr,champagne-wine:dark:rtl').split(',').map((s) => s.split(':'));
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];
for (const [pack, theme, dir] of configs) {
  const ctx = await browser.newContext({ viewport: { width: Number(process.env.W || 1280), height: Number(process.env.H || 860) } });
  const p = await ctx.newPage();
  const tag = `${pack}/${theme}/${dir}`;
  p.on('console', (m) => {
    // third-party font/network noise is expected in sandboxes without internet
    if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) problems.push(`[${tag}] ${m.text()}`);
  });
  p.on('pageerror', (e) => problems.push(`[pageerror ${tag}] ${e.message}`));
  await p.goto(`${base}${page}?pack=${pack}&theme=${theme}&dir=${dir}${process.env.MOTION ? `&motion=${process.env.MOTION}` : ''}`, { waitUntil: 'load' });
  await p.waitForTimeout(Number(process.env.WAIT || 2600));
  if (full === 'full') {
    await p.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      if (h > vh * 1.2) {
        for (let y = vh * 0.7; y <= h; y += vh * 0.7) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
      }
    });
    await p.waitForTimeout(900);
  }
  const name = `${page.replace(/\//g, '') || 'home'}-${pack}-${theme}-${dir}`;
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full === 'full' });
  const [sw, cw] = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  if (sw > cw) problems.push(`[${name}] horizontal overflow ${sw} > ${cw}`);
  await ctx.close();
}
await browser.close();
console.log(problems.length ? problems.join('\n') : 'no console errors, no horizontal overflow');
