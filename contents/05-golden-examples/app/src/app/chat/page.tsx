"use client";

import { ArrowDown, PaperPlaneRight, SlidersHorizontal, Tray } from "@phosphor-icons/react";
import { motion, useTransform } from "motion/react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { RadialLight } from "@/components/patterns/accent";
import { AnimatedInput } from "@/components/patterns/animated-input";
import { BrandMark } from "@/components/patterns/brand-mark";
import { useDesign } from "@/components/patterns/design-provider";
import { Eyebrow } from "@/components/patterns/eyebrow";
import { Bubble, type Msg } from "@/components/chat/bubble";
import { Button } from "@/components/ui/button";
import { scrollSpec, useChatScroll } from "@/hooks/use-chat-scroll";
import { cn } from "@/lib/cn";
import { fade } from "@/lib/motion";

const HISTORY = 201;
const SEPARATORS = [0, 50, 100, 150];
type Item = Msg | { id: string; sep: string };

type StickMode = "none" | "instant" | "smooth";

export default function ChatPage() {
  const { t, tl, lang, locale, motionOk, ready } = useDesign();
  const chat = useChatScroll(motionOk);
  const { scrollerRef, pull } = chat;
  const [local, setLocal] = useState<Msg[]>([]);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const stick = useRef<StickMode>("none");
  const timers = useRef<Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>>>([]);
  const inputId = useId();
  const panelId = useId();

  // ~200 generated messages, alternating, rebuilt per language.
  // Separator dates are computed only after client mount (`ready`) so SSR and hydration always match.
  const history = useMemo<Item[]>(() => {
    const a = tl("chatAssistantLines");
    const u = tl("chatUserLines");
    const day = ready ? new Intl.DateTimeFormat(locale, { weekday: "long", month: "short", day: "numeric" }) : null;
    const items: Item[] = [];
    for (let i = 0; i < HISTORY; i++) {
      const sepAt = SEPARATORS.indexOf(i);
      if (sepAt >= 0) {
        let sep = "\u00A0";
        if (day) {
          const d = new Date();
          d.setDate(d.getDate() - (SEPARATORS.length - sepAt) * 2);
          sep = day.format(d);
        }
        items.push({ id: `sep${i}`, sep });
      }
      const assistant = i % 2 === 0;
      const n = Math.floor(i / 2);
      items.push({ id: `h${i}`, role: assistant ? "assistant" : "user", text: (assistant ? a[(n * 3) % a.length] : u[(n * 5) % u.length]) ?? "" });
    }
    return items;
  }, [tl, locale, ready]);

  // start at the newest message
  useLayoutEffect(() => {
    chat.scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // keep the view where the sender expects after content changes
  useLayoutEffect(() => {
    if (stick.current === "none") return;
    chat.scrollToBottom(stick.current === "smooth");
    stick.current = "none";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  useEffect(() => {
    if (chat.atEnd) setUnread(0);
  }, [chat.atEnd]);

  useEffect(() => {
    if (!chat.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") chat.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chat]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => (clearTimeout(id as never), clearInterval(id as never)));
  }, []);

  const append = (msg: Msg, mode: StickMode) => {
    stick.current = mode;
    setLocal((l) => [...l, { ...msg, fresh: true }]);
  };

  const streamReply = (full: string) => {
    const id = `a${Date.now()}`;
    timers.current.push(
      setTimeout(() => {
        const pinned = chat.isPinned();
        if (!pinned) setUnread((n) => n + 1);
        if (!motionOk) {
          append({ id, role: "assistant", text: full }, pinned ? "instant" : "none");
          return;
        }
        append({ id, role: "assistant", text: "", streaming: true }, pinned ? "instant" : "none");
        const chars = Array.from(full);
        let i = 0;
        const tick = setInterval(() => {
          i += 1;
          const done = i >= chars.length;
          const pinnedNow = chat.isPinned();
          stick.current = pinnedNow ? "instant" : "none";
          setLocal((l) => l.map((m) => (m.id === id ? { ...m, text: chars.slice(0, i).join(""), streaming: !done } : m)));
          if (done) clearInterval(tick);
        }, 24);
        timers.current.push(tick);
      }, 600),
    );
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    chat.setOpen(false);
    append({ id: `u${Date.now()}`, role: "user", text }, "smooth");
    setDraft("");
    streamReply(t("chatReply"));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const incoming = () => {
    timers.current.push(
      setTimeout(() => {
        const pinned = chat.isPinned();
        if (!pinned) setUnread((n) => n + 1);
        append({ id: `i${Date.now()}`, role: "assistant", text: t("chatIncomingMsg") }, pinned ? "smooth" : "none");
      }, 1200),
    );
  };

  const options = [t("chatOpt1"), t("chatOpt2"), t("chatOpt3"), t("chatOpt4")];
  const y = useTransform(pull, (v) => -v);
  const panelOpacity = useTransform(pull, [0, scrollSpec.panelHeight * 0.6], [0, 1]);

  const showUnread = unread > 0 && !chat.atEnd;
  const showJump = !showUnread && chat.farFromEnd;

  return (
    <div className="relative isolate flex h-dvh flex-col overflow-hidden">
      <RadialLight className="-top-24 start-1/2 -z-10 size-[44rem] -translate-x-1/2 rtl:translate-x-1/2" />

      <header className="glass z-(--ds-z-nav) rounded-none border-0 border-b shadow-none">
        <div className="mx-auto flex w-full max-w-reading items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3">
            <BrandMark className="size-8" />
            <div className="grid">
              <h1 className="font-display text-xl leading-heading">{t("chatTitle")}</h1>
              <p className="flex items-center gap-2 text-sm text-ink-2">
                <span aria-hidden className="block size-2 rounded-pill bg-success" />
                {t("chatOnline")}
              </p>
            </div>
          </div>
          <Button variant="quiet" size="sm" onClick={incoming}>
            <Tray aria-hidden size={16} weight="light" />
            {t("chatIncoming")}
          </Button>
        </div>
      </header>

      <main id="main" className="relative mx-auto min-h-0 w-full max-w-reading flex-1">
        {/* options live beneath the messages; pulling past the end slides the messages up to reveal them */}
        <motion.div
          id={panelId}
          role="region"
          aria-label={t("chatOptionsTitle")}
          aria-hidden={!chat.open}
          inert={!chat.open}
          style={{ opacity: motionOk ? panelOpacity : chat.open ? 1 : 0, blockSize: scrollSpec.panelHeight }}
          transition={fade}
          className={cn(
            " absolute inset-x-0 bottom-0 z-(--ds-z-sticky) grid content-center gap-2 px-4",
            !chat.open && "pointer-events-none",
          )}
        >
          <Eyebrow>{t("chatOptionsTitle")}</Eyebrow>
          <ul className="flex flex-wrap gap-2">
            {options.map((o) => (
              <li key={o}>
                <Button variant="quiet" size="sm" onClick={() => send(o)}>
                  {o}
                </Button>
              </li>
            ))}
          </ul>
        </motion.div>

        <div
          ref={scrollerRef}
          {...chat.handlers}
          onClick={() => {
            if (chat.open) chat.setOpen(false);
          }}
          tabIndex={-1}
          className="absolute inset-0 overflow-y-auto overscroll-contain"
          style={{ overflowAnchor: "none" }}
        >
          <motion.ol
            role="log"
            aria-relevant="additions"
            aria-label={t("chatTitle")}
            style={{ y: motionOk ? y : 0 }}
            className={cn("grid gap-3 px-4 pt-4", !motionOk && chat.open ? "pb-28" : "pb-6")}
          >
            {[...history, ...local].map((it) =>
              "sep" in it ? (
                <li key={it.id} className="py-3 text-center">
                  <Eyebrow>{it.sep}</Eyebrow>
                </li>
              ) : (
                <Bubble key={it.id} msg={it} writing={t("chatStreaming")} />
              ),
            )}
          </motion.ol>
        </div>

        {(showUnread || showJump) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-(--ds-z-sticky) grid justify-items-center">
            <div className="pointer-events-auto relative">
              {showUnread && <RadialLight className="-inset-8 -z-10 opacity-80" />}
              <button
                key={showUnread ? unread : "jump"}
                type="button"
                onClick={() => {
                  chat.scrollToBottom(true);
                  setUnread(0);
                }}
                className={cn("glass lift inline-flex min-h-touch items-center gap-2 rounded-pill px-6 text-sm text-ink", showUnread && "shiver")}
                data-anim={showUnread ? "" : undefined}
              >
                <ArrowDown aria-hidden size={16} weight="light" />
                {showUnread ? t("chatUnread", { n: unread }) : t("chatJump")}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="glass z-(--ds-z-nav) rounded-none border-0 border-t shadow-none">
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-reading items-center gap-2 px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("chatOptions")}
            aria-expanded={chat.open}
            aria-controls={panelId}
            onClick={() => chat.setOpen(!chat.open)}
          >
            <SlidersHorizontal aria-hidden size={20} weight="light" />
          </Button>
          <label htmlFor={inputId} className="sr-only">
            {t("chatMessage")}
          </label>
          <div className="min-w-0 flex-1">
            <AnimatedInput id={inputId} examples={tl("chatPrompts")} value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" />
          </div>
          <Button type="submit" size="icon" aria-label={t("chatSend")} disabled={draft.trim() === ""}>
            <PaperPlaneRight aria-hidden size={20} weight="light" className="rtl:-scale-x-100" />
          </Button>
        </form>
        <p className="mx-auto max-w-reading px-4 pb-2 text-center text-sm text-ink-2">{t("chatHint")}</p>
        <p aria-live="polite" className="sr-only">
          {chat.open ? t("chatOptionsAnnounce", { n: options.length }) : ""}
        </p>
      </footer>
    </div>
  );
}
