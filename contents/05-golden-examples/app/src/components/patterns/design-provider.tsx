"use client";

import { IconContext } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import packs from "@/design/packs.json";
import { makeT, localeFor, type Lang, type TFunction, type TListFunction } from "@/lib/i18n";

export type Theme = "light" | "dark" | "system";
export type Dir = "ltr" | "rtl";
export type MotionPref = "on" | "off";

export interface PackInfo {
  id: string;
  name: string;
  isDefault: boolean;
  swatch: { canvas: string; accent: string; secondary: string; night: string };
}
export const PACKS = packs as ReadonlyArray<PackInfo>;
export const DEFAULT_PACK = PACKS.find((p) => p.isDefault)?.id ?? "champagne-wine";

interface DesignState {
  pack: string;
  theme: Theme;
  dir: Dir;
  motion: MotionPref;
}

const DEFAULTS: DesignState = { pack: DEFAULT_PACK, theme: "system", dir: "ltr", motion: "on" };
const STORAGE_KEY = "ds-design";

interface DesignContextValue extends DesignState {
  lang: Lang;
  locale: string;
  /** Motion allowed: the in-app switch is on AND the OS does not ask for reduced motion. */
  motionOk: boolean;
  /** True once stored preferences were applied on the client (avoids flashing wrong-language text). */
  ready: boolean;
  t: TFunction;
  tl: TListFunction;
  setPack: (id: string) => void;
  setTheme: (theme: Theme) => void;
  setDir: (dir: Dir) => void;
  setMotion: (motion: MotionPref) => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

function readStored(): Partial<DesignState> {
  const out: Partial<DesignState> = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(out, JSON.parse(raw) as Partial<DesignState>);
  } catch {
    /* storage can be blocked or empty; the defaults render correctly without it */
  }
  try {
    const q = new URLSearchParams(window.location.search);
    const pack = q.get("pack");
    const theme = q.get("theme");
    const dir = q.get("dir");
    const motion = q.get("motion");
    if (pack && PACKS.some((p) => p.id === pack)) out.pack = pack;
    if (theme === "light" || theme === "dark" || theme === "system") out.theme = theme;
    if (dir === "ltr" || dir === "rtl") out.dir = dir;
    if (motion === "on" || motion === "off") out.motion = motion;
  } catch {
    /* ignore */
  }
  return out;
}

function sanitize(raw: Partial<DesignState>): DesignState {
  return {
    pack: PACKS.some((p) => p.id === raw.pack) ? (raw.pack as string) : DEFAULTS.pack,
    theme: raw.theme === "light" || raw.theme === "dark" || raw.theme === "system" ? raw.theme : DEFAULTS.theme,
    dir: raw.dir === "rtl" ? "rtl" : "ltr",
    motion: raw.motion === "off" ? "off" : "on",
  };
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DesignState>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    setState(sanitize(readStored()));
    setReady(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOsReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const lang: Lang = state.dir === "rtl" ? "he" : "en";

  // The page's real attributes; the tokens, Tailwind and Radix portals all key off <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pack = state.pack;
    if (state.theme === "system") delete root.dataset.theme;
    else root.dataset.theme = state.theme;
    root.dir = state.dir;
    root.lang = lang;
    if (state.motion === "off") root.dataset.motion = "reduced";
    else delete root.dataset.motion;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, lang]);

  const setPack = useCallback((pack: string) => setState((s) => ({ ...s, pack })), []);
  const setTheme = useCallback((theme: Theme) => setState((s) => ({ ...s, theme })), []);
  const setDir = useCallback((dir: Dir) => setState((s) => ({ ...s, dir })), []);
  const setMotion = useCallback((motion: MotionPref) => setState((s) => ({ ...s, motion })), []);

  const value = useMemo<DesignContextValue>(() => {
    const { t, tl } = makeT(lang);
    return {
      ...state,
      lang,
      locale: localeFor(lang),
      motionOk: state.motion === "on" && !osReduced,
      ready,
      t,
      tl,
      setPack,
      setTheme,
      setDir,
      setMotion,
    };
  }, [state, lang, osReduced, ready, setPack, setTheme, setDir, setMotion]);

  return (
    <DesignContext.Provider value={value}>
      <IconContext.Provider value={{ weight: "thin", size: 20, mirrored: false }}>{children}</IconContext.Provider>
    </DesignContext.Provider>
  );
}

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used inside <DesignProvider>");
  return ctx;
}
export const useMotionOk = (): boolean => useDesign().motionOk;
export const useT = (): { t: TFunction; tl: TListFunction } => {
  const { t, tl } = useDesign();
  return { t, tl };
};
export const useDirection = (): Dir => useDesign().dir;
