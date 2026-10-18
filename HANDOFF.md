# HANDOFF: finish the `/web-design` golden examples

> **Pickup mode.** Behave as if you are the same chat that wrote this. Do not re-ask Daniel anything answered in section 12, do not restart or re-scaffold, do not re-derive decisions in section 3. First message to Daniel: one sentence saying you are continuing the examples build (he is used to that), then start work at section 14. Last updated 2026-10-14 08:20 (Asia/Jerusalem).

You are taking over a half-finished build. Read this whole file first, then the repo docs it points to. Everything you need is in the uploaded `web-design/` folder; the previous session's chat transcript is NOT available to you, so treat this file and the repo as the source of truth.

---

## 1. Who and what

- **User:** Daniel. Israeli, fluent in Hebrew and English. Wants directness, technical depth and honest feedback, not reassurance. Works specification-first and wants deployable, actionable results. Do not pad, do not flatter, flag problems plainly. When a decision is genuinely his, ask with short multiple-choice questions ("this or that"); otherwise decide, and say what you decided.
- **Project:** a complete design-system work folder, `web-design/`, that will later become an agentic coding skill invoked as `/web-design`. Folders: `01-fundamentals` (tokens), `02-rules`, `03-libraries`, `04-signature-moves`, `05-golden-examples`. The folder itself stays useful without the skill.
- **Aesthetic:** luxury, easy, spacious, "white velvet sheets on a king sized bed in a golden hotel room", "minimal maximum". Palettes in the repo express his taste; they do not limit it (he likes navy+cream+green, brown+navy+light blue, black/white, red velvet, wine, champagne, bronze/gold/silver, poker-table green, toxic green).
- **Current job:** build the four golden examples as real, working Next.js code: **landing, auth, chat, dashboard**. His instruction was "That's super beautiful, go with the examples" (about the living token preview). Default pack `champagne-wine`, with a runtime switcher for all 8 packs, light/dark, LTR/RTL (which also switches EN/HE), and motion on/off.

## 2. Repo map (what is in the upload)

```
web-design/
  SKILL.md  README.md  references.md  HANDOFF.md (this file)
  01-fundamentals/   core.json, palettes/*.json (8), scripts/build-tokens.mjs, scripts/preview.template.html,
                     GENERATED: tokens.json tokens.css tailwind-theme.css shadcn-bridge.css palette.md preview.html contrast-report.json
                     foundations.md
  02-rules/          ui-rules.md  ux-rules.md  i18n-rtl.md
  03-libraries/      stack.md
  04-signature-moves/ README, accent-intensity, animated-inputs, interactions, scroll-and-focus, type-moves
  05-golden-examples/ README + landing.md auth.md chat.md dashboard.md (the briefs/specs)
    app/             the Next.js app (see section 5)
```

Pipeline: `core.json` + `palettes/*.json` → `node 01-fundamentals/scripts/build-tokens.mjs` (OKLCH derivation, WCAG hard-fail checks, 0 failures) → tokens. The app copies the outputs with `npm run tokens` (`app/scripts/sync-tokens.mjs`) into `app/src/design/` (never hand-edit those files; they are regenerated on `npm run dev` and `npm run build`).

## 3. The locked spec (do not re-litigate; deviations must be disclosed)

**Tokens and naming.** Semantic roles only, no raw palette in Tailwind: `canvas, surface, surface-raised, surface-sunken`; text `ink, ink-2, ink-3`; borders `hairline, hairline-strong, control`; accent family exposed as `brand`, `brand-ui`, `brand-text`, `brand-solid(-hover)`, `on-brand`; secondary family `deep-*`; `glass`, `glass-edge`, `scrim`, `glow`, `fx-1/2/3`; status `success|warning|danger|info` (+ `-bg`, `-border`); `focus`. Raw `brand` (accent) is decorative only; use `brand-text` for text, `brand-ui` for non-text UI, `brand-solid` + `on-brand` for filled controls. Metals (`--ds-metal-gradient`, `--ds-metal-hairline`) exist only in packs that define them; elsewhere they are `initial` so fallbacks work.
Packs: `champagne-wine` (default), `brown-navy-lightblue`, `deep-green-brown`, `monochrome`, `navy-cream-green`, `silver-white`, `toxic-white-orange`, `wine-gold`.

