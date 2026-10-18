# Golden example: App dashboard

Goal: prove density without losing the velvet feel: cards, a table, the loading model, the destructive-action hybrid, and glass + tint depth in a working surface.

## Layout

App container `1200px`. Left rail navigation (inline-start; mirrors in RTL), top bar (glass), content in a 12-column grid.

1. **Summary row**: 4 stat cards (`card` radius, tint + hairline, `shadow-sm`). Values in display serif at `text-3xl`, labels tracked (Latin) / untracked (Hebrew). Level-1 accent on the one that changed most.
2. **Primary panel**: a chart card. Chart colors follow the `dataviz` guidance and are derived from pack roles (`brand-ui`, `deep-ui`, text tints), never raw hex. One series highlighted, others quiet.
3. **Table**: sortable, with row actions. Dense but spacious (row height 56px, 16px cell padding), `border-hairline` rules, no zebra stripes. Sticky header on `surface`.
4. **Activity feed** beside the table (stacked below on mobile).
5. **Settings drawer**: glass sheet with the irreversible demo (delete workspace).

## Behavior to demonstrate

- **Adaptive loading:** fast resolves skip the loader and fade in; a throttled "slow network" toggle shows the loading screen (≥600ms) handing off into the same staggered reveal. Layout space is reserved.
- **Skeleton-free:** no spinners and no skeleton blocks; the design uses reserved space plus fade-in (per your choice).
- **Hybrid destructive:** deleting a table row is immediate with an **8s undo toast**; deleting the workspace needs a **typed-confirmation modal**.
- **Contained error:** a "simulate failure" control makes one card fail; it shows the inline recovery card with Retry while the rest stays alive.
- **Depth:** base cards are tint; the top bar, toasts, drawer and modals are glass; no glass-on-glass.
- **Empty state:** a designed empty table with next-action.

## Acceptance criteria

- [ ] Zero layout shift on reveal; the slow-load path shows the loader, then the same reveal.
- [ ] Undo restores the row in place; modal requires the typed name.
- [ ] Failing card is isolated; Retry works.
- [ ] Keyboard-complete: table navigation, drawer focus trap, toast undo reachable.
- [ ] RTL: rail, table columns, chart axis orientation (time axis follows the locale convention; documented in code), numerals handled with `bdi`.
- [ ] Contrast: chart marks ≥3:1 against `surface`; no information by color alone (patterns or labels for series).
- [ ] Zero grep hits for raw values; all packs and both modes.
