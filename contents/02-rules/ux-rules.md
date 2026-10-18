# 02 · UX rules

## Loading
- **X1** No spinners, except inside a button that is mid-action (a 16px thin ring).
- **X2** Use the adaptive pattern from `01-fundamentals/foundations.md §8`: under 300ms never show a loader; past 300ms show the loading screen for at least 600ms; hand off into the same staggered fade-in. Content areas reveal with a fade-in, never a hard pop.
- **X3** Reserve space before content arrives (aspect ratios, min-heights). Layout shift on reveal is a bug.
- **X4** Route changes: keep the previous page visible and crossfade; a 1px `accent-ui` progress hairline at the top of the viewport indicates navigation. Do not blank the screen.
- **X5** Slow connections (>3s): the loading screen gets a calm secondary line of copy ("Still on it…"), not a longer animation.

## Destructive actions (hybrid)
- **X6** Reversible actions (delete item, archive, remove from list) happen immediately with an **8s undo toast**. The toast is glass, bottom-start aligned, announces via `role="status"`, and undo is reachable by keyboard.
- **X7** Irreversible actions (delete account, purge data, revoke keys) require a modal with **typed confirmation** of a named object. The destructive button is `danger`-styled only inside this modal; the cancel action is the default focus.
- **X8** Never use native `confirm()`. Never put a destructive action next to a primary one without 16px+ separation.

## Errors
- **X9** Errors are contained to the failing region: a calm card on `surface` with a plain-language message, what happened, and a **Retry** action; the rest of the page stays alive.
- **X10** Full-page fallback only for route-level crashes, with a way back (home, retry).
- **X11** Not alarm-red by default. Errors use `danger` as an accent (icon + text on `danger-bg`), never a full red fill, unless the action is irreversible and imminent.
- **X12** Field errors appear inline under the field, linked with `aria-describedby`, and never clear the user's input. Validate on blur, not on every keystroke.
- **X13** Messages say what to do, not what went wrong internally. No error codes unless the user must quote them to support.

## Forms and inputs
- **X14** Labels are always visible and persistent. The animated example placeholders (see `04-signature-moves/animated-inputs.md`) never replace a label.
- **X15** Use the right `type`, `inputmode` and `autocomplete` on every field. Passwords support show/hide.
- **X16** Submit buttons show a loading state in place and disable duplicate submission; preserve input on failure.

## Overlays and focus
- **X17** Modal and sheet: focus trap, `Esc` to close, return focus to the trigger, scroll lock on the page, scrim in focus mode (see foundations §6). Entrance uses the `overlay` spring, with no overshoot.
- **X18** Popovers close on outside click and `Esc`. One modal at a time; no modal opens another modal.

## Navigation and feedback
- **X19** Every interaction gets feedback within 120ms (press state), even when the result takes longer.
- **X20** Toasts: max one visible at a time, queued; auto-dismiss after 6s except undo (8s) and errors (manual dismiss).
- **X21** Empty states explain what belongs here and offer the next action; they are designed, not blank.

## Scroll (cross-reference)
- **X22** Smooth/inertial scroll only on marketing surfaces and main focus elements; native elsewhere. Chat uses native scroll up and the bottom snap-and-reveal pattern. Details in `04-signature-moves/scroll-and-focus.md`. Any scroll-hijack must have a keyboard and button alternative and must never trap the user.

## Accessibility baseline
- **X23** Semantic landmarks, one `h1`, logical heading order. Every interactive element is keyboard-reachable in visual order (which flips in RTL).
- **X24** Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-color-scheme`, `prefers-contrast: more` (use `border-strong` for hairlines under it).
- **X25** Animated or auto-updating content is announced politely (`aria-live="polite"`) only when it conveys information; purely decorative motion is `aria-hidden`.
