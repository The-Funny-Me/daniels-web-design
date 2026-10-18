import { auth, authLists } from "./auth";
import { chat, chatLists } from "./chat";
import { common } from "./common";
import { dashboard, dashboardLists } from "./dashboard";
import { home } from "./home";
import { landing } from "./landing";

export type Lang = "en" | "he";

const strings = {
  en: { ...common.en, ...home.en, ...auth.en, ...dashboard.en, ...chat.en, ...landing.en },
  he: { ...common.he, ...home.he, ...auth.he, ...dashboard.he, ...chat.he, ...landing.he },
} as const;

const lists = {
  en: { ...authLists.en, ...dashboardLists.en, ...chatLists.en },
  he: { ...authLists.he, ...dashboardLists.he, ...chatLists.he },
} as const;

export type StringKey = keyof typeof strings.en;
export type ListKey = keyof typeof lists.en;

export type TFunction = (key: StringKey, vars?: Record<string, string | number>) => string;
export type TListFunction = (key: ListKey) => readonly string[];

export function makeT(lang: Lang): { t: TFunction; tl: TListFunction } {
  const t: TFunction = (key, vars) => {
    let out: string = strings[lang][key];
    if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
    return out;
  };
  const tl: TListFunction = (key) => lists[lang][key];
  return { t, tl };
}

export const localeFor = (lang: Lang): string => (lang === "he" ? "he-IL" : "en-US");
