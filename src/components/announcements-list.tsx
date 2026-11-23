"use client";

import Link from "next/link";
import { announcementHref, upcomingAnnouncements } from "@/lib/announcements";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCemeteryNow, useFormatters, useSite } from "./site-context";

export function AnnouncementsList({
  items,
  count,
  allHref,
}: {
  items: Announcement[];
  count: number;
  allHref?: string;
}) {
  const { t, L, lang, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const list = upcomingAnnouncements(items, now.date, count, site.churchCalendar ?? "new");

  if (!list.length) {
    return <p className="text-slate">{t("announcements.empty")}</p>;
  }

  return (
    <div className="grid gap-4">
      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((a) => {
          const [, , d] = a.date.split("-");
          return (
            <li key={`${a.id}-${a.date}`}>
              <Link
                href={announcementHref(lang, a.id)}
                className={cn(
                  "reveal flex gap-4 rounded-xl border bg-birch p-4 transition-colors hover:border-gold/50 hover:bg-paper sm:gap-5 sm:p-5",
                  a.featured ? "border-gold/50" : "border-line",
                )}
              >
                <time dateTime={a.date} className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper py-2 text-center sm:w-20">
                  <span className="text-xs tracking-wider text-gold uppercase">{f.date(a.date, { month: "short" })}</span>
                  <span className="font-heading text-3xl leading-none text-green">{Number(d)}</span>
                  <span className="text-xs text-slate">{f.date(a.date, { weekday: "short" })}</span>
                </time>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wider text-moss uppercase">{t(`announcements.kind_${a.kind}`)}</p>
                  <h3 className="mt-0.5 font-heading text-xl leading-snug text-green">{L(a.title)}</h3>
                  <p className="mt-1 text-[0.95rem] text-slate">
                    {f.date(a.date)}
                    {a.time ? `, ${f.time(a.time)}` : ""}
                  </p>
                  <p className="mt-2 text-[0.98rem] text-ink/85">{L(a.summary)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {allHref && (
        <Link href={allHref} className="w-fit font-semibold text-green underline decoration-gold underline-offset-4 hover:decoration-2">
          {t("announcements.all")}
        </Link>
      )}
    </div>
  );
}
