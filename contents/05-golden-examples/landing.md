# Golden example: Landing page

Goal: the feeling of the folder in one scrollable page. Few elements, each with its own square of silence.

## Sections (top to bottom)

1. **Glass nav** (pill, one glass layer, sticky). Logo, 3 links, one primary CTA. Pack and mode controls live in the `DesignSwitcher`, floated bottom-`start`.
2. **Hero** (`section-xl`). Tracked label eyebrow → display headline (`display-lg`, 2 lines max) → one-sentence lede (`text-secondary`, `max-w-reading`) → primary + quiet CTA. One **level-4 accent moment** (particle drift on the primary CTA's first reveal, once). Ghost numeral `01` at the inline-end edge. Metallic hairline (pack metal, or `border-hairline` where the pack has none) beneath.
3. **Three chapters** (`section-lg`), each: ghost numeral (`02`, `03`, `04`), label, display heading, short paragraph, one supporting visual (abstract, in-system; no stock photos, no characters). Asymmetric 12-column placement alternating inline-start/inline-end (mirrors in RTL). These are the *main focus elements*: smooth-scroll focus highlighting applies.
4. **Detail row** (`section-md`): four small facts in cards (`card` radius, tint + hairline), level-1 accent only.
5. **Quote or proof** (`section-md`): one sentence in display serif, centered **only because it is under two lines**.
6. **Closing CTA** (`section-lg`): single action on `surface-sunken`, level-2 radial light behind it.
7. **Footer**: hairline, tracked labels, minimal links.

## Rules this page must demonstrate

- Smooth scroll via Lenis **on this page only**, disabled for reduced motion; snap `proximity`, never `mandatory`.
- Reveals: `Reveal` staggered fade (`duration-slow`, `stagger` 60ms) tied to scroll via Motion, in reading order (RTL reversed).
- Accent ladder respected: exactly one level-4 (hero), at most one level-3, a few level-2.
- No bare text on imagery; any visual behind text gets a scrim.
- Hebrew version: tracked labels fall back to untracked `text-sm`; ghost numerals stay Latin digits; section order and alignments mirror.

## Acceptance criteria

- [ ] Visually distinct from a default template; passes the "white velvet sheets" sniff test in light mode.
- [ ] All 8 packs render without a contrast failure (spot-check three by eye, all by the token checks).
- [ ] RTL: nothing clipped, nothing mis-aligned, nav and icons mirrored correctly.
- [ ] Reduced motion: no particles, no parallax, no smooth scroll; page still pleasing.
- [ ] Lighthouse: accessibility ≥ 95, no layout shift from reveals.
- [ ] Zero grep hits for raw values.
