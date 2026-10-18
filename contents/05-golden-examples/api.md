# Golden example API

Open this instead of the app tree. Then open the one source file you are copying. Paths are under `05-golden-examples/app/src/`.

`useDesign()` → `{ pack, theme, dir, motion, lang, locale, motionOk, ready, t, tl, setPack, setTheme, setDir, setMotion }`. `t(key, vars?)` fills `{name}`. `tl(key)` returns a string list. `PACKS`, `DEFAULT_PACK` from `components/patterns/design-provider.tsx`.

`Button` (`components/ui/button.tsx`): `variant` primary|secondary|quiet|ghost|danger, `size` sm|md|lg|icon, `glint`, `loading` (locks the box, `aria-busy`, in-flow label at opacity 0, overlay `Spinner`), `asChild`.

`Card`, `GlowCard({ className, shellClassName })` in `components/ui/card.tsx`. `Badge({ tone })`. `Switch({ checked, onCheckedChange, label })`. `Input`. `Field({ label, hint, error, trailing, children: (control) => node })` — `control` carries `id`, `aria-describedby`, `aria-invalid`.

`AnimatedInput({ examples, mode: "text"|"password", ...inputProps })` — pass `type` to override the password reveal toggle.

`Overlay` / `GlassSheet({ open, onOpenChange, title, description, dismissOnScrim, initialFocus, variant })`. `ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, phrase, onConfirm })`.

`undoToast({ message, undoLabel, closeLabel, onUndo })`, `noticeToast(message, tone?)`.

`Reveal({ index, inView, as })`. `useAdaptiveLoading(load)` → `{ phase: pending|loading|ready|error, data, reload, attempt }`. `LoadingGate({ phase, onRetry, compact })`, `LoadingScreen`.

`RadialLight({ breathe })`, `AccentBurst({ trigger })` (increment `trigger`; parent must be positioned), `GhostNumeral({ value, drift })`, `BrandMark({ draw })`, `Eyebrow`, `RegionError({ onRetry })`, `RegionBoundary`.

Motion: `durations`, `stagger`, `ease`, `springs.{overlay,ui,hero}`, `loadingConfig`, `fade` from `@/lib/motion`. CSS: `.glass .scrim .ds-label .lift .glint .glow-card .radial-light .shiver .breathe .hairline-metal[data-shimmer] .spinner`.

Routes: `/` index, `/landing`, `/auth`, `/chat`, `/dashboard`. Read the matching brief in this folder before opening `app/src/app/<route>/page.tsx`.
