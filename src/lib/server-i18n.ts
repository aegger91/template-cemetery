import "server-only";
import { getNavigation, getPages, getSite, getTokens, getUi } from "./content";
import { fallbackChain, pagePath, pickLocalized, translate } from "./i18n";
import type { Localized, PageLink } from "./types";

export function serverI18n(lang: string) {
  const site = getSite();
  const chain = fallbackChain(lang, site.defaultLanguage, site.languages.map((l) => l.code));
  const dict = getUi(lang);
  const pages = getPages();
  const L = (field: Localized | undefined | null) => pickLocalized(field, chain).text;
  const LL = (field: Localized | undefined | null) => pickLocalized(field, chain);
  const t = (key: string, vars?: Record<string, string | number>) => translate(dict, key, vars);
  const href = (slug: string, anchor?: string) => pagePath(lang, slug, anchor);
  const resolveLink = (link: PageLink) => {
    if (link.href) return { href: link.href, label: L(link.label) };
    const page = pages.find((p) => p.slug === (link.page ?? ""));
    return { href: href(link.page ?? "", link.anchor), label: L(link.label ?? page?.title) };
  };
  return { site, chain, dict, pages, L, LL, t, href, resolveLink, nav: getNavigation() };
}

export function tokenStyle(displayFont: string | undefined): React.CSSProperties {
  const tokens = getTokens();
  const vars: Record<string, string> = {};
  for (const [group, values] of Object.entries(tokens)) {
    if (group.startsWith("$") || typeof values !== "object") continue;
    for (const [k, v] of Object.entries(values)) vars[`--tk-${group}-${k}`] = v;
  }
  vars["--display-font"] =
    displayFont === "greek"
      ? "var(--tk-font-displayGreek)"
      : displayFont === "slavonic"
        ? "var(--tk-font-displaySlavonic)"
        : "var(--tk-font-heading)";
  return vars as React.CSSProperties;
}
