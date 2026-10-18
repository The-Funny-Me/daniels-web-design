# Golden example: Auth screen

Goal: prove the inputs, the overlay physics and the error philosophy in the smallest surface.

## Layout

Centered glass card (`card` radius, glass-bg, one glass layer) on `canvas`, `max-w-[440px]`, over a quiet radial light (level 1-2). Tabs or a link toggles **Sign in / Create account**. Below: a reset-password link opening a **glass sheet**.

## Fields

| Field | Component | Examples cycled |
|---|---|---|
| Email | `AnimatedInput kind="email"` | 3–4 shapes |
| Password | `AnimatedInput kind="password"` | 3 demo passwords, typed → dotted → dotted out |
| Name (create account) | `AnimatedInput kind="name"` | 4–6, Hebrew names in the Hebrew UI |

Visible persistent labels on all; the animated layer is `aria-hidden`; show/hide password toggle (`aria-pressed`).

## States to implement

- **Idle**: examples cycling. **Focus**: animation stops within one frame.
- **Validation (on blur)**: inline field errors under the field, `aria-describedby`, never clearing input.
- **Submitting**: button shows an in-place loading state (the one permitted spinner), double-submit prevented.
- **Server error (wrong credentials, network)**: contained error region in the card with plain-language message and **Retry**; the form stays filled.
- **Success**: fade into the dashboard route using the adaptive loader.
- **Forgot password**: opens `GlassSheet` (rises 12px, blur-in, `overlay` spring, no overshoot; scrim focus mode).
- **Irreversible demo**: "Delete account" in a settings drawer behind a **typed-confirmation modal** (to exercise UX rule X7).

## RTL specifics

- Email/password inputs stay `dir="ltr"` but align to `start`; labels and the card mirror.
- Password dotting sweep runs in the text's reading direction.
- Hebrew labels are untracked, 14px.

## Acceptance criteria

- [ ] Animation stops on focus/value/autofill; resumes on empty blur; paused on hidden tab.
- [ ] Reduced motion shows one static example, no dotting demo.
- [ ] Screen reader reads labels and errors, never the cycling placeholder.
- [ ] Tab order correct in LTR and RTL; focus ring visible everywhere; focus trapped in the sheet and modal and restored on close.
- [ ] No layout shift when examples change length.
- [ ] Zero grep hits for raw values; works in all packs, light and dark.
