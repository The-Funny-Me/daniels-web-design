"use client";

import { ArrowDown, ArrowLeft, ArrowUpRight } from "@phosphor-icons/react";
import Lenis from "lenis";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccentBurst, RadialLight } from "@/components/patterns/accent";
import { BrandMark } from "@/components/patterns/brand-mark";
import { useDesign } from "@/components/patterns/design-provider";
import { Eyebrow } from "@/components/patterns/eyebrow";
import { GhostNumeral } from "@/components/patterns/ghost-numeral";
import { Reveal } from "@/components/patterns/reveal";
import { Button } from "@/components/ui/button";
import { Card, GlowCard } from "@/components/ui/card";
import { cn } from "@/lib/cn";

function ChapterVisualArrival() {
  return (
    <Card className="relative isolate aspect-[4/3] w-full overflow-hidden bg-surface-sunken p-8">
      <RadialLight className="-top-16 -end-16 size-64 opacity-70" />
      <svg
        viewBox="0 0 360 270"
        fill="none"
        aria-hidden
        className="size-full text-brand-ui"
      >
        <rect
          x="28"
          y="24"
          width="304"
          height="222"
          rx="18"
          stroke="var(--ds-border-strong)"
          strokeWidth="1"
        />
        <rect
          x="56"
          y="48"
          width="248"
          height="174"
          rx="12"
          stroke="var(--ds-border-hairline)"
          strokeWidth="1"
        />
        <path
          d="M116 222V112C116 76.6538 144.654 48 180 48C215.346 48 244 76.6538 244 112V222"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle
          cx="180"
          cy="116"
          r="24"
          stroke="var(--ds-secondary-ui)"
          strokeWidth="1"
        />
        <line
          x1="84"
          y1="190"
          x2="276"
          y2="190"
          stroke="var(--ds-border-hairline)"
          strokeWidth="1"
        />
      </svg>
    </Card>
  );
}

function ChapterVisualLight() {
  return (
    <Card className="relative isolate aspect-[4/3] w-full overflow-hidden bg-surface-sunken p-8">
      <RadialLight breathe className="inset-0 m-auto size-72" />
      <svg
        viewBox="0 0 360 270"
        fill="none"
        aria-hidden
        className="size-full text-brand-ui"
      >
        <circle
          cx="180"
          cy="135"
          r="92"
          stroke="var(--ds-border-hairline)"
          strokeWidth="1"
        />
        <circle
          cx="180"
          cy="135"
          r="64"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle
          cx="180"
          cy="135"
          r="32"
          stroke="var(--ds-secondary-ui)"
          strokeWidth="1.25"
        />
        <line
          x1="44"
          y1="135"
          x2="316"
          y2="135"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="180" cy="135" r="4" fill="currentColor" />
      </svg>
    </Card>
  );
}

function ChapterVisualRest() {
  return (
    <Card className="relative isolate aspect-[4/3] w-full overflow-hidden bg-surface-sunken p-8">
      <RadialLight className="-bottom-16 start-1/2 size-72 -translate-x-1/2 rtl:translate-x-1/2 opacity-75" />
      <svg
        viewBox="0 0 360 270"
        fill="none"
        aria-hidden
        className="size-full text-brand-ui"
      >
        <path
          d="M36 92C108 76 252 76 324 92"
          stroke="var(--ds-border-strong)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M36 132C116 112 244 112 324 132"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M36 172C124 152 236 152 324 172"
          stroke="var(--ds-secondary-ui)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M60 208H300"
          stroke="var(--ds-border-hairline)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </Card>
  );
}

