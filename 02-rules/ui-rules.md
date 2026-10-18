# UI Rules & Spatial Standards

Comprehensive standards for typography, layout geometry, spatial rhythm, dark mode elevation, and control mechanics.

---

## 1. Spatial Grid & Section Rhythm

### 1.1 The 8pt Spatial Discipline
All component padding, margins, gaps, and absolute offsets must strictly map to 8pt grid values (Tailwind CSS steps 1, 2, 3, 4, 6, 8, 12, 16, 24, 32).
- **Allowed Spacing Steps:** `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px), `p-16` (64px), `p-24` (96px), `p-32` (128px).
- **Strictly Banned Steps:** `p-5` (20px), `p-7` (28px), `p-9` (36px), `p-10` (40px), `p-11` (44px arbitrary gap).

### 1.2 Fibonacci Section Rhythm
Page sections must adhere to standard Fibonacci section rhythm tokens:
- `py-section-xs`: 32px (Compact containers, inline callouts)
- `py-section-sm`: 48px (Standard card sections)
- `py-section-md`: 64px (Feature grids, secondary headers)
- `py-section-lg`: 96px (Main content blocks, chapters)
- `py-section-xl`: 128px (Hero sections, landing focal points)

### 1.3 Container Constraints
- `max-w-app`: 1280px (Dashboard grids, data tables, main app interfaces)
- `max-w-marketing`: 1120px (Marketing layouts, landing page sections)
- `max-w-reading`: 680px (Longform prose, documentation, settings forms)

---

## 2. Dark Mode Elevation & Surface Tinting

In dark theme modes, drop shadows (`box-shadow: 0 20px 25px rgba(0,0,0,0.5)`) fail to provide visual separation. Depth is communicated strictly through surface lightness overlays.

| Elevation Layer | Token Class | Opacity / Tint Addition | Typical Usage |
| :--- | :--- | :--- | :--- |
| Level 0 (Base Canvas) | `bg-canvas` | Base Theme Canvas (0% tint) | Page backdrop, background canvas |
| Level 1 (Flat Cards) | `bg-surface` | +4% Lightness Layer | Inset cards, list items, feeds |
| Level 2 (Raised Cards) | `bg-surface-raised` | +8% Lightness Layer | Hovered cards, floating headers |
| Level 3 (Overlays) | `bg-surface-overlay` | +12% Lightness + Glass Edge | Modals, dropdown menus, tooltips |

---

## 3. Optical Alignment vs. Mathematical Centering

Mathematical flex alignment fails when rendering asymmetrical icons or text baselines. Follow these optical adjustment guidelines:

- **Play Icons (`PlayIcon`):** Apply `translate-x-[2px]` (LTR) or `-translate-x-[2px]` (RTL) to center the visual mass of the triangle within circular or pill buttons.
- **Chevrons (`CaretRight`, `ChevronRight`):** Nudge 1px toward the pointing direction to balance trailing padding.
- **Action Badges:** Small upper-corner notification badges must align optically with the top-end corner radius of their parent container (`-top-1 -end-1`).

---

## 4. Control Geometry & Button Dimension Locks

### 4.1 Touch Targets & Expanded Bounds
- Every interactive element (buttons, icon triggers, list items) must maintain a minimum bounding box of **44px × 44px**.
- For text links inside cards, expand the hit area across the entire card container using `after:absolute after:inset-0`.

### 4.2 Loading State Stability
When controls transition into pending/loading states:
- Buttons must preserve their exact `width` and `height` dimensions.
- Use explicit CSS variable locks (`min-w-[120px]`) or overlay a centered `<Spinner />` over an `opacity-0` text span to guarantee zero layout recalculation.
