import { weekdayOf, type DateKey } from "./calendar";
import type { Season, SiteConfig } from "./types";

const inRange = (mmdd: string, from: string, to: string) =>
  from <= to ? mmdd >= from && mmdd <= to : mmdd >= from || mmdd <= to;

export function seasonFor(hours: SiteConfig["visitingHours"], date: DateKey): Season | undefined {
  const mmdd = date.slice(5);
  return hours.seasons.find((s) => inRange(mmdd, s.from, s.to));
}

export function hoursOn(hours: SiteConfig["visitingHours"], date: DateKey): [string, string] | null {
  if (hours.closedDates?.includes(date.slice(5))) return null;
  const season = seasonFor(hours, date);
  return season?.days[weekdayOf(date)] ?? null;
}

export type OpenState =
  | { state: "open"; open: string; close: string }
  | { state: "before"; open: string; close: string }
  | { state: "after"; open: string; close: string }
  | { state: "closed" };

export function openState(hours: SiteConfig["visitingHours"], date: DateKey, time: string): OpenState {
  const h = hoursOn(hours, date);
  if (!h) return { state: "closed" };
  const [open, close] = h;
  if (time < open) return { state: "before", open, close };
  if (time >= close) return { state: "after", open, close };
  return { state: "open", open, close };
}
