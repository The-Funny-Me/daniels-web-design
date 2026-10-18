> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# Scroll and focus

Principle: **scroll behavior is a tool to highlight the main focus element, never a decoration.** It must never hijack in a way that traps the user or breaks keyboard and assistive-tech access.

## 1. Smooth scroll on main focus elements

Applies to marketing surfaces and any element designated as a *main focus* (a hero, a featured section, a product reveal).

- **Library:** Lenis (the single approved extra dependency) for inertial scrolling on marketing pages (`/landing` only); Motion/anime.js `onScroll` for reveals tied to scroll position.
- **Parameters:** `lerp: 0.09`, `smoothWheel: true` (native feel on touch).
- **No CSS `scroll-snap` with Lenis:** Do **not** combine CSS `scroll-snap-type` with Lenis on the same scroll container — they fight each other. Use Lenis on `/landing` without CSS scroll-snap; if native scroll is used without Lenis, `scroll-snap-type: y proximity` (never `mandatory`) is allowed.
- **Highlighting:** as a main-focus element enters, it comes to full opacity and a gentle scale of 0.98→1; neighbors dim to 0.55 opacity. Never dim below AA: dimming is applied to decorative neighbors and to *non-text* layers only, or reverts when the user stops.
- **Elsewhere:** apps and dashboards use **native scroll**. Lists, tables, forms, modals: native.
- **Reduced motion:** Lenis disabled; native scroll; reveals are plain fades; no snap.
- **Escape hatches:** `Home`/`End`/`PageUp`/`PageDown`/`Space`/arrow keys keep working; anchor links scroll smoothly via `scrollIntoView`; focus moves with scroll position so keyboard users land on the focused section.

## 2. Chat: native up, snap-and-reveal at the bottom

Chat scrolls **natively when scrolling up** through history. At the bottom, the bottom edge behaves differently: it *snaps* to the latest message, and a deliberate extra scroll past it reveals contextual options.

### Behavior

1. **Up (history)**: native scroll, no interference. When the user scrolls up beyond ~1 viewport from the bottom, a glass "jump to latest" pill appears.
2. **Down (return to live)**: native scroll until the last message's bottom edge approaches the viewport bottom (within ~80px), then it **snaps** to rest exactly at the end, with the composer clear of content. A short, soft spring (`ui`), no overshoot.
3. **Past the end (reveal)**: with the chat at the bottom, a *further* downward scroll or drag (an intentional over-scroll of about 72px of accumulated delta, resisted like a rubber band) **reveals a panel of relevant options** (suggested replies, actions, related items) that slides up beneath the last message. It is revealed by the user's gesture, not auto-opened.
4. **Dismiss**: scroll up, `Esc`, or tapping elsewhere; the panel collapses with the same spring.

### Parameters (`scrollSpec` in `src/hooks/use-chat-scroll.ts`)

| Parameter | Value | Meaning |
|---|---|---|
| `snapZone` | `80` px | Within this distance of the end, the view counts as pinned to the end (follows streaming, snaps on downward idle) |
| `snapIdleMs` | `140` ms | Scroll must go quiet for this long while moving downward within `snapZone` before the snap fires |
| `farFromEnd` | `240` px | Further than this from the end shows the "Latest" jump pill |
| `resistance` | `0.4` | Over-scroll rubber-band factor (`visualPull = accumulatedDelta × 0.4`) |
| `latch` | `72` px | Visual pull at which the options panel latches open (`180px` raw delta) |
| `panelHeight` | `96` px | Height of the options panel revealed beneath the messages |
| `releaseIdleMs` | `160` ms | Idle timeout before an unlatched pull springs back to `0` |
| Spring | `springs.ui` `{ stiffness: 380, damping: 40, mass: 1 }` | Critically damped spring for snap and panel reveal; no overshoot |

### Rules

- **Do not hijack upward scrolling.** Only the bottom boundary is special.
- **Never trap**: reaching the page below the chat (if any) works by scrolling again after the panel is revealed or dismissed.
- **Keyboard / assistive access**: the options are also reachable via a visible "Options" button in the composer area and by `Tab`; the panel is a labelled region (`role="region" aria-label`) revealed with `aria-live="polite"` announcement ("N suggestions available"). The scroll gesture is a shortcut, never the only path.
- **Streaming**: when new messages stream in and the user is at the bottom, keep pinned; if the user has scrolled up, do not auto-scroll, and show the jump pill with an unread indicator.
- **RTL**: layout mirrors (user bubbles on the inline-end side); scroll axes unchanged.
- **Reduced motion**: no snap animation (jump instantly), reveal becomes an opacity fade; the over-scroll gesture still works but without rubber-band.

### Acceptance checks

- Scroll up through 200 messages: native feel, no jank, no snapping while moving up.
- Scroll back down: snaps once at the end; no fighting the user's momentum.
- Over-scroll reveals options; Esc and scroll-up dismiss; keyboard path exists.
- Streaming doesn't yank a user who is reading history.
