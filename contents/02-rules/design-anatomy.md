# 02 · Good Design Anatomy

The structural physics, interaction mechanics, and visual polish that separate considered interfaces from default templates. Every component and page built with this skill must honor these four pillars.

---

## 1. Navigation & Cursor Dynamics

* **Submenu Aiming (The Safe Triangle Buffer):** In nested dropdown menus, predicting cursor trajectory toward submenus using dynamic triangular buffers (or pointer tracking vector math). This prevents submenus from collapsing prematurely when moving the cursor diagonally across neighboring menu items.
  * *Implementation:* Track the previous pointer coordinate `(x0, y0)` and the active submenu's leading-edge corners `(x1, y1)` and `(x2, y2)`. While the cursor moves inside that triangle toward the submenu, suppress sibling hover-switch for ~180ms. In RTL, mirror the triangle's base edge to the submenu's `inline-start` border.
* **Expanded Hit Targets (Fitts's Law):** Extending interactive hit targets (`padding`, `min-h-touch`, or full-bleed `::after` pseudo-elements on card links) to fill the entire container or card rather than anchoring the click listener strictly to the inline text or icon.
  * *Implementation:* Interactive rows, nav items, and table sort headers use `min-h-touch` (`44px`) and full container width (`w-full px-3` or `block rounded-card` wrapping the entire `<GlowCard>`).
* **Hover Intent Delay:** Delaying the trigger of heavy popovers or tooltips by 100–200ms to avoid firing unwanted popovers when a user rapidly sweeps the cursor across the screen.
  * *Implementation:* Start a `150ms` timer on `pointerenter` and clear it on `pointerleave` before opening rich popovers or hover cards. Once open, adjacent items in the same group may switch with zero delay until the pointer leaves the group.

---

## 2. Search, Input & Form Physics

* **Debounced Intent vs. Raw Input Queries:** Delaying autocomplete network requests until a brief typing pause occurs (e.g., 200–300ms debounce), or instantly pulling from local cache on backspace, rather than firing unthrottled requests that cause flashing dropdown results and race conditions.
  * *Implementation:* Keep local input state synchronous; serve cached prefix matches immediately on `Backspace` or empty query; debounce remote fetches by `250ms` and cancel in-flight requests via `AbortController`.
* **Button Dimension Lock on Loading States:** Preserving explicit `width` and `height` on submit buttons when transitioning to a loading spinner. Cheap sites allow the button to shrink or warp layout flow when text is replaced by a loader.
  * *Implementation:* Keep the button label inside flow with `opacity-0` while rendering `<Spinner />` in an `absolute inset-0 inline-flex items-center justify-center` overlay (`components/ui/button.tsx`). The button's bounding box (`width` × `height`) and accessible name remain 100% locked while `aria-busy="true"` is set.
* **Native Keyboard Tailoring (`inputmode` & `autocomplete`):** Explicitly setting `inputmode="numeric"`, `inputmode="decimal"`, `inputmode="email"`, or `type="email"` alongside appropriate `autocomplete` tags (`email`, `name`, `current-password`, `new-password`, `one-time-code`) to summon the correct touch keyboard and autofill triggers without browser layout shifts.

---

## 3. State Management & Motion

* **Optimistic UI Updates with Graceful Rollback:** Immediately reflecting state toggles (e.g., bookmarking, liking, favoriting, archiving) in the UI before the network payload resolves, paired with a silent background request and automatic state reversal with a subtle toast notification (`undoToast` / `noticeToast`) if the API call fails or the user clicks Undo.
* **Focus Trap & Focus Restoration:** Trapping keyboard `Tab` focus within active modal dialogs (`Overlay` / `GlassSheet` / `ConfirmDialog`), and explicitly restoring active focus to the triggering element once the modal closes.
* **Scroll Position Memory:** Preserving precise scroll coordinates when navigating back from a detail view to a feed, or when streaming new messages into a chat log while the user is reading history (`use-chat-scroll.ts` keeps `scrollTop` untouched when scrolled up and surfaces the unread pill instead of yanking the viewport).

---

## 4. Layout Physics & Visual Polish

* **Skeleton Reserve Areas (Zero CLS):** Reserving fixed structural aspect-ratio space (`aspect-ratio` such as `aspect-[4/3]`, `min-h-*`, or fixed SVG `HEIGHT`) for dynamic images, charts, and asynchronous media before they load, eliminating Cumulative Layout Shift (CLS).
* **Optical Alignment vs. Mathematical Centering:** Nudging icons, play buttons, or custom directional glyphs slightly off-center (e.g., shifting play triangles toward `inline-end` by `1–2px`, or optically aligning display numerals with `font-variant-numeric: lining-nums`) to satisfy human visual perception, rather than relying solely on raw `display: flex; align-items: center`.
* **Natural Spring Curves over Linear Transitions:** Using directional cubic-bezier curves (`--ds-ease-soft: cubic-bezier(0.22, 1, 0.36, 1)` or `cubic-bezier(0.16, 1, 0.3, 1)`) or critically damped springs (`springs.overlay`, `springs.ui`) for modal pop-ins, drawer slides, and layout shifts, avoiding linear or default CSS `ease` transitions that feel robotic.
* **Elevation via Surface Tinting (Dark Mode):** Communicating visual depth in dark mode using lightness layering (`canvas` → `surface` → `surface-raised`) and pack-tinted surface opacity overlays (`glass-bg`, `border-hairline`) rather than heavy drop shadows (which become invisible against dark backgrounds).
