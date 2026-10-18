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

## Timing (`typing` in `src/hooks/use-cycler.ts`)

| Phase | Token | Duration |
|---|---|---|
| Initial delay before first character | `startDelay` | 600ms |
| Typing | `type` ± `jitter` | 55ms per character (±15ms jitter) |
| Hold (text mode, fully typed) | `hold` | 1600ms |
| Erase (text mode) | `erase` | 28ms per character |
| Gap before next example | `gap` | 300ms |
| Password readable pause before masking | `maskStart` | 600ms |
| Password masking (char → `•`) | `mask` | 45ms per character |
| Password hold (all dots) | `maskedHold` | 900ms |
| Password unmasking (dots removed in reverse) | `unmask` | 30ms per character |
| Caret | `.bg-brand-ui` | 1px bar blinking (`blink 1s steps(1) infinite`); hidden when not animating or under reduced motion |
| Placeholder color | `text-ink-3` | `--ds-text-tertiary` (4.5:1 guaranteed) |

## Password masking demo

Sequence for one example in `useCycler` (`mode="password"`), e.g. `Velvet#2026!`:

1. **typing**: characters appear as readable text (`55ms ± 15ms` per character).
2. **maskStart**: 600ms pause while fully readable.
3. **masking**: characters convert to `•` one by one **in reading direction** (`DOT.repeat(dots) + chars.slice(dots, n).join("")`), `45ms` each.
4. **maskedHold**: 900ms of full dots.
5. **unmasking** ("dotted out"): dots are removed in reverse order (`n - 1` down to `0`), `30ms` each, leaving empty.
6. **gap**: 300ms before the next example begins typing.

The real password field (when the user focuses and types) shows the browser's native dots; the show/hide toggle (`aria-pressed`) overrides `type` between `"password"` and `"text"`.

## Direction awareness

- Password and text inputs follow the page direction (`dir` on `<html>`), and the `aria-hidden` overlay sits on `start-6 end-6` so the input and overlay directions always match.
- A Hebrew example in a Hebrew UI (`dir="rtl"`) types right-to-left from the inline-start (right) edge; the caret sits at the trailing (left) end of the typed text.
- RTL demos use Hebrew password examples (`exPassword` in `src/lib/i18n/auth.ts`) so masking sweeps right-to-left naturally.

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
