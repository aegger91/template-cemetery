"use client";

import Link from "next/link";
import { upcomingYearly } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { Services } from "@/lib/types";
import { useCemeteryNow, useFormatters, useSite } from "../site-context";

export function UpcomingList({ services, count, scheduleHref }: { services: Services; count: number; scheduleHref?: string }) {
  const { t, L, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const events = upcomingYearly(services.memorialDays, now.date, count, site.churchCalendar ?? "new");
  return (
    <div>
      <ol className="grid gap-4 md:grid-cols-2">
        {events.map((e) => {
          const [y, m, d] = e.date.split("-");
          return (
            <li
              key={e.id}
              className={cn(
                "reveal flex gap-4 rounded-xl border bg-birch p-4 sm:gap-5 sm:p-5",
                e.featured ? "border-gold/60" : "border-line",
              )}
            >
              <time
                dateTime={e.date}
                className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper py-2 text-center sm:w-20"
              >
                <span className="text-xs tracking-wider text-gold uppercase">{f.date(`${y}-${m}-${d}`, { month: "short" })}</span>
                <span className="font-heading text-3xl leading-none text-green">{Number(d)}</span>
                <span className="text-xs text-slate">{f.date(e.date, { weekday: "short" })}</span>
              </time>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-moss uppercase">{t(`services.kind_${e.kind ?? "memorial"}`)}</p>
                <h3 className="mt-0.5 font-heading text-xl leading-snug">{L(e.source.title)}</h3>
                <p className="mt-1 text-[0.95rem] text-slate">
                  {f.date(e.date)}
                  {e.time ? `, ${f.time(e.time)}` : ""}
                </p>
                {"note" in e.source && e.source.note ? <p className="mt-2 text-[0.95rem] text-ink/85">{L(e.source.note)}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {scheduleHref && (
        <Link href={scheduleHref} className="mt-6 inline-block font-semibold text-green underline decoration-gold underline-offset-4 hover:decoration-2">
          {t("hero.seeSchedule")}
        </Link>
      )}
    </div>
  );
}
