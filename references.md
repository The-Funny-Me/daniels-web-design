# References & Verified Guidelines

Sourced design references, verified ergonomic principles, and technical specifications behind the `/web-design` system.

---

## 1. Verified Interaction Physics & Cursor Dynamics

### 1.1 Safe Triangle Submenu Trajectory
- **Reference:** Amazon, Khan Academy, and Radix UI Navigation Menu pointer tracking vector math algorithms.
- **Rule:** Prevent premature menu item collapse during diagonal cursor movement across parent list items by defining a dynamic 2D vector triangle bounded by cursor position $(x, y)$ and submenu corners $(x_1, y_1), (x_2, y_2)$.

### 1.2 Fitts's Law & Target Expansion
- **Reference:** Paul Fitts (1954) Ergonomic Law for Human-Computer Interaction ($MT = a + b \log_2(2D/W)$).
- **Rule:** Target width ($W$) directly influences movement time ($MT$). Expanding clickable hit targets to fill full container padding or card bounds minimizes targeting effort and eliminates interaction misfires.

### 1.3 Debounced Intent & Race Condition Mitigation
- **Reference:** ReactiveX / RxJS debouncing & `switchMap` cancellation protocols.
- **Rule:** Enforce a 200–300ms pause threshold on text inputs prior to network dispatches and cancel previous pending requests using `AbortController` to guarantee asynchronous result synchronization.

---

## 2. Layout & Visual Ergonomics

### 2.1 Dark Mode Surface Elevation via Tinting
- **Reference:** Material Design Dark Theme Surface Elevation & Apple Human Interface Guidelines for Dark Mode.
- **Rule:** Dark interfaces lack contrast for shadow keylights. Elevation is expressed by adding semi-transparent white lightness overlays (+4%, +8%, +12% opacity) over the base canvas.

### 2.2 Optical Alignment vs. Mathematical Center
- **Reference:** Typography & Iconography Design Principles (Optical Weight Balance).
- **Rule:** Asymmetrical shapes (such as play triangles) have visual center points shifted toward their base. Offsetting play triangles by +1–2px on the X-axis restores perceived visual equilibrium.

### 2.3 Cumulative Layout Shift (CLS) Mitigation
- **Reference:** W3C Web Vitals Specification for Cumulative Layout Shift.
- **Rule:** Reserve fixed aspect ratio space (`aspect-ratio` or `min-height`) for dynamic elements prior to image/data load to guarantee 0px layout shift (CLS = 0.00).
