"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { fallbackChain, pagePath, pickLocalized, translate } from "@/lib/i18n";
import { nowIn } from "@/lib/calendar";
import type { Language, Localized, SiteConfig, UiDictionary } from "@/lib/types";

export type PublicSite = Pick<
  SiteConfig,
  | "name"
  | "shortName"
  | "languages"
  | "defaultLanguage"
  | "timezone"
  | "churchCalendar"
  | "visitingHours"
  | "contact"
  | "orthodoxConnect"
  | "forms"
  | "payments"
  | "fundTotals"
  | "displayFont"
  | "displayPhrase"
  | "displayPhraseMeaning"
>;

interface SiteContextValue {
  lang: string;
  dir: "ltr" | "rtl";
  site: PublicSite;
  languages: Language[];
  buildNow: { date: string; time: string };
  t: (key: string, vars?: Record<string, string | number>) => string;
  L: (field: Localized | undefined | null) => string;
  LL: (field: Localized | undefined | null) => { text: string; lang: string };
  href: (slug: string, anchor?: string) => string;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  lang,
  site,
  dict,
  buildNow,
  children,
}: {
  lang: string;
  site: PublicSite;
  dict: UiDictionary;
  buildNow: { date: string; time: string };
  children: React.ReactNode;
}) {
  const value = useMemo<SiteContextValue>(() => {
    const chain = fallbackChain(lang, site.defaultLanguage, site.languages.map((l) => l.code));
    const language = site.languages.find((l) => l.code === lang);
    return {
      lang,
      dir: language?.dir ?? "ltr",
      site,
      languages: site.languages,
      buildNow,
      t: (key, vars) => translate(dict, key, vars),
      L: (field) => pickLocalized(field, chain).text,
      LL: (field) => pickLocalized(field, chain),
      href: (slug, anchor) => pagePath(lang, slug, anchor),
    };
  }, [lang, site, dict, buildNow]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}

const subscribeClock = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** Current date and time at the cemetery. Uses the build time while hydrating so server and client agree. */
export function useCemeteryNow() {
  const { site, buildNow } = useSite();
  const snap = useSyncExternalStore(
    subscribeClock,
    () => {
      const n = nowIn(site.timezone);
      return `${n.date}|${n.time}`;
    },
    () => `${buildNow.date}|${buildNow.time}`,
  );
  const [date, time] = snap.split("|");
  return { date, time };
}

export function useFormatters() {
  const { lang, site } = useSite();
  return useMemo(() => {
    const date = (key: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Intl.DateTimeFormat(lang, { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, (m || 1) - 1, d || 1)));
    };
    const time = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
    };
    /** Partial register dates: 1907, 1907-05 or 1907-05-21. */
    const partial = (value?: string) => {
      if (!value) return "";
      if (value.length === 4) return value;
      if (value.length === 7) return date(`${value}-01`, { month: "long", year: "numeric" });
      return date(value);
    };
    return { date, time, partial, currency: site.payments?.currency ?? "USD" };
  }, [lang, site.payments?.currency]);
}
