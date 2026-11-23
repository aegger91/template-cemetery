import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { mergeDictionaries } from "./i18n";
import type {
  BurialRecord,
  Announcement,
  Fund,
  Grounds,
  ImageSource,
  Navigation,
  Page,
  Services,
  SiteConfig,
  UiDictionary,
} from "./types";

const CONTENT = path.join(process.cwd(), "content");

function readJson<T>(...parts: string[]): T {
  return JSON.parse(readFileSync(path.join(CONTENT, ...parts), "utf8")) as T;
}

export const getSite = () => readJson<SiteConfig>("site.json");
export const getNavigation = () => readJson<Navigation>("navigation.json");
export const getGrounds = () => readJson<Grounds>("grounds.json");
export const getServices = () => readJson<Services>("services.json");
export const getAnnouncements = () => readJson<{ announcements: Announcement[] }>("announcements.json").announcements;
export const getFunds = () => readJson<{ funds: Fund[] }>("funds.json").funds;
export const getSources = () => readJson<{ images: ImageSource[] }>("sources.json").images;
export const getTokens = () => readJson<Record<string, Record<string, string>>>("tokens.json");

export function getPages(): Page[] {
  return readdirSync(path.join(CONTENT, "pages"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Page>("pages", f));
}

export function getPage(slug: string): Page | undefined {
  return getPages().find((p) => p.slug === slug);
}

export function getUi(lang: string): UiDictionary {
  const site = getSite();
  const load = (code: string): UiDictionary => {
    try {
      return readJson<UiDictionary>("i18n", `${code}.json`);
    } catch {
      return {};
    }
  };
  const base = load(site.defaultLanguage);
  return lang === site.defaultLanguage ? mergeDictionaries(base, {}) : mergeDictionaries(base, load(lang));
}

/** Records referenced by id, for server-rendered cards such as notable burials. */
export function getBurialRecords(ids: string[]): BurialRecord[] {
  const dir = path.join(CONTENT, "burials");
  const all = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => readJson<{ records: BurialRecord[] }>("burials", f).records);
  const byId = new Map(all.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is BurialRecord => Boolean(r));
}

export function getBurialCount(): number {
  const dir = path.join(CONTENT, "burials");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .reduce((n, f) => n + readJson<{ records: unknown[] }>("burials", f).records.length, 0);
}