export default function LandingPage() {
  const { t, motionOk } = useDesign();
  const lenisRef = useRef<Lenis | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [activeChapter, setActiveChapter] = useState<string>("suites");

  // Lenis smooth scroll on the landing page only, disabled when reduced motion is active.
  useEffect(() => {
    if (!motionOk) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    let rafId = 0;
    const step = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [motionOk]);

  // Fire the single level-4 hero AccentBurst once after initial reveal.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setBurstTrigger(1);
    }, 320);
    return () => window.clearTimeout(id);
  }, []);

  // Track which chapter is in focus during scroll to highlight the active focus chapter.
  useEffect(() => {
    const ids = ["suites", "table", "stay"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -35% 0px", threshold: 0.15 },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef.current && motionOk) {
      lenisRef.current.scrollTo(target, { offset: -96 });
    } else {
      target.scrollIntoView({ behavior: motionOk ? "smooth" : "auto" });
    }
  };

  const chapters = [
    {
      id: "suites",
      numeral: "02",
      label: t("landC1Label"),
      title: t("landC1Title"),
      body: t("landC1Body"),
      align: "start" as const,
      visual: <ChapterVisualArrival />,
    },
    {
      id: "table",
      numeral: "03",
      label: t("landC2Label"),
      title: t("landC2Title"),
      body: t("landC2Body"),
      align: "end" as const,
      visual: <ChapterVisualLight />,
    },
    {
      id: "stay",
      numeral: "04",
      label: t("landC3Label"),
      title: t("landC3Title"),
      body: t("landC3Body"),
      align: "start" as const,
      visual: <ChapterVisualRest />,
    },
  ];

  const facts = [
    { value: "24 / 7", label: t("landFact1") },
    { value: "18", label: t("landFact2") },
    { value: "3 : 1", label: t("landFact3") },
    { value: "28 dB", label: t("landFact4") },
  ];

  return (
    <div id="top" className="relative isolate overflow-x-clip">
      <RadialLight
        breathe
        className="-top-32 start-1/2 -z-10 size-[48rem] -translate-x-1/2 rtl:translate-x-1/2"
      />

      {/* Sticky glass navigation pill (single glass layer) */}
      <header className="sticky top-4 z-(--ds-z-sticky) mx-auto max-w-marketing px-(--ds-gutter)">
        <nav
          aria-label="Primary"
          className="glass flex items-center justify-between gap-3 rounded-pill px-4 py-2 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-touch items-center gap-2 rounded-pill px-2 text-sm text-ink-2 hover:text-ink"
              aria-label={t("examples")}
            >
              <ArrowLeft aria-hidden size={16} weight="light" className="rtl:-scale-x-100" />
              <BrandMark className="size-6" />
              <span className="font-display text-lg text-ink">{t("brand")}</span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection("suites")}
              className="inline-flex min-h-touch items-center rounded-pill px-4 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              {t("landNavSuites")}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("table")}
              className="inline-flex min-h-touch items-center rounded-pill px-4 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              {t("landNavTable")}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("stay")}
              className="inline-flex min-h-touch items-center rounded-pill px-4 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              {t("landNavStay")}
            </button>
          </div>

          <Button size="sm" glint onClick={() => scrollToSection("closing")}>
            {t("landReserve")}
          </Button>
        </nav>
      </header>

      <main id="main">
        {/* Hero (section-xl) */}
        <section className="relative mx-auto max-w-marketing px-(--ds-gutter) py-section-xl">
          <GhostNumeral value="01" className="end-4 top-8 sm:end-8 sm:top-12" />
          <div className="relative grid max-w-reading gap-6">
            <Reveal index={0}>
              <BrandMark draw className="size-12" />
            </Reveal>
            <Reveal index={1}>
              <Eyebrow>{t("landEyebrow")}</Eyebrow>
            </Reveal>
            <Reveal as="h1" index={2} className="font-display text-display-lg leading-display tracking-display text-ink">
              {t("landTitle")}
            </Reveal>
            <Reveal as="p" index={3} className="max-w-reading text-lg text-ink-2">
              {t("landLede")}
            </Reveal>
            <Reveal index={4} className="mt-2 flex flex-wrap items-center gap-4">
              {/* Level-4 accent moment: one particle burst on the primary CTA's first reveal */}
              <div className="relative inline-flex">
                <AccentBurst trigger={burstTrigger} />
                <Button
                  size="lg"
                  glint
                  data-glint="once"
                  onClick={() => scrollToSection("suites")}
                >
                  {t("landCta1")}
                  <ArrowUpRight aria-hidden size={18} weight="light" className="rtl:-scale-x-100" />
                </Button>
              </div>
              <Button
                variant="quiet"
                size="lg"
                onClick={() => scrollToSection("closing")}
              >
                {t("landCta2")}
              </Button>
            </Reveal>

            <Reveal index={5} className="mt-8">
              <button
                type="button"
                onClick={() => scrollToSection("suites")}
                className="inline-flex min-h-touch items-center gap-2 text-xs text-ink-3 transition-colors hover:text-ink-2"
              >
                <span className="ds-label">{t("landScroll")}</span>
                <ArrowDown aria-hidden size={14} weight="light" />
              </button>
            </Reveal>
          </div>

          <hr
            data-shimmer="true"
            className="hairline-metal mt-section-lg w-full"
          />
        </section>

        {/* Three chapters (section-lg) */}
        {chapters.map((chapter) => {
          const isFocused = activeChapter === chapter.id;
          return (
            <section
              key={chapter.id}
              id={chapter.id}
              className="relative mx-auto max-w-marketing px-(--ds-gutter) py-section-lg"
            >
              <GhostNumeral
                value={chapter.numeral}
                className={cn(
                  "top-6",
                  chapter.align === "start" ? "end-4 sm:end-8" : "start-4 sm:start-8",
                )}
              />

              <div
                className={cn(
                  "relative grid items-center gap-(--ds-grid-gap) rounded-sheet border p-6 transition-colors duration-(--ds-duration-slow) sm:p-12 lg:grid-cols-12",
                  isFocused
                    ? "border-hairline-strong bg-surface/60"
                    : "border-transparent bg-transparent",
                )}
              >
                <Reveal
                  inView
                  index={0}
                  className={cn(
                    "grid gap-4 lg:col-span-6",
                    chapter.align === "end" && "lg:order-2 lg:col-start-7",
                  )}
                >
                  <Eyebrow>{chapter.label}</Eyebrow>
                  <h2 className="font-display text-4xl leading-heading text-ink">
                    {chapter.title}
                  </h2>
                  <p className="max-w-reading text-lg text-ink-2">
                    {chapter.body}
                  </p>
                </Reveal>

                <Reveal
                  inView
                  index={2}
                  className={cn(
                    "min-w-0 lg:col-span-5",
                    chapter.align === "start"
                      ? "lg:col-start-8"
                      : "lg:order-1 lg:col-start-1",
                  )}
                >
                  {chapter.visual}
                </Reveal>
              </div>
            </section>
          );
        })}

        {/* Detail row (section-md): four fact cards */}
        <section className="mx-auto max-w-marketing px-(--ds-gutter) py-section-md">
          <div className="grid gap-(--ds-grid-gap) sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact, idx) => (
              <Reveal key={fact.label} inView index={idx}>
                <GlowCard className="grid gap-3 p-6" shellClassName="h-full">
                  <Eyebrow>{fact.label}</Eyebrow>
                  <p className="font-sans text-3xl font-semibold tabular-nums tracking-tight text-ink">
                    <bdi>{fact.value}</bdi>
                  </p>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Statement quote (section-md): under two lines, centered, no invented attribution */}
        <section className="mx-auto max-w-marketing px-(--ds-gutter) py-section-md">
          <Reveal inView className="mx-auto max-w-reading text-center">
            <blockquote className="font-display text-3xl leading-heading text-ink sm:text-4xl">
              &ldquo;{t("landQuote")}&rdquo;
            </blockquote>
          </Reveal>
        </section>

        {/* Closing CTA (section-lg): single action on surface-sunken with level-2 radial light */}
        <section
          id="closing"
          className="mx-auto max-w-marketing px-(--ds-gutter) py-section-lg"
        >
          <Reveal inView>
            <div className="relative isolate overflow-hidden rounded-sheet border border-hairline bg-surface-sunken px-6 py-section-md text-center sm:px-12">
              <RadialLight
                breathe
                className="inset-0 -z-10 m-auto size-[36rem]"
              />
              <div className="mx-auto grid max-w-reading justify-items-center gap-6">
                <BrandMark className="size-8" />
                <h2 className="font-display text-4xl leading-heading text-ink sm:text-display-lg">
                  {t("landCloseTitle")}
                </h2>
                <p className="max-w-reading text-lg text-ink-2">
                  {t("landCloseBody")}
                </p>
                <Button asChild size="lg" glint className="mt-2">
                  <Link href="/auth">
                    {t("landReserve")}
                    <ArrowUpRight aria-hidden size={18} weight="light" className="rtl:-scale-x-100" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-marketing flex-wrap items-center justify-between gap-4 px-(--ds-gutter) py-8 text-sm text-ink-2">
          <p>{t("landFooter")}</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToSection("suites")}
              className="ds-label transition-colors hover:text-ink"
            >
              {t("landFooterA")}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("table")}
              className="ds-label transition-colors hover:text-ink"
            >
              {t("landFooterB")}
            </button>
            <Link href="/chat" className="ds-label transition-colors hover:text-ink">
              {t("landFooterC")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
