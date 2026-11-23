"use client";

import { NavigationIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { seasonFor } from "@/lib/hours";
import { cn } from "@/lib/utils";
import type { Weekday } from "@/lib/types";
import { HoursToday } from "../hours-today";
import { useCemeteryNow, useFormatters, useSite } from "../site-context";

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function VisitingHoursTable() {
  const { site, t, L } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const hours = site.visitingHours;
  const current = seasonFor(hours, now.date);
  const todayIdx = (new Date(`${now.date}T12:00:00Z`).getUTCDay() + 6) % 7;
  const closed = (hours.closedDates ?? []).map((md) => f.date(`2000-${md}`, { day: "numeric", month: "long" }));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        {hours.seasons.map((s, i) => {
          const isCurrent = s === current;
          return (
            <div key={i} className={cn("rounded-xl border bg-paper p-5", isCurrent ? "border-green/50" : "border-line")}>
              <p className="font-heading text-xl text-green">{L(s.name)}</p>
              <p className="text-sm text-slate">
                {t("hours.range", {
                  open: f.date(`2000-${s.from}`, { day: "numeric", month: "long" }),
                  close: f.date(`2000-${s.to}`, { day: "numeric", month: "long" }),
                })}
              </p>
              <table className="mt-3 w-full text-[0.95rem]">
                <tbody>
                  {ORDER.map((d, di) => {
                    const h = s.days[d];
                    const today = isCurrent && di === todayIdx;
                    return (
                      <tr key={d} className={cn("border-t border-line/70", today && "font-semibold text-green")}>
                        <th scope="row" className="py-1.5 pe-3 text-start font-normal">
                          {t(`weekdays.${d}`)}
                        </th>
                        <td className="py-1.5 text-end tabular-nums">{h ? t("hours.range", { open: f.time(h[0]), close: f.time(h[1]) }) : t("hours.closedToday")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 rounded-xl border border-line bg-green-soft/40 p-5 sm:p-6">
        <p className="eyebrow">{t("hours.visitingToday")}</p>
        <HoursToday className="text-lg text-green" />
        {closed.length > 0 && (
          <p className="text-[0.95rem] text-ink/85">
            {t("hours.closedDates")}: {closed.join(", ")}
          </p>
        )}
        {hours.note ? <p className="text-[0.95rem] text-slate">{L(hours.note)}</p> : null}
        <p className="text-[0.95rem]">
          <span className="font-semibold">{t("hours.address")}: </span>
          {L(site.contact.address)}
        </p>
        {site.contact.directionsUrl && (
          <a href={site.contact.directionsUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants(), "h-11 w-fit gap-2 px-4")}>
            <NavigationIcon className="size-4" aria-hidden />
            {t("hours.getDirections")}
          </a>
        )}
      </div>
    </div>
  );
}
