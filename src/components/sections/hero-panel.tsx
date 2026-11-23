"use client";

import Link from "next/link";
import { CalendarDaysIcon, ClockIcon, MapPinIcon, NavigationIcon, SearchIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nextWeekly, upcomingYearly } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { Services } from "@/lib/types";
import { useCemeteryNow, useFormatters, useSite } from "../site-context";
import { useHoursToday } from "../hours-today";
import { CrossShape } from "../orthodox-cross";

function PanelCell({ icon, label, children, className }: { icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 p-5 sm:p-6", className)}>
      <p className="eyebrow flex items-center gap-2">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

export function HeroPanel({
  services,
  searchAction,
  directionsUrl,
  address,
  schedule,
}: {
  services: Services;
  searchAction: string;
  directionsUrl?: string;
  address: string;
  schedule: string;
}) {
  const { t, L, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const hours = useHoursToday();
  const calendar = site.churchCalendar ?? "new";
  const next = upcomingYearly(services.memorialDays, now.date, 1, calendar)[0];
  const weekly = nextWeekly(services.weekly, now.date);

  return (
    <div className="grid overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_60px_-40px_rgb(31_59_46/0.55)] md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.25fr_1.15fr]">
      <PanelCell icon={<ClockIcon className="size-4" aria-hidden />} label={t("hours.visitingToday")}>
        <p className="font-heading text-2xl leading-tight text-green">{hours.range}</p>
        <p className={cn("inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-0.5 text-sm font-semibold", hours.open ? "bg-green-soft text-green" : "bg-birch-deep text-slate")}>
          <span className={cn("size-2 rounded-full", hours.open ? "bg-moss" : "bg-stone-deep")} aria-hidden />
          {hours.status}
        </p>
      </PanelCell>

      <PanelCell icon={<MapPinIcon className="size-4" aria-hidden />} label={t("hours.directions")} className="border-line max-md:border-t md:border-s">
        <p className="text-[0.95rem] leading-snug text-ink">{address}</p>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "mt-auto h-10 w-fit gap-2 border-green/30 px-3.5 text-green hover:bg-green-soft")}
          >
            <NavigationIcon className="size-4" aria-hidden />
            {t("hours.getDirections")}
          </a>
        )}
      </PanelCell>

      <PanelCell icon={<SearchIcon className="size-4" aria-hidden />} label={t("hero.searchLabel")} className="border-line max-lg:border-t lg:border-s">
        <form action={searchAction} method="get" role="search" className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <label htmlFor="hero-search" className="sr-only">
            {t("search.name")}
          </label>
          <Input id="hero-search" name="q" placeholder={t("hero.searchPlaceholder")} autoComplete="off" className="h-11 min-w-0 flex-1 bg-birch text-base" />
          <Button type="submit" className="h-11 gap-2 px-4">
            <SearchIcon className="size-4" aria-hidden />
            {t("hero.searchButton")}
          </Button>
        </form>
      </PanelCell>

      <PanelCell
        icon={<CalendarDaysIcon className="size-4" aria-hidden />}
        label={t("hero.nextService")}
        className="relative border-line bg-green-soft/50 max-lg:border-t md:max-lg:border-s lg:border-s"
      >
        <svg className="pointer-events-none absolute end-4 top-4 h-14 w-9 text-green/10" viewBox="0 0 36 56" aria-hidden>
          <CrossShape x={18} y={0} height={56} />
        </svg>
        {next && (
          <>
            <p className="font-heading text-xl leading-snug text-green">{L(next.source.title)}</p>
            <p className="text-[0.95rem] text-ink">
              <time dateTime={next.date}>{f.date(next.date, { weekday: "long", day: "numeric", month: "long" })}</time>
              {next.time ? `, ${f.time(next.time)}` : ""}
            </p>
          </>
        )}
        {weekly && (
          <p className="text-sm text-slate">
            {t("hero.everyWeek")}: {L(weekly.source.title)}, {t(`weekdays.${"weekday" in weekly.source ? weekly.source.weekday : "sat"}`)} {f.time(weekly.time ?? "")}
          </p>
        )}
        <Link href={schedule} className="mt-auto w-fit text-sm font-semibold text-green underline decoration-gold underline-offset-4 hover:decoration-2">
          {t("hero.seeSchedule")}
        </Link>
      </PanelCell>
    </div>
  );
}
