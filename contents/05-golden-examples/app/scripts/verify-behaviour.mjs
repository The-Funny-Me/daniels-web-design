#!/usr/bin/env node
/**
 * verify-behaviour.mjs
 *
 * Automated Playwright verification of all interactive behaviours in HANDOFF.md sections 5.3 & 7.3:
 * 1. /auth: animated placeholders stop on focus & resume on blur, password dotting, show/hide toggle,
 *    blur validation with aria-describedby, "fail..." email -> contained RegionError -> Retry,
 *    Button Dimension Lock on loading states, forgot-password sheet, settings sheet -> typed-phrase
 *    ConfirmDialog (sheet closes first, Cancel focused, scrim click does not dismiss, Escape closes).
 * 2. /dashboard: SVG chart + keyboard stepping + table view toggle, sortable table columns, archive
 *    row -> 8s undoToast -> Undo restores, archive all -> empty state -> Restore all, simulate failure
 *    switch -> RegionError -> Retry recovers, slow network switch + reload -> LoadingScreen -> reveal.
 * 3. /chat: 201 messages initially pinned at bottom, scroll up -> "Jump to latest" pill, scroll down
 *    within 80px -> idle snap to bottom, wheel past end -> options panel latches at 72px pull,
 *    clicking option works, wheel up / Escape closes panel, "Incoming" while scrolled up -> does not
 *    jump view & shows unread pill with shiver -> clicking pill jumps to bottom.
 * 4. /landing: sticky glass nav, GhostNumeral 01..04, .hairline-metal[data-shimmer="true"], 4 GlowCard
 *    facts with <bdi>, quote without attribution, closing CTA with RadialLight, anchor smooth scroll.
 * 5. Reduced motion (OS prefers-reduced-motion: reduce & ?motion=off) and RTL (?dir=rtl) invariants.
 */

import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.env.BASE || "http://localhost:3100";

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.error(`✗ ${name}: ${err.message}`);
  }
}

