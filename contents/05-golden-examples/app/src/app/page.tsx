"use client";

import { ArrowUpRight, ChatCircleText, ChartLineUp, Door, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { BrandMark } from "@/components/patterns/brand-mark";
import { useT } from "@/components/patterns/design-provider";
import { Eyebrow } from "@/components/patterns/eyebrow";
import { Reveal } from "@/components/patterns/reveal";
import { RadialLight } from "@/components/patterns/accent";
import { GlowCard } from "@/components/ui/card";

export default function Home() {
  const { t } = useT();
  const items = [
    { href: "/landing", icon: Sparkle, title: t("homeLandTitle"), body: t("homeLandBody") },
    { href: "/auth", icon: Door, title: t("homeAuthTitle"), body: t("homeAuthBody") },
    { href: "/chat", icon: ChatCircleText, title: t("homeChatTitle"), body: t("homeChatBody") },
    { href: "/dashboard", icon: ChartLineUp, title: t("homeDashTitle"), body: t("homeDashBody") },
  ];
  return (
    <main id="main" className="relative isolate overflow-hidden">
      <RadialLight className="-top-24 start-1/2 -z-10 size-[48rem] -translate-x-1/2 rtl:translate-x-1/2" />
      <div className="mx-auto max-w-app px-(--ds-gutter) py-section-lg">
        <Reveal className="grid max-w-reading gap-6">
          <BrandMark draw className="size-12" />
          <Eyebrow>{t("homeEyebrow")}</Eyebrow>
          <h1 className="font-display text-display-lg leading-display tracking-display">{t("homeTitle")}</h1>
          <p className="text-lg text-ink-2">{t("homeLede")}</p>
        </Reveal>
        <ul className="mt-section-md grid gap-(--ds-grid-gap) sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal as="li" key={it.href} index={i + 2}>
              <Link href={it.href} className="group block rounded-card">
                <GlowCard className="grid h-full gap-4 p-8" shellClassName="lift h-full">
                  <it.icon aria-hidden size={28} weight="thin" className="text-brand-text" />
                  <div className="grid gap-2">
                    <h2 className="font-display text-3xl leading-heading">{it.title}</h2>
                    <p className="text-ink-2">{it.body}</p>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm text-brand-text">
                    {t("homeOpen")}
                    <ArrowUpRight aria-hidden size={16} weight="light" className="rtl:-scale-x-100" />
                  </span>
                </GlowCard>
              </Link>
            </Reveal>
          ))}
        </ul>
        <p className="mt-section-sm max-w-reading text-sm text-ink-2">{t("homeNote")}</p>
      </div>
    </main>
  );
}
