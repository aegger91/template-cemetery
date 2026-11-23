import type { Localized, UiDictionary } from "./types";

/** Language order to try for a field: requested, then default, then any other configured language. */
export function fallbackChain(lang: string, defaultLanguage: string, all: string[]): string[] {
  return Array.from(new Set([lang, defaultLanguage, ...all]));
}

export function pickLocalized(
  field: Localized | undefined | null,
  chain: string[],
): { text: string; lang: string } {
  if (field == null) return { text: "", lang: chain[0] };
  if (typeof field === "string") return { text: field, lang: chain[0] };
  for (const code of chain) {
    const value = field[code];
    if (value) return { text: value, lang: code };
  }
  const first = Object.entries(field)[0];
  return first ? { text: first[1], lang: first[0] } : { text: "", lang: chain[0] };
}

export function mergeDictionaries(base: UiDictionary, override: Partial<UiDictionary>): UiDictionary {
  const out: UiDictionary = {};
  for (const group of new Set([...Object.keys(base), ...Object.keys(override)])) {
    if (group === "$schema") continue;
    out[group] = { ...(base[group] ?? {}), ...(override[group] ?? {}) };
  }
  return out;
}

export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(dict: UiDictionary, key: string, vars?: Record<string, string | number>): string {
  const [group, name] = key.split(".");
  const value = dict[group]?.[name];
  return value == null ? key : format(value, vars);
}

export function pagePath(lang: string, slug: string, anchor?: string): string {
  const path = slug ? `/${lang}/${slug}/` : `/${lang}/`;
  return anchor ? `${path}#${anchor}` : path;
}
