"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarPlusIcon, MapPinIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { findAnnouncement, buildIcs } from "@/lib/announcements";
import { useLocationSearch } from "@/lib/use-location";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCemeteryNow, useFormatters, useSite } from "./site-context";

export function AnnouncementDetail({ items, calendar }: { items: Announcement[]; calendar: "new" | "old" }) {
  const { t, L, href, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const search = useLocationSearch();
  const id = search === null ? null : new URLSearchParams(search).get("id");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (search !== null) setReady(true);
  }, [search]);

  if (!ready || id === null) {
    return (
      <div className="grid gap-3" aria-label={t("common.loading")}>
        <div className="h-8 w-40 animate-pulse rounded bg-birch-deep motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-xl bg-birch-deep motion-reduce:animate-none" />
      </div>
    );
  }

  const a = findAnnouncement(items, id || "", now.date, calendar);
  if (!a) {
    return (
      <div className="grid max-w-xl gap-3">
        <h1 className="text-3xl">{t("announcements.missing")}</h1>
        <p className="text-slate">{t("announcements.missingHelp")}</p>
        <Link href={href("announcements")} className={buttonVariants()}>
          {t("announcements.all")}
        </Link>
      </div>
    );
  }

  const title = L(a.title);
  const body = L(a.body);
  const location = L(a.location);
  const downloadIcs = () => {
    const ics = buildIcs({
      id: a.id,
      title,
      description: `${L(a.summary)}\n\n${body}`,
      location: location || L(site.name),
      date: a.date,
      time: a.time,
      endTime: a.endTime,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${a.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="mx-auto grid max-w-2xl gap-6">
      <Link href={href("announcements")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:underline hover:underline-offset-4">
        <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
        {t("announcements.all")}
      </Link>
      <div className="grid gap-2">
        <p className="text-xs font-semibold tracking-wider text-moss uppercase">{t(`announcements.kind_${a.kind}`)}</p>
        <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
        <p className="text-lg text-ink/85">
          <time dateTime={a.date}>{f.date(a.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>
          {a.time ? `, ${f.time(a.time)}` : ""}
        </p>
        {location && (
          <p className="flex items-center gap-2 text-slate">
            <MapPinIcon className="size-4 shrink-0" aria-hidden />
            {location}
          </p>
        )}
      </div>
      <p className="text-lg leading-relaxed text-ink/90">{body}</p>
      <div className="flex flex-wrap gap-3 border-t border-line pt-5">
        <Button type="button" onClick={downloadIcs} className="h-11 gap-2 px-5">
          <CalendarPlusIcon className="size-4" aria-hidden />
          {t("announcements.addToCalendar")}
        </Button>
        <Link href={href("announcements")} className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
          {t("announcements.back")}
        </Link>
      </div>
    </article>
  );
}
