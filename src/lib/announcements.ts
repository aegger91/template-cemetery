import { addDays, makeKey, resolveRule, type DateKey } from "./calendar";
import type { Announcement } from "./types";

export interface ResolvedAnnouncement extends Announcement {
  date: DateKey;
}

/** Resolve an announcement onto a concrete date for a given year window. */
export function resolveAnnouncement(
  item: Announcement,
  from: DateKey,
  calendar: "new" | "old",
  yearsAhead = 2,
): ResolvedAnnouncement | null {
  if (item.date) {
    return item.date >= from ? { ...item, date: item.date } : null;
  }
  if (!item.rule) return null;
  const y0 = Number(from.slice(0, 4));
  for (let y = y0; y <= y0 + yearsAhead; y++) {
    const base = resolveRule(item.rule, y, calendar);
    if (!base) continue;
    const date = addDays(base, item.offsetDays ?? 0);
    if (date >= from) return { ...item, date };
  }
  return null;
}

export function upcomingAnnouncements(
  items: Announcement[],
  from: DateKey,
  count: number,
  calendar: "new" | "old",
): ResolvedAnnouncement[] {
  return items
    .map((a) => resolveAnnouncement(a, from, calendar))
    .filter((a): a is ResolvedAnnouncement => Boolean(a))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
    .slice(0, count);
}

export function findAnnouncement(
  items: Announcement[],
  id: string,
  from: DateKey,
  calendar: "new" | "old",
): ResolvedAnnouncement | null {
  const item = items.find((a) => a.id === id);
  if (!item) return null;
  if (item.date) return { ...item, date: item.date };
  // Prefer the next occurrence; if none, show the previous year's date for reading past notices.
  return (
    resolveAnnouncement(item, from, calendar) ??
    resolveAnnouncement(item, makeKey(Number(from.slice(0, 4)) - 1, 1, 1), calendar, 1)
  );
}

export function announcementHref(lang: string, id: string) {
  return `/${lang}/announcements/detail/?id=${encodeURIComponent(id)}`;
}

/** Build a simple ICS file for add-to-calendar downloads. */
export function buildIcs(opts: {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: DateKey;
  time?: string;
  endTime?: string;
}): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = opts.date.replace(/-/g, "");
  let dtStart: string;
  let dtEnd: string;
  if (opts.time) {
    const [h, m] = opts.time.split(":").map(Number);
    const start = `${day}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    if (opts.endTime) {
      const [eh, em] = opts.endTime.split(":").map(Number);
      dtEnd = `${day}T${String(eh).padStart(2, "0")}${String(em).padStart(2, "0")}00`;
    } else {
      const endH = h + 1;
      dtEnd = `${day}T${String(endH).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    }
    dtStart = start;
  } else {
    dtStart = day;
    const next = addDays(opts.date, 1).replace(/-/g, "");
    dtEnd = next;
  }
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St Example Orthodox Cemetery//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.id}@example-cemetery`,
    `DTSTAMP:${stamp}`,
    opts.time ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
    opts.time ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
  ];
  if (opts.location) lines.push(`LOCATION:${esc(opts.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR", "");
  return lines.join("\r\n");
}
