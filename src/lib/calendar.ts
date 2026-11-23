import type { Services, Weekday, WeeklyService, YearlyService } from "./types";

/** Dates are handled as "YYYY-MM-DD" strings in the cemetery's own time zone. */
export type DateKey = string;

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const toUTC = (key: DateKey) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUTC = (ms: number): DateKey => new Date(ms).toISOString().slice(0, 10);

export const addDays = (key: DateKey, n: number): DateKey => fromUTC(toUTC(key) + n * 86400000);
export const weekdayOf = (key: DateKey): Weekday => WEEKDAYS[new Date(toUTC(key)).getUTCDay()];
export const diffDays = (a: DateKey, b: DateKey) => Math.round((toUTC(a) - toUTC(b)) / 86400000);
export const makeKey = (y: number, m: number, d: number): DateKey =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Today's date and time in the given IANA time zone. */
export function nowIn(timeZone: string, at = new Date()): { date: DateKey; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** Orthodox Pascha (Julian computus) as a Gregorian date. Valid 1900 to 2099. */
export function orthodoxPascha(year: number): DateKey {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(makeKey(year, month, day), 13);
}

/** A fixed church date (MM-DD) converted to the civil date for the given calendar. */
function churchDate(year: number, mmdd: string, calendar: "new" | "old"): DateKey {
  const [m, d] = mmdd.split("-").map(Number);
  const key = makeKey(year, m, d);
  return calendar === "old" ? addDays(key, 13) : key;
}

export function resolveRule(rule: string, year: number, calendar: "new" | "old"): DateKey | null {
  const [kind, arg] = rule.split(":");
  switch (kind) {
    case "pascha":
      return addDays(orthodoxPascha(year), Number(arg));
    case "church":
      return churchDate(year, arg, calendar);
    case "saturdayBefore": {
      const target = churchDate(year, arg, calendar);
      const back = (WEEKDAYS.indexOf(weekdayOf(target)) + 1) % 7 || 7;
      return addDays(target, -back);
    }
    case "sundayAfter": {
      const target = churchDate(year, arg, calendar);
      const fwd = (7 - WEEKDAYS.indexOf(weekdayOf(target))) % 7 || 7;
      return addDays(target, fwd);
    }
    case "date":
      return arg.startsWith(String(year)) ? arg : null;
    default:
      return null;
  }
}

export interface CalendarEvent {
  id: string;
  date: DateKey;
  time?: string;
  kind?: string;
  featured?: boolean;
  yearly: boolean;
  source: WeeklyService | YearlyService;
}

function inBrightWeek(date: DateKey): boolean {
  const p = orthodoxPascha(Number(date.slice(0, 4)));
  const n = diffDays(date, p);
  return n >= 0 && n <= 7;
}

export function yearlyOccurrences(items: YearlyService[], start: DateKey, end: DateKey, calendar: "new" | "old"): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const y0 = Number(start.slice(0, 4));
  const y1 = Number(end.slice(0, 4));
  for (let y = y0 - 1; y <= y1 + 1; y++) {
    for (const item of items) {
      const base = resolveRule(item.rule, y, calendar);
      if (!base) continue;
      const date = addDays(base, item.offsetDays ?? 0);
      if (date >= start && date <= end) {
        out.push({ id: `${item.id}-${date}`, date, time: item.time, kind: item.kind, featured: item.featured, yearly: true, source: item });
      }
    }
  }
  return out;
}

export function weeklyOccurrences(items: WeeklyService[], start: DateKey, end: DateKey): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const wd = weekdayOf(date);
    const weekOfMonth = Math.ceil(Number(date.slice(8, 10)) / 7);
    for (const item of items) {
      if (item.weekday !== wd) continue;
      if (item.weeksOfMonth && !item.weeksOfMonth.includes(weekOfMonth)) continue;
      if (item.pauseInBrightWeek && inBrightWeek(date)) continue;
      out.push({ id: `${item.id}-${date}`, date, time: item.time, kind: item.kind, yearly: false, source: item });
    }
  }
  return out;
}

const byDateTime = (a: CalendarEvent, b: CalendarEvent) =>
  a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date);

export function eventsBetween(services: Services, start: DateKey, end: DateKey, calendar: "new" | "old"): CalendarEvent[] {
  const yearly = yearlyOccurrences(services.memorialDays, start, end, calendar);
  const yearlyDates = new Set(yearly.map((e) => e.date));
  // On a memorial day the yearly service replaces the ordinary weekly one.
  const weekly = weeklyOccurrences(services.weekly, start, end).filter((e) => !yearlyDates.has(e.date));
  return [...yearly, ...weekly].sort(byDateTime);
}

export function upcomingYearly(items: YearlyService[], from: DateKey, count: number, calendar: "new" | "old"): CalendarEvent[] {
  return yearlyOccurrences(items, from, addDays(from, 800), calendar).sort(byDateTime).slice(0, count);
}

export function nextWeekly(items: WeeklyService[], from: DateKey): CalendarEvent | undefined {
  return weeklyOccurrences(items, from, addDays(from, 40)).sort(byDateTime)[0];
}

export function startOfWeek(date: DateKey, firstDay: 0 | 1 = 0): DateKey {
  const idx = WEEKDAYS.indexOf(weekdayOf(date));
  return addDays(date, -((idx - firstDay + 7) % 7));
}
