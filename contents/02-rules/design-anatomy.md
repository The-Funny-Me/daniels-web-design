> Open only when `SKILL.md` routes you here. The rules themselves live in `ui-rules.md` / `ux-rules.md`; this file holds only the implementation detail behind them, by rule id.

# 02 · Design anatomy: implementation notes

- `X18a` **Safe triangle.** Track the previous pointer point `(x0, y0)` and the open submenu's two leading-edge corners `(x1, y1)`, `(x2, y2)`. While the pointer moves inside that triangle toward the submenu, suppress sibling hover-switching for ~180ms. In RTL the triangle's base is the submenu's `inline-start` edge.
- `U22` **Hit targets.** Rows, nav items and table sort headers: `min-h-touch` and full width (`w-full px-3`); card links wrap the whole card (`block rounded-card` around `GlowCard`) or use a full-bleed `::after` on the link.
- `X18b` **Hover intent.** Start a 150ms timer on `pointerenter`, clear it on `pointerleave`, then open the rich popover or hover card. Once one is open, siblings in the same group switch with no delay until the pointer leaves the group.
- `X16a` **Debounced search.** Keep input state synchronous. Serve cached prefix matches immediately on Backspace or an empty query. Debounce remote fetches 250ms and cancel the in-flight request with `AbortController`.
- `X16` **Button lock.** The label stays in flow at `opacity-0`; `<Spinner />` sits in an `absolute inset-0 inline-flex items-center justify-center` overlay (`components/ui/button.tsx`). Width, height and accessible name stay fixed while `aria-busy="true"`.
- `X15` **Keyboards.** `inputmode` `numeric|decimal|email`, `type="email"`, and `autocomplete` `email|name|current-password|new-password|one-time-code`.
- `X19` **Optimistic UI.** Flip in the same frame, send the request behind it; on failure or Undo, reverse and show `undoToast` / `noticeToast`.
- `X17` **Focus.** `Overlay` / `GlassSheet` / `ConfirmDialog` trap Tab and restore focus to the trigger on close.
- `X22` **Scroll memory.** `use-chat-scroll.ts` leaves `scrollTop` untouched while the reader is scrolled up and shows the unread pill instead.
- `U16b` **Zero CLS.** `aspect-[4/3]`, `min-h-*`, or a fixed SVG `HEIGHT` on images, charts and async media.
- `U21a` **Optical alignment.** Play triangles shift 1–2px toward `inline-end`; display numerals use `lining-nums`.
- `U24` **Curves.** `--ds-ease-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`) or `springs.overlay|ui`; never `linear` or CSS `ease`.
- `U16a` **Dark elevation.** `canvas` → `surface` → `surface-raised` plus `glass-bg` and `border-hairline`, not heavier shadows.