**UI rules.** 8pt inside components (Tailwind steps 1,2,3,4,6,8,12,16,24,32 only; banned 5,7,9,10,11), Fibonacci section rhythm via `py-section-xs..xl`, containers `max-w-app | max-w-marketing | max-w-reading`, pill controls (`rounded-pill`), cards `rounded-card` (24), sheets `rounded-sheet` (32), touch target `min-h-touch` (44). Depth = tint base + glass overlays: glass only on overlay layers (nav, sheets, modals, toasts, composer, tooltips), never on base cards, never glass on glass. AA contrast is a hard fail for functional text. **Logical properties only**: `ms- me- ps- pe- start- end- text-start`, `rounded-ee/es`, `border-e`; no `ml- mr- pl- pr- left right text-left text-right`. Use `rtl:`/`ltr:` variants for transforms. Hebrew: no italics, no uppercase, no letter-spacing, taller leading (tokens already switch under `[dir=rtl]`), labels `text-sm`.
Fonts: display Cormorant Garamond (+ Frank Ruhl Libre for Hebrew), body Inter Variable (+ Heebo), mono JetBrains Mono, all self-hosted via fontsource (Google Fonts is unreachable in many sandboxes).

**Motion.** All durations/springs/easings come from `core.json` through `src/lib/motion.ts`; never type numbers in components. Springs: overlay (critically damped, no overshoot), ui, hero. Lift & press (hover 1.02, press 0.98, `.lift`), glint sweep (`.glint`, direction-aware via `--ds-dir`), overlay entrance (12px rise + blur-in), fade-in reveal (700ms, 60ms stagger). **Reduced motion** (both OS `prefers-reduced-motion` and the in-app `data-motion="reduced"`) collapses everything to opacity fades: no transforms, parallax, particles, shiver, typing, spring scroll. Check both.
Accent intensity ladder (more accent = more noticeable effect): 0 none, 1 cursor-following radial light (`GlowCard`), 2 static eased radial light (`RadialLight`), 3 shiver ×3 (`.shiver`) + light, 4 radial flash + anime.js particles (`AccentBurst`). Hand-built animations use anime.js (`animate`, `createDrawable`); UI motion uses Motion; Lenis smooth scroll **on the landing page only**.
Signature moves: lift & press, specular glint sweep, animated-input cycling placeholder (type 55±15ms, hold 1600, erase 28, gap 300; passwords: typed, dotted out 45ms/dot, masked hold 900, removed in reverse 30ms), smooth-scroll focus on marketing, chat scroll model (below), type moves: ghost oversized numerals, tracked small-caps labels, effects around accented items.

**UX rules.** No spinners or skeletons except the spinner inside a pending button. Adaptive loading: show loader only if load exceeds 300ms, keep it ≥600ms, then hand off to the same 700ms fade-in reveal; fast loads skip straight to the reveal. Reversible action → act immediately + **undo toast 8s**. Irreversible → **typed-confirmation modal** (Cancel has initial focus, scrim click does not close). Errors are **contained inline** with Retry; the rest of the page stays alive. **No modal opens another modal** (close the first, then open the second).

**Chat scroll model** (`src/hooks/use-chat-scroll.ts`): scrolling up is native. Coming back within 80px of the end, after scroll idle (140ms) it snaps to the end on the `ui` spring. At the end, pulling further (wheel or touch) is resisted (pull = accumulated delta × 0.4); at 72px the options panel latches open beneath the messages (messages slide up by the pull). Keyboard path: the Options button (`aria-expanded`) + `aria-live` announcement. Streaming reply stays pinned only if the user was at the bottom; otherwise an unread pill ("{n} new") appears with a level-3 shiver.

**Stack (pinned in `app/package.json`).** Next.js 16.4 App Router, React 19.3, TypeScript strict, Tailwind v4, Radix Dialog + Slot (shadcn-**pattern** components written by hand, not via the CLI), Phosphor icons (thin/light), Motion 14.1, anime.js 4.5, Lenis, Sonner (unstyled, our own glass markup), fontsource.

**i18n.** Every visible string is in `src/lib/i18n/*.ts` as `en` + `he` (`he` is typed `Record<keyof typeof en, string>`, so a missing translation fails typecheck). Components call `const { t, tl } = useT()` / `useDesign()`. `tl(key)` returns localized lists. Sample content is Hebrew in RTL. Time axes in charts stay left-to-right in both directions (documented decision); text blocks follow the page.

