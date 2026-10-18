# Animated inputs

Inputs show cycling example text instead of a single static placeholder. Examples are typed, held, erased, then the next one is typed. Passwords demonstrate masking: typed as readable text, then converted to dots, then dotted out.

**Never a substitute for a label** (UX rule X14). The visible label stays; this animates the placeholder layer only.

## Component: `AnimatedInput`

```ts
interface AnimatedInputProps {
  label: string;
  kind: "text" | "email" | "password" | "search" | "name" | "phone" | "custom";
  examples?: string[];            // overrides the defaults for the kind
  maskExamples?: boolean;         // password-style typed→dotted demo; default true when kind="password"
  ...inputProps
}
```

State machine (Motion owns state; a single timer chain):

`idle → typing → holding → (masking → maskedHold → unmasking)? → erasing → typing(next)`

The animation **stops immediately** when the input receives focus *or* has a value, and the real caret and text take over. It resumes only if the field is blurred and empty. A real user's input is never animated.

## Example counts by element

The number of cycled examples depends on how much variety teaches the format.

| Field | Examples | Notes |
|---|---|---|
| Email | 3–4 | different shapes: `name@studio.com`, `first.last@company.co.il`, `hello@yourdomain.com` |
| Name | 4–6 | mix scripts and cultures; in Hebrew UI include Hebrew names |
| Phone | 2–3 | local format first (`050-123-4567`, `+972 50 123 4567`) |
| Search | 5–7 | what the product actually searches, most useful first; more examples because intent varies widely |
| Password | 3 | demo of masking only, never real passwords (`correct-horse-battery`, `Velvet#2026!`) |
| URL / handle | 2–3 | |
| Free text / message | 4–6 | short prompts that show what is expected |
| Date | 1–2 | a static placeholder is better; do not animate |

Rule of thumb: **the more open-ended the field, the more examples**; fixed-format fields get few. Never more than 7 in a cycle. Examples are content, so they come from the `t()` dictionary per locale, not hard-coded.

## Timing

| Phase | Duration |
|---|---|
| Typing | 55ms per character (±15ms jitter for a human feel; no jitter for passwords) |
| Hold (fully typed) | 1600ms |
| Erase | 28ms per character (backspace is faster than typing) |
| Gap before next | 300ms |
| Caret | a soft 1px `text-tertiary` bar blinking at 1.06s; hidden when not animating |
| Placeholder color | `text-tertiary` (4.5:1 guaranteed) |

## Password masking demo

Sequence for one example, e.g. `Velvet#2026!`:

1. **typing**: characters appear as readable text.
2. **holding**: 1000ms readable.
3. **masking**: characters convert to `•` one by one **in reading direction**, 45ms each. LTR: first → last (left to right). RTL: first → last (right to left). The conversion sweeps along the text's own direction.
4. **maskedHold**: 900ms of dots.
5. **unmasking** ("dotted out"): dots disappear one by one, **in reverse of the masking order**, 30ms each, leaving empty.
6. next example begins typing.

The real password field (when the user focuses and types) shows the browser's native dots; the show/hide toggle (`aria-pressed`) works as normal.

## Direction awareness

- Input `dir` follows content: `dir="auto"` on text fields; email/URL/password inputs are always `dir="ltr"` with `text-align: start` so the example sits at the inline-start edge of the field.
- A Hebrew example in a Hebrew UI types right-to-left from the inline-start (right) edge; the caret sits at the trailing (left) end of the typed text.
- Mixed content (a Hebrew name containing digits) wraps numeric runs with `<bdi>`.
- **Masking follows the logical order of the string.** A Hebrew example in an RTL page masks from the right edge to the left; a Latin example in the same RTL page still sits left-to-right and would visibly mask left-to-right. So RTL demos must use an example written in the page's script (the preview uses Hebrew password examples for exactly this reason).
- Dots use `•` (U+2022) in both directions; spacing is monospaced to avoid layout jitter (`font-variant-numeric: tabular-nums` for digits; dots rendered in `--ds-font-mono`).

## Accessibility

- The animated layer is `aria-hidden="true"`; the input has a real `<label>` and, if a static hint is needed, `aria-describedby` to a static string. Screen readers never hear the cycling.
- No `placeholder` attribute carries the animation (it would be announced inconsistently). Use a positioned overlay `<span aria-hidden>`; the actual `placeholder` is empty or a single static example.
- Reduced motion: **no typing, erasing or masking animation.** Show one static example (the first) in `text-tertiary`, with no password dotting demo.
- Autofill: if the browser autofills, treat it as a value (stop animation).
- Performance: one timer per field, cleared on unmount; pause when the tab is hidden (`visibilitychange`) or the field is off-screen (`IntersectionObserver`).

## Test checklist

- Focus stops the animation within one frame; blur with empty value resumes it.
- Password demo masks LTR in English and RTL in Hebrew.
- `prefers-reduced-motion` shows a static example.
- No layout shift (the field has a fixed height and the overlay is absolutely positioned).
- Screen reader reads only the label (and the static hint, if any).
