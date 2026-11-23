"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, eventsBetween, makeKey, startOfWeek, type CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { Services } from "@/lib/types";
import { useCemeteryNow, useFormatters, useSite } from "../site-context";

function EventLine({ e, compact = false, boxed = true }: { e: CalendarEvent; compact?: boolean; boxed?: boolean }) {
  const { t, L } = useSite();
  const f = useFormatters();
  const place = "place" in e.source ? e.source.place : undefined;
  return (
    <div className={cn("flex min-w-0 gap-3", e.yearly && !compact && boxed && "rounded-lg border border-gold/50 bg-gold-soft/25 p-3")}>
      {e.time && <span className={cn("shrink-0 font-semibold tabular-nums text-green", compact ? "text-xs" : "w-16 text-[0.95rem]")}>{f.time(e.time)}</span>}
      <div className="min-w-0">
        <p className={cn("text-ink", compact ? "line-clamp-2 text-xs leading-snug" : "font-semibold")}>{L(e.source.title)}</p>
        {!compact && (
          <p className="text-sm text-slate">
            {e.yearly ? t("services.memorialDay") : t("services.weeklyService")}
            {place ? ` · ${L(place)}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function Pager({ label, onPrev, onNext, onToday, prevLabel, nextLabel }: { label: string; onPrev: () => void; onNext: () => void; onToday: () => void; prevLabel: string; nextLabel: string }) {
  const { t } = useSite();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-heading text-2xl" aria-live="polite">
        {label}
      </h3>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} aria-label={prevLabel}>
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          {t("services.today")}
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} aria-label={nextLabel}>
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}

export function ScheduleViews({ services }: { services: Services }) {
  const { t, lang, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const calendar = site.churchCalendar ?? "new";
  const firstDay: 0 | 1 = lang === "en" ? 0 : 1;
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekStart = addDays(startOfWeek(now.date, firstDay), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const weekEvents = eventsBetween(services, weekStart, weekEnd, calendar);

  const [y0, m0] = now.date.split("-").map(Number);
  const mIndex = y0 * 12 + (m0 - 1) + monthOffset;
  const year = Math.floor(mIndex / 12);
  const month = (mIndex % 12) + 1;
  const monthStart = makeKey(year, month, 1);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = makeKey(year, month, daysInMonth);
  const gridStart = startOfWeek(monthStart, firstDay);
  const gridDays = Math.ceil((((new Date(`${monthStart}T00:00:00Z`).getUTCDay() - firstDay + 7) % 7) + daysInMonth) / 7) * 7;
  const monthEvents = eventsBetween(services, gridStart, addDays(gridStart, gridDays - 1), calendar);
  const byDay = (list: CalendarEvent[]) => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of list) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  };
  const weekMap = byDay(weekEvents);
  const monthMap = byDay(monthEvents);
  const headers = Array.from({ length: 7 }, (_, i) => f.date(addDays(gridStart, i), { weekday: "short" }));

  return (
    <Tabs defaultValue="week" className="gap-5">
      <TabsList className="h-11 w-fit">
        <TabsTrigger value="week" className="px-5">
          {t("services.week")}
        </TabsTrigger>
        <TabsTrigger value="month" className="px-5">
          {t("services.month")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="week" className="grid gap-4">
        <Pager
          label={t("services.weekOf", { date: f.date(weekStart, { day: "numeric", month: "long", year: "numeric" }) })}
          onPrev={() => setWeekOffset((w) => w - 1)}
          onNext={() => setWeekOffset((w) => w + 1)}
          onToday={() => setWeekOffset(0)}
          prevLabel={t("services.previousWeek")}
          nextLabel={t("services.nextWeek")}
        />
        <ol className="grid overflow-hidden rounded-xl border border-line bg-birch">
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i);
            const list = weekMap.get(d) ?? [];
            const today = d === now.date;
            return (
              <li key={d} className={cn("grid gap-3 border-line p-4 not-first:border-t sm:grid-cols-[10rem_1fr] sm:p-5", today && "bg-green-soft/50")}>
                <p className={cn("font-heading text-lg", today ? "text-green" : "text-ink/80")}>
                  <time dateTime={d}>{f.date(d, { weekday: "long", day: "numeric", month: "short" })}</time>
                  {today && <span className="ms-2 rounded-full bg-green px-2 py-0.5 align-middle font-sans text-xs text-paper">{t("services.today")}</span>}
                </p>
                <div className="grid gap-2.5">
                  {list.length ? list.map((e) => <EventLine key={e.id} e={e} />) : <span className="text-sm text-stone-deep" aria-hidden>·</span>}
                </div>
              </li>
            );
          })}
        </ol>
        {!weekEvents.length && <p className="text-slate">{t("services.nothingThisWeek")}</p>}
      </TabsContent>

      <TabsContent value="month" className="grid gap-4">
        <Pager
          label={f.date(monthStart, { month: "long", year: "numeric" })}
          onPrev={() => setMonthOffset((m) => m - 1)}
          onNext={() => setMonthOffset((m) => m + 1)}
          onToday={() => setMonthOffset(0)}
          prevLabel={t("services.previousMonth")}
          nextLabel={t("services.nextMonth")}
        />
        <div className="hidden overflow-hidden rounded-xl border border-line bg-line md:block">
          <div className="grid grid-cols-7 gap-px">
            {headers.map((h) => (
              <div key={h} className="bg-birch-deep px-2 py-2 text-center text-xs font-semibold tracking-wider text-slate uppercase">
                {h}
              </div>
            ))}
            {Array.from({ length: gridDays }, (_, i) => {
              const d = addDays(gridStart, i);
              const inMonth = d >= monthStart && d <= monthEnd;
              const list = monthMap.get(d) ?? [];
              const memorial = list.some((e) => e.yearly);
              return (
                <div key={d} className={cn("min-h-28 bg-paper p-2", !inMonth && "bg-birch/70 text-stone-deep", memorial && inMonth && "bg-gold-soft/25")}>
                  <p className={cn("mb-1 text-sm tabular-nums", d === now.date && "inline-grid size-6 place-items-center rounded-full bg-green text-paper")}>{Number(d.slice(8))}</p>
                  {inMonth && (
                    <div className="grid gap-1.5">
                      {list.slice(0, 3).map((e) => (
                        <EventLine key={e.id} e={e} compact />
                      ))}
                      {list.length > 3 && <p className="text-xs text-slate">{t("services.more", { count: list.length - 3 })}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <ol className="grid gap-2 md:hidden">
          {[...monthMap.entries()]
            .filter(([d]) => d >= monthStart && d <= monthEnd)
            .map(([d, list]) => (
              <li key={d} className={cn("grid gap-2 rounded-lg border bg-birch p-3.5", list.some((e) => e.yearly) ? "border-gold/50" : "border-line")}>
                <p className="font-heading text-lg text-green">
                  <time dateTime={d}>{f.date(d, { weekday: "long", day: "numeric", month: "long" })}</time>
                </p>
                {list.map((e) => (
                  <EventLine key={e.id} e={e} boxed={false} />
                ))}
              </li>
            ))}
        </ol>
      </TabsContent>
    </Tabs>
  );
}