## 4. Design-switcher / provider contract

`DesignProvider` (`src/components/patterns/design-provider.tsx`) owns `pack, theme (light|dark|system), dir (ltr|rtl), motion (on|off)`; applies `data-pack`, `data-theme`, `dir`, `lang` (`he` when rtl), `data-motion="reduced"` to `<html>`; persists to `localStorage` (`ds-design`, always in try/catch); **query params override**: `?pack=&theme=&dir=&motion=`. An inline script in `layout.tsx` applies them before first paint. Hooks: `useDesign()` (everything), `useT()`, `useMotionOk()` (switch on AND OS not reduced), `useDirection()`. The floating `DesignSwitcher` (bottom-end) also links all example pages.

## 5. Current state of `05-golden-examples/app`

Run: `cd 05-golden-examples/app && npm install && npm run dev` (dev runs `npm run tokens` first). `npm run typecheck` and `npx next build` both pass as of this handoff (routes: `/`, `/auth`, `/chat`, `/dashboard`).

**Built:**
- Scaffold, token sync, `globals.css` (base, glass, label, lift, glint, glow-card, radial-light, shiver, breathe, spinner, drain, reduced-motion collapse for OS and in-app), i18n for all four pages **including landing** (`src/lib/i18n/landing.ts` is written, page is not).
- UI: `button` (cva variants, `glint`, `loading`, `asChild`), `card` (+`GlowCard`), `input` (+`Field` with aria wiring), `badge`, `switch`.
- Patterns: `design-provider`, `design-switcher`, `animated-input` (+`hooks/use-cycler.ts`), `reveal`, `hooks/use-adaptive-loading.ts` + `loading-gate` (loading screen, error with Retry), `overlay` (`GlassSheet`, modal), `confirm-dialog` (typed phrase), `toaster` (`undoToast` 8s with draining hairline, `noticeToast`), `ghost-numeral` (Motion `useScroll` parallax), `accent` (`RadialLight`, `AccentBurst`), `brand-mark` (anime.js `createDrawable`), `region-error` (+`RegionBoundary`), `segmented-tabs`, `eyebrow`, `skip-link`.
- Pages: `/` (index), `/auth`, `/dashboard` (+ `components/dashboard/*`, hand-built SVG `line-chart` made under the `dataviz` skill rules: emphasis form, legend, crosshair + tooltip, keyboard stepping, table view), `/chat` (+ `components/chat/bubble.tsx`).
- Generator fixes made in this phase: `--leading-*` and `--tracking-*` exposed to Tailwind; RTL block zeroes display tracking and raises display leading; `touch` spacing token; pack swatches in `packs.json`; `.radial-light` uses `closest-side` (no hard box edge); headings use lining numerals (Cormorant's old-style "12" reads as "I2").
- `scripts/screenshot-matrix.mjs` (portable Playwright matrix; see section 7).

**Visually verified (screenshots):** `/` and `/auth` in champagne light-LTR and dark-RTL; `/dashboard` in both before the latest chart fix.

**NOT yet verified. Treat as unknown, test them:**
1. `/dashboard` after the overflow fix (chart used to overflow its card; fixed with `min-w-0 grid-cols-[minmax(0,1fr)]`). Re-screenshot, also at 390px width.
2. `/chat` has never been run in a browser. Highest risk: the scroll model (snap, pull/latch, release, touch), options panel (z-order was just fixed so it can be clicked), streaming + pinned logic, unread pill, `scrollToBottom` on language switch, 201 messages performance.
3. All interactive behaviour on `/auth` and `/dashboard`: animated inputs stop on focus and resume on blur; password dotting/removal; blur validation + `aria-describedby`; "fail…" email → contained error → Retry; forgot-password sheet; account settings sheet → delete confirm (sheet closes first); undo toast (8s, Undo restores); typed-confirm (Cancel focused, scrim does not close, Esc closes); slow-network toggle → loading screen → reveal; simulate-failure → region error → Retry succeeds; sorting; archive → empty state → Restore all.
4. Reduced motion (OS emulation and the in-app switch), all 8 packs, RTL mirroring of every example, mobile widths (390 and 768).
5. `RegionBoundary` is written but not used anywhere; use it or delete it.

## 6. Remaining work (in order)

**A. Verify and fix what exists** (item 5 above). Fix bugs you find rather than listing them.

**B. Build `/landing`** (spec: `05-golden-examples/landing.md`; strings: `src/lib/i18n/landing.ts`). Required elements:
- Glass sticky nav (brand, anchors, CTA), **Lenis smooth scroll on this page only** (init in an effect, destroy on unmount, skip entirely when `!motionOk`; check that CSS `scroll-snap` is not combined with Lenis, they conflict).
- Hero: display type, ghost numeral **01**, **one level-4 `AccentBurst` on first reveal only**, `metal` hairlines (`.hairline-metal`, falls back to plain hairline in packs without metals), primary CTA with `glint`.
- Three chapters with ghost numerals **02, 03, 04** placed at inline-end/empty space with logical offsets (`start-*`/`end-*`), `Reveal inView`, `py-section-*` rhythm, `max-w-marketing`.
- Detail cards (`GlowCard`), a statement quote **with no invented attribution** (do not fabricate a person or company), closing CTA with `RadialLight`, footer.
- Visuals must be abstract and made from the system itself (SVG, gradients, tokens). No stock photos, no invented logos, no fake testimonials.
- Light/dark, LTR/RTL, all packs, reduced motion.

**C. Add `app/scripts/check-raw-values.mjs`** (already referenced by `npm run check:raw`). Scan `src/**/*.{ts,tsx,css}` excluding `src/design/`. Fail on: hex/`rgb(`/`hsl(`/`oklch(` literals (allow inside `globals.css` only where they are the documented grain/glint white and the swatch data in `packs.json`), Tailwind default palette classes (`gray-`, `slate-`, `neutral-`, `zinc-`, `stone-`, and colour names like `red-500`), physical properties (`ml- mr- pl- pr- left- right- text-left text-right` and `left:`/`right:` in styles), banned spacing steps (5,7,9,10,11). Lines containing `ds-allow-physical` are exempt (the chart tooltip's LTR geometry uses it). Existing known exemptions to review: `line-chart.tsx` geometry, `fill="transparent"`, arbitrary widths like `w-[min(24rem,calc(100vw-2rem))]`, `size-[44rem]` radial lights. Decide, and document the policy in the script header.

**D. Verification pass**, then the docs update (section 8), then deliver.

## 7. Verification protocol

1. `npm run typecheck && npm run check:raw && npx next build` must be clean.
2. Serve the production build (`npx next start -p 3100`) and run the matrix per page:
   `node scripts/screenshot-matrix.mjs shots /landing full` with `CONFIGS="champagne-wine:light:ltr,champagne-wine:dark:ltr,champagne-wine:light:rtl,champagne-wine:dark:rtl,wine-gold:dark:ltr,toxic-white-orange:light:rtl"`, repeated for `/auth /chat /dashboard /`. Set `PLAYWRIGHT_MODULE` / `CHROMIUM_PATH` if your Playwright needs them. The script reports console errors and horizontal overflow. Third-party font fetch errors are noise in offline sandboxes. **Look at every screenshot yourself** and fix what you see (clipped text, hard glow edges, wrong mirroring, low contrast, collisions).
3. Behaviour tests in Playwright (write them as a script under `app/scripts/`, keep it): the list in 5.3 plus the chat model (scroll up → pill; scroll back near end → snaps; wheel past the end → panel latches; streaming while scrolled up → unread pill; "Incoming" button; Escape/Options toggle) and reduced motion (emulate `reducedMotion: 'reduce'` and `?motion=off`; assert no transforms/animations running, fades only).
4. Contrast: tokens are AA-checked at generation time; for any new colour pairing you introduce, check it.
5. For high-stakes claims ("reduced motion verified", "RTL verified"), have a separate agent re-check with fresh eyes, not the one that built it.

## 8. Docs to update (they currently describe the examples as "briefs only")

- `SKILL.md`: golden examples are now working code; update workflow step and the delivery checklist; keep it a skill, short.
- `README.md` and `05-golden-examples/README.md`: how to run, the matrix, the pack switcher, query params, route list.
- `03-libraries/stack.md`: fontsource instead of `next/font/google`; shadcn components are hand-written in the shadcn pattern (not CLI-installed); Sonner is fully unstyled with our own markup; `touch` spacing token.
- `04-signature-moves/scroll-and-focus.md`: Lenis vs CSS scroll-snap conflict; the chat model numbers now live in `use-chat-scroll.ts` (`scrollSpec`) and must stay in sync.
- `04-signature-moves/animated-inputs.md`: password input direction follows the page direction; overlay direction equals input direction; the password sequence (type, dot out 45ms/dot, hold 900, remove in reverse 30ms) as implemented in `use-cycler.ts`.
- `02-rules/i18n-rtl.md`: chart time axes stay LTR; `rtl:`/`ltr:` for transforms; language and direction are one switch in the examples.
- `references.md`: keep the verified vs unverified source split honest.
- Re-run `node 01-fundamentals/scripts/build-tokens.mjs` if you touch tokens and keep `contrast-report.json` at 0 failures.

## 9. Gotchas already paid for (do not repeat)

- `overflow-x: hidden` does not stop programmatic horizontal scroll; the app uses `overflow-x: clip` on `html` and `body`.
- Full-bleed ambient glows: use `closest-side` radial gradients and eased 5-stop ramps; otherwise a hard rectangle shows.
- A class named `.metal` collided with an unrelated style; the animated hairline is `.hairline-metal`.
- Tailwind `leading-display` does nothing unless `--leading-display` is in the theme (now generated).
- Grid children need `min-w-0` / `minmax(0,1fr)` or a fixed-width SVG will blow the layout.
- Hebrew italics are synthetic and wrong: no italic accent words (`em` is `font-style: normal`).
- anime.js v4: `import { animate, createDrawable, stagger, utils } from 'animejs'`; `delay` takes `stagger(ms)`, not an ad-hoc `(el, i)` function (types reject it).
- Motion `animate(from, to, { ...springs.ui, onUpdate })` is how scrollTop is animated; `.stop()` on user input.
- Next in a sandbox: `waitUntil: 'networkidle'` can hang; use `'load'` plus a wait. Do not `pkill -f "next start"` from a shell whose own command line contains that string.
- Browser storage can be empty or throw; every access is in try/catch and the UI must render without it.

## 10. Disclosures owed to Daniel in your final message

- Radii values (`core.json`) are still provisional; he asked to decide "from the examples", so show him the result and ask.
- shadcn-style components are hand-written, not generated by the shadcn CLI.
- Fonts come from fontsource (self-hosted), not `next/font/google`.
- Hero/stat numbers use the sans face, not the serif display (dataviz rule: proportional sans for figures).
- Chart time axis stays LTR in RTL.
- Any spec you could not satisfy or chose to change, and anything you could not verify.

## 11. Definition of done

All four pages work in all 8 packs, light/dark, LTR/RTL, motion on/off, at desktop and 390px width; typecheck, `check:raw` and build are clean; every behaviour in 5.3 and the chat model passes a script; screenshots reviewed; docs updated; a zip of `web-design/` (excluding `node_modules`, `.next`, `*.tsbuildinfo`, `next-env.d.ts`) plus the screenshot matrix and a short honest summary (what works, what you changed, what is still unverified) sent to Daniel.

---

## 12. Conversation record: what Daniel decided (his words matter, do not re-ask)

He answered a long series of "this or that" questions. Settled, in order:

- **What the folder is:** "a complete work folder containing conventions, styles, definitions, examples. Later I am planning to turn this into an agentic coding skill using /web-design. The folder itself is much more versatile."
- **Canvas:** between warm ivory and near white, "minimal maximum" (chosen `#FBF9F6`). **Accent:** champagne-bronze is good; "the muted brushed gold feels like shit". Mix with **wine-velvet red** (chosen as the secondary). **Dark mode:** deep midnight with some tones; espresso black only if combined with white; chosen "warm ink midnight".
- **Palettes are taste samples, not limits:** "the pallet are to understand my taste, not to limit the design references to them. I like all sorts of colors if used the right way. Navy blue mixed with cream and green. Brown with navy and light blue. Black and white tones. Red velvet like. Red wine. White champagne. Bronze, Gold, Silver. Luxury green like a poker table, or a toxic one."
- **Architecture:** semantic core + packs. Packs: Navy·Cream·Green; Brown·Navy·Light blue; Monochrome; Wine red + gold-bronze; Silver + white; Deep green + brown; Toxic green + white + orange; plus the default Champagne & Wine. **Metallics only inside packs that use them.** Pack names/seeds were proposed by me and approved.
- **Shape/space/type:** "dramatic sibling" for the secondary; radii "see from my examples what most suits" (hence provisional, see section 10); **8pt + Fibonacci section rhythm**; **serif display + refined sans body**.
- **Quality/UX:** AA hard-fail on all functional text; per-surface containers (responsive friendly); loading = "Fade-in reveal, but with a preloaded loading screen that makes it either the user sees beautiful loading fade in for short loadings, or a loading to the fade in, so the page feels good and easy, while respecting slow load speeds"; destructive = "Hybrid: undo toast if reversible, modal if not".
- **Depth/motion/error:** "A mix of glass + tint making it easier to focus the user on elements while keeping a style"; calm springs, soft, no overshoot; accent colors "derived from the pack hue"; "contained inline recovery".
- **Stack:** Next.js + TypeScript + Tailwind v4; shadcn-style on Radix; Phosphor Thin/Light; Motion for UI + anime.js for SVG/scroll sequences.
- **Signature moves (his descriptions):** lift & press; specular glint sweep; animated input: "for text inputs instead of a static example@gmail.com have a type animation cycling through examples... Passwords get typed in dots... RTL or LTR for language support... dotted out revealing another example"; scroll: "smooth scroll is applied to main focus elements to highlight them. Marketing is one example. A chat that is scrolled up natively, but down it first snaps and takes a bit more to scroll beneath to reveal more options, relevant to the app."; type moves: ghost oversized numerals, tracked small-caps labels, "effects around accented items, more accent more noticeable effect. Effects may include flying particles, shivering, radial light, etc..."
- **Examples:** landing, auth, chat, dashboard. "Default pack built, with a runtime pack and light/dark switcher". "Logical properties everywhere + live LTR/RTL toggle in every example". Build order he approved: folder, docs, token generator, show real examples, then build the golden examples.
- **His reactions:** the living token preview was "super beautiful"; the instruction after it was "go with the examples". Afterwards only "Keep on" / "Continue from where you left off" nudges and the request for this handoff. He has given no negative feedback so far, but he is direct and will give it.
- His original inspiration list (taste references, do not copy): Awwwards "Mews Unfold" mobile element, Behance "AI Companion App", animejs.com, four recent.design items, a "GiGi" energy-drink v0 page, two Figma community files.

## 13. Build log (what the previous session actually did, in order)

1. Built token generator (`build-tokens.mjs`): OKLCH derivation, WCAG hard-fail, 275 checks, 0 failures; derived readable text/UI/solid variants for decorative accents (lime, champagne); spring damping check (damping ≥ 2·√(k·m)).
2. Wrote SKILL.md, README, 01 to 05 docs, references.md (verified vs unverified sources).
3. Rebuilt `preview.html` as a living showcase (glint, glow, shiver, particles, animated inputs, loading handoff); fixed horizontal-scroll shift, `.metal` class collision, metal tokens leaking into packs without metals, Hebrew italic, banded glows, short-lived particles, swatch label contrast. Delivered.
4. Scaffolded `app/`: configs, `sync-tokens.mjs`, `globals.css`, `lib/{cn,motion}.ts`, full i18n (en + he for all four pages).
5. Wrote provider, switcher, layout (pre-paint preference script), toaster, all UI and pattern components, hooks. Typecheck clean.
6. Wrote `/` and `/auth`; screenshotted. Found and fixed: `leading-display` not a real class (added `--leading-*`/`--tracking-*` to the Tailwind theme), radial lights drawing a hard box (`closest-side`), RTL display tracking/leading.
7. Invoked the `dataviz` skill, wrote `/dashboard` (stat cards, hand-built line chart, sortable table with undo, activity feed, adaptive loading with slow/fail toggles, settings sheet → typed confirm). Screenshotted: chart overflowed its card and Cormorant's old-style "12" read as "I2"; both fixed (not re-screenshotted yet).
8. Wrote `/chat` and its scroll hook; typecheck and build pass. Fixed options panel z-order. Never opened in a browser.
9. Wrote portable `scripts/screenshot-matrix.mjs`, this handoff, and the zip.

Task list at handoff: #1 to #9 done; #10 (Auth + Dashboard) built, interactions unverified; #11 (Chat + Landing) chat built and unverified, landing not started; #12 (verify + docs) not started.

## 14. Do this first (your first hour)

1. `cd 05-golden-examples/app && npm install && npm run typecheck && npx next build`. Expect clean.
2. `npx next start -p 3100` (separate shell/background). Run the matrix for `/chat` and `/dashboard` (section 7) and **look at the screenshots**.
3. Check these suspected problems first, they are the most likely to bite:
   - **Hydration mismatch on `/chat`:** the date separators use `new Date()`, which differs between build time (static HTML) and the browser. Watch the console for a hydration error; fix by computing the separator labels after mount (use the provider's `ready` flag or a `useEffect`) or by not rendering dates on the server.
   - **Chat options panel** must be clickable when latched (z-order just changed) and invisible and inert when closed.
   - **Chat scroll:** snap should fire only when scrolling downward and idle within 80px; pulling past the end must latch at 72px of pull (`scrollSpec`); wheel up while open closes; touch works. Check that the programmatic spring does not retrigger itself.
   - **Streaming:** if the user scrolled up, the stream must not move the view and the unread pill must show with the shiver; at the bottom it stays pinned without jitter.
   - **Dashboard chart** after the overflow fix, at 1280 and 390px, LTR and RTL.
   - **Auth:** animated placeholder stops on focus and resumes on blur when empty; password dots appear in both directions; the show/hide toggle works; validation messages are tied with `aria-describedby`.
4. Fix everything you find, then proceed with section 6 B (landing), C (raw-value check), D (verification and docs).

## 15. Component API cheat-sheet (so you do not have to re-read every file)

- `useDesign()` → `{ pack, theme, dir, motion, lang, locale, motionOk, ready, t, tl, setPack, setTheme, setDir, setMotion }`; `t(key, vars?)` replaces `{name}` placeholders; `tl(key)` returns a localized string list. `PACKS`, `DEFAULT_PACK` exported from the provider.
- `Button` props: `variant` primary|secondary|quiet|ghost|danger, `size` sm|md|lg|icon, `glint`, `loading` (disables, `aria-busy`, spinner), `asChild`. `buttonVariants` exported. `Spinner` exported (only for in-button use).
- `Card`, `GlowCard({ className /* inner box */, shellClassName /* outer */ })`, `Badge({ tone })`, `Switch({ checked, onCheckedChange, label })`, `Input`, `Field({ label, hint, error, trailing, children: (control) => node })` where `control` carries `id`, `aria-describedby`, `aria-invalid`.
- `AnimatedInput({ examples, mode: 'text'|'password', ...inputProps })`; pass `type` to override (password reveal toggle). `useCycler` holds the timings (`typing`).
- `Overlay`/`GlassSheet({ open, onOpenChange, title, description, dismissOnScrim, initialFocus, variant })`; `ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, phrase, onConfirm })`.
- `undoToast({ message, undoLabel, closeLabel, onUndo })`, `noticeToast(message, tone?)` (8s undo; hairline drains).
- `Reveal({ index, inView, as })`, `useAdaptiveLoading(load)` → `{ phase: pending|loading|ready|error, data, reload, attempt }`, `LoadingGate({ phase, onRetry, compact })`, `LoadingScreen`.
- `RadialLight({ breathe })`, `AccentBurst({ trigger })` (increment `trigger` to fire; needs a positioned parent), `GhostNumeral({ value, drift })` (position it yourself with `start-*`/`end-*`), `BrandMark({ draw })`, `Eyebrow`, `RegionError({ onRetry })`, `RegionBoundary`, `SegmentedTabs`, `SkipLink`.
- CSS classes in `globals.css`: `.glass .scrim .ds-label .lift .glint (data-glint="once") .glow-card .radial-light .shiver .breathe .hairline-metal[data-shimmer] .spinner`; keyframes `glint breathe sheen blink track shiver spin drain`. Anything animated by CSS that must stop in reduced mode should carry `data-anim` (the reduced-motion block kills `[data-anim]` animations).
- Motion tokens: `durations`, `stagger`, `ease`, `springs.{overlay,ui,hero}`, `loadingConfig`, `fade` from `@/lib/motion`.
- Query params for any page: `?pack=<id>&theme=light|dark|system&dir=ltr|rtl&motion=on|off`.

## 16. Files to upload to the next agent

1. `HANDOFF.md` (this file, paste it as the first message or attach it).
2. `web-design-handoff.zip` (the whole project without `node_modules`/`.next`; it already contains this file and everything below).

Contents of the zip, for reference:

- Root: `SKILL.md`, `README.md`, `references.md`, `HANDOFF.md`
- `01-fundamentals/`: `core.json`, `foundations.md`, `palettes/*.json` (8), `scripts/build-tokens.mjs`, `scripts/preview.template.html`, generated `tokens.json`, `tokens.css`, `tailwind-theme.css`, `shadcn-bridge.css`, `palette.md`, `preview.html`, `contrast-report.json`
- `02-rules/`: `ui-rules.md`, `ux-rules.md`, `i18n-rtl.md`
- `03-libraries/stack.md`
- `04-signature-moves/`: `README.md`, `accent-intensity.md`, `animated-inputs.md`, `interactions.md`, `scroll-and-focus.md`, `type-moves.md`
- `05-golden-examples/`: `README.md`, `landing.md`, `auth.md`, `chat.md`, `dashboard.md`
- `05-golden-examples/app/`: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `scripts/{sync-tokens,screenshot-matrix,check-raw-values,verify-behaviour}.mjs`, and `src/` with `app/{layout,page,globals.css}`, `app/{landing,auth,chat,dashboard}/page.tsx`, `components/{ui,patterns,chat,dashboard}/*`, `hooks/*`, `lib/{cn,motion,dashboard-data}.ts`, `lib/i18n/*`, `design/*` (generated)

## 17. Handoff Completion Log (Steps 6–8 + Good Design Anatomy + Unpack Packaging)

1. **Completed Section 6A fixes & hardening:**
   - Fixed SSR/client hydration date mismatch on `/chat` using `ready` from `useDesign()`.
   - Added `Escape` and click-to-dismiss for `chat.open`, plus `role="region"` on the options panel.
   - Fixed `use-chat-scroll.ts` (`scrollToBottom` state sync, duplicate native scroll events preserving `movingDown`, interrupting active spring animations on external scroll).
   - Added `visibilitychange` pause in `use-cycler.ts` and 8pt-compliant `h-4` caret height in `animated-input.tsx`.
   - Locked `Button` dimensions during `loading` (`opacity-0` label in flow + centered overlay `<Spinner />`).
   - Added explicit focus restoration (`triggerRef`) in `Overlay` / `GlassSheet` / `ConfirmDialog` and fast exit transition so chained modals open cleanly.
   - Wrapped dashboard regions in `RegionBoundary`, connected the `Simulate failure` toggle to inline `RegionError` with Retry recovery, and added `relative` to `ReservationsTable`'s `overflow-x-auto` wrapper to prevent `.sr-only` `<th>` overflow at 390px mobile.
2. **Completed Section 6B (`/landing`):** Built `src/app/landing/page.tsx` with sticky glass nav pill, Lenis smooth scroll, Hero (`01`), three asymmetric chapters (`02..04`) with in-system SVG art and scroll focus, 4-fact `GlowCard` detail row with `<bdi>` figures, centered display quote, and sunken closing CTA with breathing `RadialLight`.
3. **Completed Section 6C (`check-raw-values.mjs`):** Added `scripts/check-raw-values.mjs` (`npm run check:raw`); `0` violations across `src/`.
4. **Completed Section 6D & 7 (Playwright screenshot matrix + behavioural verification + docs):** Verified all 5 routes across desktop (`1280×860`) and mobile (`390×844`) pack/theme/direction combinations (`0` console errors, `0` horizontal overflow) and passed all 5 automated Playwright behavioural suites (`npm run verify:behaviour`).
5. **Added Good Design Anatomy:** Documented in `SKILL.md`, `02-rules/design-anatomy.md`, `02-rules/ui-rules.md`, `02-rules/ux-rules.md`, `04-signature-moves/*`, and interactive Chapter 05 in `preview.html`.
6. **Added `unpack.sh` & `contents/` wrapper:** Packaged `contents/`, `preview.html`, `README.md`, and `unpack.sh` for passwordless installation into `~/.cursor/skills/`.
