---
name: web-design
description: Build web UI (landing pages, apps, dashboards, auth, chat) in a luxury, minimal, spacious style using a token-driven design system with swappable palette packs, strict UI/UX rules, Good Design Anatomy physics, a fixed Next.js + Tailwind v4 + shadcn/ui stack, and signature motion. Use for any request to design, build, restyle or review front-end UI.
---

# /web-design

A specification-first design system. Everything is a token, every rule is checkable, and every look is a swappable palette pack.

**Feeling to hit:** white velvet sheets in a golden hotel room. "Minimal maximum": few elements, each with generous room, each with a considered detail. Calm springs, quiet glass, hairlines, serif display type.

## Workflow (follow in order)

1. **Pick the palette pack.** Read the brief, then propose 2–3 packs from `01-fundamentals/palette.md` as a short this-or-that, default `champagne-wine`. Ask once; do not skip the question unless the user already named a pack. State the choice in your first message. (Palettes express taste; if none fits, add a seed in `01-fundamentals/palettes/` and run the build.)
2. **Load tokens.** Use `01-fundamentals/tokens.css`, `tailwind-theme.css` and `shadcn-bridge.css`. Set `data-pack`, `data-theme`, `dir` on `<html>`. Never write a raw color, radius, shadow, spacing or duration.
3. **Read the rules before writing code:** `02-rules/ui-rules.md`, `02-rules/ux-rules.md`, `02-rules/design-anatomy.md`, `02-rules/i18n-rtl.md`.
4. **Stay inside the stack:** `03-libraries/stack.md`. No new dependencies, fonts or icon sets without asking.
5. **Apply signature moves** from `04-signature-moves/` deliberately, within the accent-intensity budget. Restraint is the brand.
6. **Pattern-match golden examples** in `05-golden-examples/app/` (`/landing`, `/auth`, `/chat`, `/dashboard`) for component APIs, import structure, typing, and visual aesthetic.
7. **Run the delivery checklist** at the end of `02-rules/ui-rules.md` (`npm run check:raw`, two packs × light/dark × LTR/RTL at desktop and 390px mobile, keyboard focus & reduced motion), before reporting done.

## Hard rules (the short list)

- Roles, not colors: `bg-canvas text-ink border-hairline`, `var(--ds-accent-solid)`.
- 8pt inside components, Fibonacci `section-*` between sections.
- Logical properties only; every component works in RTL (Hebrew) and LTR.
- AA contrast is a hard fail. Raw `accent` is decorative only; use `accent-text` / `accent-ui` / `accent-solid`.
- Pill controls, 24px cards. Tint for base surfaces, glass only for overlays, never glass on glass.
- Calm springs: overlays use the critically damped `overlay` spring, no overshoot. Reduced motion collapses everything to fades.
- No spinners (except inside a pending submit button with locked dimensions). Adaptive loading: <300ms no loader, then loader ≥600ms, hand off into a staggered fade-in.
- Reversible destructive → 8s undo toast; irreversible → typed-confirmation modal. Errors contained inline with Retry.
- Phosphor icons (thin/light). Motion for UI, anime.js for SVG/scroll sequences. shadcn-style primitives on Radix.

## Good Design Anatomy

### Navigation & Cursor Dynamics

* **Submenu Aiming (The Safe Triangle Buffer):** In nested dropdown menus, predicting cursor trajectory toward submenus using dynamic triangular buffers (or pointer tracking vector math). This prevents submenus from collapsing prematurely when moving the cursor diagonally across neighboring menu items.
* **Expanded Hit Targets (Fitts’s Law):** Extending interactive hit targets (`padding`, `min-h-touch`, or full-card link wrappers) to fill the entire container or card rather than anchoring the click listener strictly to the inline text or icon.
* **Hover Intent Delay:** Delaying the trigger of heavy popovers or tooltips by 100–200ms to avoid firing unwanted popovers when a user rapidly sweeps the cursor across the screen.

---

### Search, Input & Form Physics

* **Debounced Intent vs. Raw Input Queries:** Delaying autocomplete network requests until a brief typing pause occurs (e.g., 200–300ms debounce), or instantly pulling from local cache on backspace, rather than firing unthrottled requests that cause flashing dropdown results and race conditions.
* **Button Dimension Lock on Loading States:** Preserving explicit `width` and `height` on submit buttons when transitioning to a loading spinner (`opacity-0` label in flow + centered overlay `<Spinner />`). Cheap sites allow the button to shrink or warp layout flow when text is replaced by a loader.
* **Native Keyboard Tailoring (`inputmode` & `autocomplete`):** Explicitly setting `inputmode="numeric"`, `inputmode="decimal"`, or `type="email"` alongside appropriate `autocomplete` tags to summon the correct touch keyboard and autofill triggers without browser layout shifts.

---

### State Management & Motion

* **Optimistic UI Updates with Graceful Rollback:** Immediately reflecting state toggles (e.g., bookmarking, liking, favoriting, archiving) in the UI before the network payload resolves, paired with a silent background request and automatic state reversal with a subtle toast notification if the API call fails.
* **Focus Trap & Focus Restoration:** Trapping keyboard `Tab` focus within active modal dialogs, and explicitly restoring active focus to the triggering element once the modal closes.
* **Scroll Position Memory:** Preserving precise scroll coordinates when navigating back from a detail view to a feed, rather than dumping the user back at the top of page 1.

---

### Layout Physics & Visual Polish

* **Skeleton Reserve Areas (Zero CLS):** Reserving fixed structural aspect-ratio space (`aspect-ratio` or fixed height bounds) for dynamic images and asynchronous media before they load, eliminating Cumulative Layout Shift (CLS).
* **Optical Alignment vs. Mathematical Centering:** Nudging icons, play buttons, or custom checkboxes slightly off-center (e.g., shifting play triangles right by 1–2px) to satisfy human visual perception, rather than relying solely on raw `display: flex; align-items: center`.
* **Natural Spring Curves over Linear Transitions:** Using directional cubic-bezier curves (e.g., `cubic-bezier(0.16, 1, 0.3, 1)` or `--ds-ease-soft`) or spring physics (`springs.overlay`, `springs.ui`) for modal pop-ins and drawer slides, avoiding linear or default CSS `ease` transitions that feel robotic.
* **Elevation via Surface Tinting (Dark Mode):** Communicating visual depth in dark mode using lightness layering (`canvas` → `surface` → `surface-raised`) and surface opacity overlays rather than heavy drop shadows (which become invisible against dark backgrounds).

## Files

| Path | What |
|---|---|
| `01-fundamentals/foundations.md` | Type, spacing, radius, depth, motion, loading, layout, color roles |
| `01-fundamentals/core.json`, `palettes/*.json` | Token sources |
| `01-fundamentals/scripts/build-tokens.mjs` | Generator with WCAG hard-fail checks |
| `01-fundamentals/{tokens.json,tokens.css,tailwind-theme.css,shadcn-bridge.css,palette.md,preview.html}` | Generated outputs |
| `02-rules/` | `ui-rules.md`, `ux-rules.md`, `design-anatomy.md`, `i18n-rtl.md` |
| `03-libraries/stack.md` | Approved stack and boundaries |
| `04-signature-moves/` | Interactions, animated inputs, scroll/focus, accent intensity, type moves |
| `05-golden-examples/` | Briefs (`landing.md`, `auth.md`, `chat.md`, `dashboard.md`) and full working Next.js app (`app/`) |
| `references.md` | Inspiration sources and what is verified about each |
