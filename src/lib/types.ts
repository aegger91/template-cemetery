export type Localized = string | Record<string, string>;

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Language {
  code: string;
  label: string;
  dir?: "ltr" | "rtl";
}

export interface ImageRef {
  src: string;
  srcSmall?: string;
  alt: Localized;
  caption?: Localized;
  sourceId?: string;
}

export interface PageLink {
  page?: string;
  anchor?: string;
  href?: string;
  label?: Localized;
}

export interface Season {
  name?: Localized;
  from: string;
  to: string;
  days: Partial<Record<Weekday, [string, string] | null>>;
}

export interface SiteConfig {
  name: Localized;
  shortName?: Localized;
  tagline?: Localized;
  founded?: number;
  languages: Language[];
  defaultLanguage: string;
  logo: {
    style: "seal" | "kiot" | "square" | "wordmark";
    image?: string;
    sealTopText?: Localized;
    sealBottomText?: Localized;
  };
  displayFont?: "slavonic" | "greek" | "none";
  displayPhrase?: string;
  displayPhraseMeaning?: Localized;
  churchCalendar?: "new" | "old";
  timezone: string;
  contact: {
    address: Localized;
    phone: string;
    email: string;
    directionsUrl?: string;
    mapEmbedUrl?: string;
    officeHours?: Localized;
    parking?: Localized;
  };
  visitingHours: {
    seasons: Season[];
    closedDates?: string[];
    note?: Localized;
  };
  orthodoxConnect?: {
    enabled: boolean;
    organizationId?: string;
    appLink?: string;
    webLink?: string;
    newsletter?: boolean;
  };
  forms?: { endpoint?: string };
  payments?: { provider: PaymentProviderId; currency?: string; publicKey?: string };
  fundTotals?: { provider: FundTotalsProviderId; endpoint?: string };
  social?: { label: string; href: string }[];
}

export type PaymentProviderId = "demo" | "stripe" | "authorizeNet" | "tithely" | "none";
export type FundTotalsProviderId = "none" | "sample" | "stripe" | "authorizeNet" | "tithely";

export interface NavItem extends PageLink {
  children?: PageLink[];
}

export interface Navigation {
  header: NavItem[];
  donate?: PageLink;
  footer?: { label: Localized; links: PageLink[] }[];
}

export interface Section {
  type: string;
  id?: string;
  enabled?: boolean;
  heading?: Localized;
  intro?: Localized;
  [key: string]: unknown;
}

export interface Page {
  slug: string;
  title: Localized;
  description?: Localized;
  sections: Section[];
}

export interface GroundsSection {
  id: string;
  name: Localized;
  description?: Localized;
  x: number;
  y: number;
  w: number;
  h: number;
  rows: number;
  plotsPerRow: number;
  availablePlots?: number;
}

export interface Landmark {
  id: string;
  kind: "chapel" | "gate" | "building" | "parking" | "water";
  x: number;
  y: number;
  w: number;
  h: number;
  label: Localized;
}

export interface Grounds {
  width: number;
  height: number;
  sections: GroundsSection[];
  landmarks?: Landmark[];
}

export interface WeeklyService {
  id: string;
  weekday: Weekday;
  weeksOfMonth?: number[];
  time: string;
  kind?: string;
  pauseInBrightWeek?: boolean;
  title: Localized;
  place?: Localized;
}

export interface YearlyService {
  id: string;
  rule: string;
  offsetDays?: number;
  time?: string;
  kind?: string;
  featured?: boolean;
  title: Localized;
  note?: Localized;
}

export type AnnouncementKind = "memorial-day" | "cleanup" | "hours" | "closure" | "notice";

export interface Announcement {
  id: string;
  date?: string;
  rule?: string;
  offsetDays?: number;
  time?: string;
  endTime?: string;
  kind: AnnouncementKind;
  featured?: boolean;
  title: Localized;
  summary: Localized;
  body: Localized;
  location?: Localized;
}

export interface Services {
  weekly: WeeklyService[];
  memorialDays: YearlyService[];
  cleanupDays?: YearlyService[];
}

export interface Fund {
  id: string;
  name: Localized;
  description?: Localized;
}

export interface ImageSource {
  id: string;
  file: string;
  title: string;
  author: string;
  date?: string;
  license: string;
  sourceUrl: string;
  changes?: string;
}

export interface BurialRecord {
  id: string;
  sample?: boolean;
  notable?: boolean;
  title?: Localized;
  name: { script?: string; native: string; latin?: string; variants?: string[] };
  born?: string;
  reposed?: string;
  section: string;
  row: number;
  plot: number;
  marker?: "slavic-wood" | "slavic-stone" | "byzantine-stone";
  photo?: ImageRef | null;
  summary?: Localized;
  bio?: Localized;
  clergy?: { name: Localized; role?: "funeral" | "burial" | "deacon" }[];
}

/** One row of the generated search index (public/data/burials/index.json). */
export interface BurialIndexEntry {
  id: string;
  native: string;
  latin?: string;
  variants?: string[];
  title?: Localized;
  born?: string;
  reposed?: string;
  section: string;
  row: number;
  plot: number;
  sample?: boolean;
  notable?: boolean;
}

export type UiDictionary = Record<string, Record<string, string>>;
