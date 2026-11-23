"use client";

import { ClockIcon } from "lucide-react";
import { openState } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { useCemeteryNow, useFormatters, useSite } from "./site-context";

export function useHoursToday() {
  const { site, t } = useSite();
  const now = useCemeteryNow();
  const f = useFormatters();
  const s = openState(site.visitingHours, now.date, now.time);
  if (s.state === "closed") return { open: false, range: t("hours.closedToday"), status: t("hours.closedNow"), date: now.date };
  const range = t("hours.range", { open: f.time(s.open), close: f.time(s.close) });
  const status =
    s.state === "open"
      ? t("hours.openUntil", { time: f.time(s.close) })
      : s.state === "before"
        ? t("hours.opensAt", { time: f.time(s.open) })
        : t("hours.closedNow");
  return { open: s.state === "open", range, status, date: now.date };
}

export function HoursToday({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { t } = useSite();
  const h = useHoursToday();
  return (
    <p className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <ClockIcon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        <span className="sr-only">{t("hours.visitingToday")}: </span>
        <span aria-hidden className="max-sm:hidden">{t("hours.today")}: </span>
        {h.range}
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.75rem] font-semibold",
          tone === "dark"
            ? h.open
              ? "bg-paper/15 text-paper"
              : "bg-black/20 text-paper/80"
            : h.open
              ? "bg-green-soft text-green"
              : "bg-birch-deep text-slate",
        )}
      >
        <span className={cn("size-1.5 rounded-full", h.open ? "bg-gold-soft" : "bg-stone-deep")} aria-hidden />
        {h.open ? t("hours.openNow") : t("hours.closedNow")}
      </span>
    </p>
  );
}
