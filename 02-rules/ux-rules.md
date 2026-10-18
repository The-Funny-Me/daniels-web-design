# UX Rules & Interaction Physics

This document establishes non-negotiable standards for interaction physics, cursor dynamics, state management, form behavior, and accessibility across all application interfaces.

---

## 1. Navigation & Cursor Dynamics

### 1.1 Submenu Aiming (The Safe Triangle Buffer)
Nested dropdown menus must implement pointer-tracking vector math or dynamic triangular buffer zones between the cursor's current position and the corners of the active submenu.
- **Problem:** Moving the cursor diagonally from a parent item to a submenu causes the cursor to pass over neighboring menu items, prematurely collapsing the desired submenu.
- **Solution:** While the cursor is inside the dynamic safety triangle (defined by cursor point $P$ and submenu boundary points $A$ and $B$), hover state changes on neighboring menu items are suppressed for a 300ms window.
- **Implementation:** Use a pointermove vector listener or Radix Navigation Menu primitives which include safe-triangle trajectory math natively.

### 1.2 Expanded Hit Targets (Fitts’s Law)
Interactive click targets must span the entirety of their parent container or card bounds rather than anchoring click listeners strictly to inline text spans or standalone icons.
- Minimum touch/pointer target dimension is **44px × 44px** (`min-h-touch min-w-touch`).
- Cards containing primary actions should use pseudo-element stretch (`after:absolute after:inset-0`) or direct container event listeners.
- Text labels inside controls must have generous padding (`px-4 py-2.5`) so misses near edges still register clean interactions.

### 1.3 Hover Intent Delay
Heavy popovers, preview cards, and rich tooltips must delay initial trigger evaluation by **100–200ms**.
- **Intent:** Rapid cursor sweeps across the screen must not spawn transient popover flashes or trigger unnecessary asynchronous layout renders.
- If the cursor leaves the trigger target before the intent delay timer completes, the timer cancels cleanly with zero DOM side effects.

---

## 2. Search, Input & Form Physics

### 2.1 Debounced Intent vs. Raw Input Queries
- **Debounce Window:** Autocomplete network queries must wait for a **200–300ms pause** in user typing before dispatching.
- **Backspace Physics:** When a user hits `Backspace` or deletes text, input state must check an in-memory cache first to instantly render previous search states without network latency.
- **Race Condition Prevention:** Out-of-order network responses must be discarded using `AbortController` or request sequence keys so older slow requests never overwrite fresh input results.

### 2.2 Button Dimension Lock on Loading States
Submit and action buttons must explicitly preserve their rendered width and height when transitioning into a pending/loading state.
- **Anti-Pattern:** Replacing button text with a spinner causes the button container to shrink or expand, inducing layout shifts (CLS) across adjacent form controls.
- **Rule:** Measure or lock button bounding dimensions (`min-w-[var(--button-width)]`, or maintain inline element footprint with `opacity-0` text layer overlaid by a absolute-centered spinner).

### 2.3 Native Keyboard Tailoring
Form fields must explicitly declare native HTML input attributes to summon the optimal software keyboard on mobile devices:
- `inputmode="numeric"` for verification codes, ZIP codes, and PINs.
- `inputmode="decimal"` for monetary amounts and statistical inputs.
- `type="email"` with `autocomplete="email"` for user credentials.
- `type="tel"` with `autocomplete="tel"` for phone inputs.
- Always include explicit `autocomplete` attributes (`current-password`, `new-password`, `one-time-code`, `given-name`, `family-name`) to support zero-shift password manager autofill.

---

## 3. State Management & Motion Physics

### 3.1 Optimistic UI Updates with Graceful Rollback
For high-frequency state toggles (e.g., bookmarking, favoriting, status toggles, inline archives):
1. **Immediate Feedback:** Update the local React/UI state instantly on click (0ms perceptual delay).
2. **Background Sync:** Dispatch the asynchronous network mutation silently in the background.
3. **Graceful Rollback:** If the network request fails after retries, automatically revert the UI to its previous state and emit an action-oriented undo toast (e.g., *"Failed to save item. Reverted."*).

### 3.2 Focus Trap & Focus Restoration
- **Modal Dialogs & Sheets:** When a modal or sheet layer opens, keyboard `Tab` focus must be trapped strictly within the overlay container.
- **Initial Focus:** Initial focus must default to the primary non-destructive input or explicit cancel action.
- **Restoration:** When the modal closes (via Esc, backdrop click, or action completion), keyboard focus must be explicitly restored to the exact element that originally triggered the modal.

### 3.3 Scroll Position Memory
When navigating away from a feed, table, or list view to a detailed item view and returning:
- The application must preserve and restore the exact vertical and horizontal scroll coordinates ($x, y$).
- Scroll position restoration must execute before screen paint to prevent jarring page jumper effects.

---

## 4. Layout Physics & Visual Polish

### 4.1 Skeleton Reserve Areas (Zero CLS)
To achieve zero Cumulative Layout Shift (CLS) during asynchronous data fetching:
- Pre-allocate exact structural layout dimensions for media and dynamic content using CSS `aspect-ratio` bounds (e.g., `aspect-video`, `aspect-square`) or explicit height reservations (`min-h-[280px]`).
- Skeleton loader placeholders must match the exact border-radius, padding, and layout grid of the incoming final element.

### 4.2 Optical Alignment vs. Mathematical Centering
Raw mathematical alignment (`display: flex; align-items: center; justify-content: center;`) is visually inadequate for asymmetrical icon geometries:
- **Play Triangles:** Nudge right by **1–2px** (`translate-x-0.5`) to visually balance the heavy left base mass.
- **Custom Checkboxes & Radio Dots:** Optical adjustment of 0.5–1px depending on line height and font baseline.
- **Chevron Arrows:** Offset 1px toward the direction of points to feel optically centered relative to surrounding text margins.

### 4.3 Natural Spring Curves over Linear Transitions
- **Banned:** `transition: all 0.3s linear` or default flat `ease`. Linear motion feels mechanical and cheap.
- **Mandatory:** Directional cubic-bezier physics or spring configurations:
  - Overlay Entrance: `cubic-bezier(0.16, 1, 0.3, 1)` (fast acceleration with high-friction damping).
  - UI Springs: `stiffness: 400, damping: 30` (crisp, zero overshoot).
  - Hero Reveals: `stiffness: 180, damping: 24` (spacious, majestic glide).

### 4.4 Elevation via Surface Tinting (Dark Mode)
In dark mode interfaces, traditional drop shadows become invisible against dark canvases.
- **Rule:** Communicate z-index elevation and visual depth using lightness tinting layering and surface opacity overlays rather than heavy black shadows.
- **Elevation Ramp:**
  - `canvas` (Level 0): `#0a0a0c` / Midnight Base
  - `surface` (Level 1): `canvas` + 4% surface lightness tint (`bg-surface`)
  - `surface-raised` (Level 2): `canvas` + 8% surface lightness tint (`bg-surface-raised`)
  - `surface-overlay` (Level 3): `canvas` + 12% surface lightness tint + subtle hairline border (`border-hairline`)
