"use client";

import { CalendarDaysIcon, ExternalLinkIcon, SproutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upcomingYearly } from "@/lib/calendar";
import { connectLinks, openDeepLink } from "@/lib/orthodox-connect";
import type { YearlyService } from "@/lib/types";
import { useCemeteryNow, useFormatters, useSite } from "../site-context";

export function VolunteerPanel({ cleanupDays, bring }: { cleanupDays: YearlyService[]; bring: string[] }) {
  const { t, L, site } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const days = upcomingYearly(cleanupDays, now.date, 2, site.churchCalendar ?? "new");
  const links = connectLinks(site.orthodoxConnect, "volunteer");

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid gap-4">
        <h3 className="font-heading text-2xl">{t("volunteer.upcoming")}</h3>
        <ul className="grid gap-3">
          {days.map((d) => (
            <li key={d.id} className="flex items-start gap-4 rounded-xl border border-line bg-paper p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-green-soft text-green">
                <CalendarDaysIcon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-xl text-green">{L(d.source.title)}</p>
                <p className="text-ink/85">
                  <time dateTime={d.date}>{f.date(d.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>
                </p>
                {d.time && <p className="mt-1 text-sm text-slate">{t("volunteer.meet", { time: f.time(d.time) })}</p>}
              </div>
            </li>
          ))}
        </ul>
        <div className="grid justify-items-start gap-2 pt-2">
          {links ? (
            <>
              <Button size="lg" className="h-12 gap-2 px-6 text-base" onClick={() => openDeepLink(links.app, links.web)}>
                {t("volunteer.signUp")}
                <ExternalLinkIcon className="size-4" aria-hidden />
              </Button>
              <p className="text-sm text-slate">{t("volunteer.signUpHelp")}</p>
            </>
          ) : (
            <p className="text-ink/85">{t("volunteer.notConnected")}</p>
          )}
        </div>
      </div>
      {bring.length > 0 && (
        <aside className="rounded-xl border border-line bg-green-soft/40 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-heading text-2xl">
            <SproutIcon className="size-5 text-moss" aria-hidden />
            {t("volunteer.bring")}
          </h3>
          <ul className="mt-3 grid gap-2">
            {bring.map((b) => (
              <li key={b} className="flex gap-2.5 text-ink/85">
                <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