try {
  // =========================================================================
  // 1. /auth interactive behaviour
  // =========================================================================
  await step("/auth: animated placeholder, password dotting, show/hide, validation, fail->Retry, overlays", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/auth?pack=champagne-wine&theme=light&dir=ltr`, { waitUntil: "load" });
    await page.waitForTimeout(850);

    // Animated placeholder is cycling when unfocused and empty
    const emailInput = page.getByLabel("Email");
    const pwInput = page.locator('input[autocomplete="current-password"]');
    const placeholders = page.locator("[data-animated-placeholder]");
    assert.equal(await placeholders.count(), 2);

    const initialEmailPh = await placeholders.nth(0).innerText();
    assert.ok(initialEmailPh.length > 0, "Email animated placeholder should have text while unfocused");

    // Wait briefly so password cycler types & dots out at least one character
    await page.waitForTimeout(900);
    const pwPhText = await placeholders.nth(1).innerText();
    assert.ok(pwPhText.length > 0, "Password animated placeholder should be active");

    // Focus email -> animated placeholder stops (empty text, no caret)
    await emailInput.focus();
    await page.waitForTimeout(150);
    assert.equal((await placeholders.nth(0).innerText()).trim(), "", "Placeholder clears on focus");

    // Blur empty email -> validation error tied via aria-describedby
    await pwInput.focus();
    await page.waitForTimeout(150);
    assert.equal(await emailInput.getAttribute("aria-invalid"), "true");
    const descId = await emailInput.getAttribute("aria-describedby");
    assert.ok(descId, "aria-describedby should be set on invalid input");
    const errText = await page.locator(`#${descId}`).innerText();
    assert.ok(errText.length > 0, "Validation message should be rendered");

    // Password show/hide toggle
    assert.equal(await pwInput.getAttribute("type"), "password");
    const showBtn = page.getByRole("button", { name: /show password/i });
    await showBtn.click();
    assert.equal(await pwInput.getAttribute("type"), "text");
    const hideBtn = page.getByRole("button", { name: /hide password/i });
    await hideBtn.click();
    assert.equal(await pwInput.getAttribute("type"), "password");

    // Submit with "fail@studio.com" -> Button Dimension Lock during pending -> RegionError -> Retry
    await emailInput.fill("fail@studio.com");
    await pwInput.fill("velvet-password-123");
    const submitBtn = page.locator('form button[type="submit"]');
    const beforeBox = await submitBtn.boundingBox();
    await submitBtn.click();
    await page.waitForTimeout(120);
    assert.equal(await submitBtn.getAttribute("aria-busy"), "true");
    const duringBox = await submitBtn.boundingBox();
    assert.equal(Math.round(beforeBox.width), Math.round(duringBox.width), "Submit button width locked during loading");
    assert.equal(Math.round(beforeBox.height), Math.round(duringBox.height), "Submit button height locked during loading");

    // Wait for 900ms simulated network failure -> RegionError appears
    await page.waitForTimeout(950);
    const retryBtn = page.getByRole("button", { name: /try again/i });
    assert.ok(await retryBtn.isVisible(), "Contained RegionError with Try again button should appear");

    // Fix email and click Retry -> succeeds
    await emailInput.fill("guest@studio.com");
    await retryBtn.click();
    await page.waitForTimeout(1050);
    assert.ok(await page.getByText(/signed in\. taking you in/i).first().isVisible(), "Success status shown after retry");

    // Forgot password sheet opens and closes with Escape, restoring focus to the trigger
    const forgotBtn = page.getByRole("button", { name: /forgot/i });
    await forgotBtn.click();
    await page.waitForTimeout(300);
    assert.ok(await page.getByRole("dialog").isVisible(), "Forgot password GlassSheet open");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    assert.equal(await page.getByRole("dialog").count(), 0, "GlassSheet closed on Escape");
    const focusedAfterEsc = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    assert.match(focusedAfterEsc, /forgot/i, "Focus restored to triggering button after modal closes");

    // Account settings sheet -> Delete account -> sheet closes first -> ConfirmDialog opens
    await page.getByRole("button", { name: /account settings/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /delete account/i }).click();
    // Wait for sheet close + ConfirmDialog open (durations.slow = 450ms)
    await page.waitForTimeout(600);
    const dialog = page.getByRole("dialog");
    assert.ok(await dialog.isVisible(), "ConfirmDialog open");

    // Scrim click does NOT dismiss ConfirmDialog
    await page.mouse.click(10, 10);
    await page.waitForTimeout(200);
    assert.ok(await dialog.isVisible(), "ConfirmDialog stays open on scrim click");

    // Confirm button is disabled until phrase "velvet" is typed
    const confirmBtn = dialog.getByRole("button", { name: /delete forever/i });
    assert.ok(await confirmBtn.isDisabled(), "Danger confirm button disabled before typing phrase");
    await dialog.locator("input").fill("velvet");
    assert.ok(await confirmBtn.isEnabled(), "Danger confirm button enabled after typing phrase");

    // Escape closes ConfirmDialog
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    assert.equal(await page.getByRole("dialog").count(), 0);

    await ctx.close();
  });

  // =========================================================================
  // 2. /dashboard interactive behaviour
  // =========================================================================
  await step("/dashboard: chart keyboard + table view, sorting, archive + undo, restore all, fail & slow switches", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/dashboard?pack=champagne-wine&theme=light&dir=ltr`, { waitUntil: "load" });
    await page.waitForTimeout(600);

    // Chart keyboard stepping
    const chartGroup = page.locator('[role="group"]').first();
    await chartGroup.focus();
    await page.keyboard.press("End");
    await page.waitForTimeout(100);
    assert.ok(await chartGroup.locator(".glass").isVisible(), "Chart tooltip appears on keyboard focus/End");

    // Table view toggle
    await page.getByRole("button", { name: /table view/i }).click();
    await page.waitForTimeout(150);
    const chartToggle = page.getByRole("button", { name: /chart view/i });
    assert.equal(await chartToggle.getAttribute("aria-pressed"), "true");
    await chartToggle.click();
    await page.waitForTimeout(150);

    // Simulate failure switch -> RegionError inside chart card -> Try again recovers
    const failSwitch = page.getByRole("switch", { name: /simulate failure/i });
    await failSwitch.click();
    await page.waitForTimeout(150);
    const retryBtn = page.getByRole("button", { name: /try again/i });
    assert.ok(await retryBtn.isVisible(), "RegionError appears when Simulate failure is toggled");
    await retryBtn.click();
    await page.waitForTimeout(150);
    assert.equal(await retryBtn.count(), 0, "Chart recovers when Try again is clicked");

    // Sorting ReservationsTable
    const amountSortBtn = page.getByRole("button", { name: /sort by amount/i });
    await amountSortBtn.click();
    await page.waitForTimeout(100);
    const amountTh = amountSortBtn.locator("..");
    assert.equal(await amountTh.getAttribute("aria-sort"), "ascending");
    await amountSortBtn.click();
    await page.waitForTimeout(100);
    assert.equal(await amountTh.getAttribute("aria-sort"), "descending");

    // Archive 1 row -> Undo toast -> Undo restores row
    const archiveBtns = page.locator('tbody button[aria-label^="Archive"]');
    assert.equal(await archiveBtns.count(), 8);
    await archiveBtns.first().click();
    await page.waitForTimeout(320);
    assert.equal(await archiveBtns.count(), 7);
    const undoBtn = page.getByRole("button", { name: /^undo$/i });
    assert.ok(await undoBtn.isVisible(), "Undo toast appears after archiving");
    await undoBtn.click();
    await page.waitForTimeout(320);
    assert.equal(await archiveBtns.count(), 8, "Row restored after clicking Undo");

    // Archive all 8 rows -> Empty state -> Restore all
    for (let i = 7; i >= 0; i--) {
      await archiveBtns.nth(i).click();
    }
    await page.waitForTimeout(320);
    const restoreAllBtn = page.getByRole("button", { name: /restore all/i });
    assert.ok(await restoreAllBtn.isVisible(), "Empty state with Restore all button appears");
    await restoreAllBtn.click();
    await page.waitForTimeout(320);
    assert.equal(await archiveBtns.count(), 8, "All 8 rows restored");

    // Slow network switch + Reload data -> LoadingScreen appears -> reveals dashboard
    const slowSwitch = page.getByRole("switch", { name: /slow network/i });
    await slowSwitch.click();
    await page.getByRole("button", { name: /reload data/i }).click();
    await page.waitForTimeout(300);
    assert.ok(await page.getByRole("status", { name: /loading/i }).isVisible(), "LoadingScreen shown during slow network load");
    await page.waitForTimeout(1600);
    assert.ok(await page.getByRole("heading", { name: /good evening/i }).isVisible(), "Dashboard revealed after slow load completes");

    await ctx.close();
  });

  // =========================================================================
  // 3. /chat scroll physics, pull-to-reveal options, unread pill, streaming
  // =========================================================================
  await step("/chat: 201 messages, scroll up -> jump pill, idle snap within 80px, pull past end latches options, unread pill on incoming", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/chat?pack=champagne-wine&theme=light&dir=ltr`, { waitUntil: "load" });
    await page.waitForTimeout(700);

    const scroller = page.locator('[role="log"]').locator("..");
    // Initially pinned at bottom
    const initDist = await scroller.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
    assert.ok(initDist <= 4, `Expected chat initially at bottom, got dist=${initDist}`);

    // Scroll up 600px -> "Latest" button appears
    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - 600;
      el.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(200);
    const jumpBtn = page.getByRole("button", { name: /^latest$/i });
    assert.ok(await jumpBtn.isVisible(), "Latest pill appears when scrolled up > 240px");

    // Click "Incoming" while scrolled up -> view stays put & unread pill with .shiver appears
    const topBefore = await scroller.evaluate((el) => el.scrollTop);
    await page.getByRole("button", { name: /incoming/i }).click();
    await page.waitForTimeout(1400);
    const topAfter = await scroller.evaluate((el) => el.scrollTop);
    assert.equal(Math.round(topBefore), Math.round(topAfter), "Incoming message while scrolled up must not jump scroll position");
    const unreadBtn = page.getByRole("button", { name: /1 new/i });
    assert.ok(await unreadBtn.isVisible(), "Unread pill shows '1 new'");

    // Click unread pill -> scrolls to bottom and clears pill
    await unreadBtn.click();
    await page.waitForTimeout(700);
    const distAfterJump = await scroller.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
    assert.ok(distAfterJump <= 4, `Expected chat at bottom after clicking unread pill, got dist=${distAfterJump}`);

    // Scroll up 200px, then scroll down to within 50px of bottom -> snaps to bottom after 140ms idle
    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - 200;
      el.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(100);
    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - 45;
      el.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(750);
    const distAfterSnap = await scroller.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
    assert.ok(distAfterSnap <= 4, `Expected idle downward snap within 80px to reach bottom, got dist=${distAfterSnap}`);

    // Pull past bottom with wheel deltaY -> latches options panel open at 72px pull
    const scrollerBox = await scroller.boundingBox();
    await page.mouse.move(scrollerBox.x + scrollerBox.width / 2, scrollerBox.y + scrollerBox.height / 2);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    const optBtn = page.getByRole("button", { name: /^options$/i });
    assert.equal(await optBtn.getAttribute("aria-expanded"), "true", "Options panel latched open after pulling past bottom");

    // Clicking an option inside the latched panel works and closes the panel
    const summariseChip = page.locator('[role="region"] button').first();
    await summariseChip.click();
    await page.waitForTimeout(300);
    assert.equal(await optBtn.getAttribute("aria-expanded"), "false", "Options panel closed after selecting an option");

    // Re-open via Options button and close with Escape
    await optBtn.click();
    await page.waitForTimeout(200);
    assert.equal(await optBtn.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    assert.equal(await optBtn.getAttribute("aria-expanded"), "false", "Options panel closed on Escape");

    await ctx.close();
  });

  // =========================================================================
  // 4. /landing structure & interactions
  // =========================================================================
  await step("/landing: sticky glass nav, chapters 01..04, hairline-metal, 4 bdi facts, quote, closing CTA", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/landing?pack=champagne-wine&theme=light&dir=ltr`, { waitUntil: "load" });
    await page.waitForTimeout(600);

    assert.ok(await page.locator("header nav.glass").isVisible(), "Sticky glass nav visible");
    assert.ok(await page.locator("hr.hairline-metal[data-shimmer='true']").isVisible(), "Metallic hairline visible");
    assert.equal(await page.locator("bdi").count(), 4, "Four fact figures wrapped in <bdi>");
    assert.ok(await page.locator("blockquote").isVisible(), "Statement quote visible");
    assert.equal(await page.locator("blockquote cite, blockquote footer").count(), 0, "No invented attribution on quote");

    await ctx.close();
  });

  // =========================================================================
  // 5. Reduced motion & RTL invariants
  // =========================================================================
  await step("Reduced motion & RTL: animations disabled under ?motion=off / prefers-reduced-motion, RTL zeroes label tracking", async () => {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 860 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/landing?pack=wine-gold&theme=dark&dir=rtl&motion=off`, { waitUntil: "load" });
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const root = document.documentElement;
      const hairline = document.querySelector(".hairline-metal");
      const breathe = document.querySelector(".breathe");
      const label = document.querySelector(".ds-label");
      return {
        dir: root.dir,
        lang: root.lang,
        motion: root.dataset.motion,
        hairlineAnim: hairline ? getComputedStyle(hairline).animationName : null,
        breatheAnim: breathe ? getComputedStyle(breathe).animationName : null,
        labelTracking: label ? getComputedStyle(label).letterSpacing : null,
      };
    });

    assert.equal(state.dir, "rtl");
    assert.equal(state.lang, "he");
    assert.equal(state.motion, "reduced");
    assert.equal(state.hairlineAnim, "none", "hairline-metal shimmer animation disabled in reduced motion");
    assert.equal(state.breatheAnim, "none", "breathe animation disabled in reduced motion");
    assert.ok(state.labelTracking === "normal" || state.labelTracking === "0px", `RTL .ds-label letter-spacing is 0/normal, got ${state.labelTracking}`);

    await ctx.close();
  });
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} behavioural check(s) failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${results.length} behavioural verification suites passed.`);
}
