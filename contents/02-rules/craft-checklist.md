# Craft checklist (C1–C40)

Ids follow the owner's list. Motion uses `lib/motion.ts` tokens; reduced motion turns every motion rule into an opacity fade.

## Motion
- **C1 Squash & stretch:** press `scale(.98)`; small controls may squash ≤4% on one axis; never text or cards >480px wide.
- **C2 Solid drawing (3D):** one light from above: shadows fall down (`shadow-sm|md`), highlights top/inline-start, one shared perspective.
- **C3 Anticipation:** hover/press state before every action; a big move may wind up ≤4px the other way first, never delaying the response.
- **C7 Pose to pose:** define start and end states and let the spring/ease tween; animate `transform`/`opacity` only.
- **C9 Follow through:** children settle after the parent on the 60ms `stagger`; springs stay critically damped (no overshoot).
- **C11 Slow in & out:** enter `ease.soft`, on-screen A→B `ease.inOut`, exits shorter (~200ms). Never `linear` or CSS `ease`.
- **C13 Arcs:** travel longer than the element's width curves (x and y on different easings); short moves stay straight.
- **C15 Secondary action:** ≤1 supporting motion (icon nudge, hairline brighten), ending with or before the main one.
- **C17 Snappy timing:** `press` 120ms, `ui` 320ms; `slow`/`hero` only for scrims and heroes. Nothing answering input runs past `ui`.
- **C19 Exaggerated feedback:** outcomes are unmistakable: success = check + short scale/fade; invalid = shiver (≤6px, 3 cycles) + inline text.
- **C40 Useful motion:** animate only what informs (added, saved, moved, failed, where it went). No decorative loops.

## Laws
- **C6 Fitts:** primary and frequent targets are bigger and closer to where the pointer or thumb already is.
- **C8 Bigger hit areas:** ≥44×44 (`min-h-touch`), the whole row or card clickable (U22).
- **C10 Hick:** 1 primary + ≤2 secondary actions per view, ≤7 top nav items; the rest behind menus or steps.
- **C12 Miller:** chunks of ~5–7 (7±2); codes, phones and cards split into 3–4 digit groups.
- **C14 Doherty:** visible response <400ms, press state <120ms, optimistic toggles, loaders per the 300/600ms rule.
- **C16 Postel:** accept loose input (case, spaces, dashes, pasted OTP, date formats); store and show it normalized.
- **C18 Jakob:** conventions win: logo top-start → home, magnifier = search, account top-end, links look like links.
- **C20 Frequency of use:** most-used first, biggest, nearest; rare actions in overflow.

## Visual
- **C4 Appeal:** calm, generous, finished; anything that looks default gets restyled or removed.
- **C5 Staging:** one focal point per viewport; scrim, shrink or quiet the rest; accent and motion point at it.
- **C21 No filler badges:** no "New"/"Beta"/"Hot" unless true and useful; badges carry status only.
- **C22 Accent colour:** one accent (`brand-*`) for primary action, selection, focus; `deep-*` sparingly; the rest ink on canvas.
- **C23 No redundant labels:** don't restate context ("Name:" before a name, units in every cell). Form labels stay visible (X14).
- **C24 Consistent icons:** Phosphor, one weight per size, one size per context, one icon per meaning.
- **C25 Unitalicize:** no italic on random words; emphasis is weight or `text-ink` vs `text-ink-2`.
- **C26 No embellishments:** cut gradients, dividers, shadows and borders that don't separate, group or signal.
- **C27 Mono where needed:** `font-mono` only for code, IDs, keys; never labels, figures or headings.
- **C28 Nested radius:** inner = outer − padding (`card` 24, padding 12 → 12); never inner ≥ outer.
- **C29 Design system:** tokens, roles and existing primitives (`05-golden-examples/api.md`) only.
- **C30 Text contrast:** body ≥4.5:1, large/UI ≥3:1; body `text-ink`/`text-ink-2`; `text-ink-3` only for meta, never on tints.
- **C31 Show the product:** real UI, screenshots or output when a product exists; otherwise abstract in-system visuals (landing brief), never stock photos.
- **C32 Wrap headlines:** `text-balance` on headings, `text-pretty` on paragraphs; no orphan words; no manual `<br>`.
- **C33 Enlarge the main feature:** the key element (hero visual, main stat, primary input) is ~2× the next one.
- **C34 Align by eye:** icons to cap height, play glyphs 1–2px inline-end, hanging quotes, round shapes slightly larger.
- **C35 Group with spacing:** gap within a group < gap between groups (8–12 vs 24–32), before reaching for dividers or boxes.
- **C36 Tabular nums:** on figures that change, count or align in columns.
- **C37 Specific headlines:** what it does or the outcome, with a concrete noun or number. Not "Welcome to the future".
- **C38 Loading states:** every async region: in-button spinner, reserved-space fade-in, region error with Retry, designed empty state.
- **C39 Emphasize the CTA:** one `bg-brand-solid` primary per view, verb + object ("Book a table"); others visibly quieter.
