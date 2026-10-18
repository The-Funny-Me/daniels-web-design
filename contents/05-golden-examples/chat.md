> Agents: do not open this file unless `SKILL.md` routed you here. The operating rules are already in `SKILL.md`.

# Golden example: Chat screen

Goal: prove the scroll model. Native upward scrolling, a snap at the bottom, and a deliberate over-scroll that reveals options.

## Layout

Full-height app shell (`max-w-app` on wide screens, edge-to-edge on mobile). Header (glass, compact). Message list. **Glass composer** pinned bottom (the one glass layer in the viewport region, plus the transient reveal panel). Messages: assistant on `surface` with hairline; user on `surface-raised`; both `card`-ish radius (`md` 16 for bubbles); timestamps `text-tertiary`.

Seed content: ~200 messages (generated, bilingual) to make history-scrolling meaningful, plus a scripted streaming reply.

## Behavior (from `04-signature-moves/scroll-and-focus.md`)

1. Scrolling up: fully native; "Jump to latest" glass pill appears after one viewport of distance, with unread count.
2. Scrolling down: native until within 80px of the end, then a soft `ui` spring snap to rest.
3. Over-scroll at the bottom (72px accumulated, resistance 0.4): reveals the **options panel** (max 4 pill options, e.g. suggested replies and actions) sliding up beneath the last message.
4. Dismiss with scroll-up, `Esc`, or outside tap. Keyboard path: an "Options" button in the composer.
5. Streaming: pinned if the user is at the bottom; never yanks a user reading history.

## Composer

Auto-growing textarea (animated example placeholder cycling, 4–6 prompts, stops on focus), send button (pill, `brand-solid`), attachment icon (Phosphor thin). Direction follows content with `dir="auto"`.

## Accent usage

A **level-3 shiver** on the unread pill only when new messages arrive while the user is scrolled up (max 3 cycles). Otherwise level 0–1.

## Acceptance criteria

- [ ] No scroll jank across 200 messages; no snapping while moving up.
- [ ] Snap happens once and respects momentum; no overshoot.
- [ ] Options reachable without a scroll gesture (button + Tab), announced politely.
- [ ] Streaming doesn't steal scroll position.
- [ ] RTL: bubbles mirror, mixed Hebrew/English lines render correctly with `bdi`.
- [ ] Reduced motion: instant snap, fade reveal, no shiver.
- [ ] Zero grep hits for raw values; all packs.
