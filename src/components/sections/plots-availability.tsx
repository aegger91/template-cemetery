import { SectionShell } from "./shell";
import { getGrounds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./section-renderer";

export function PlotsAvailability({ section, lang }: SectionProps) {
  const { L, t } = serverI18n(lang);
  const sections = getGrounds().sections;
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const n = s.availablePlots ?? 0;
          const status = n === 0 ? "statusFull" : n <= 5 ? "statusFew" : "statusOpen";
          return (
            <li key={s.id} className="reveal flex gap-4 rounded-xl border border-line bg-paper p-4 sm:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-green font-heading text-2xl text-paper" aria-hidden>
                {s.id}
              </span>
              <div className="grid min-w-0 gap-1">
                <h3 className="font-heading text-xl leading-tight">{L(s.name)}</h3>
                {s.description ? <p className="text-sm text-slate">{L(s.description)}</p> : null}
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-semibold",
                      n === 0 ? "bg-birch-deep text-slate" : n <= 5 ? "bg-gold-soft/60 text-ink" : "bg-green-soft text-green",
                    )}
                  >
                    {t(`plots.${status}`)}
                  </span>
                  <span className="text-ink/80 tabular-nums">{n ? t("map.available", { count: n }) : t("map.noneAvailable")}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-sm text-slate">{t("plots.updated")}</p>
    </SectionShell>
  );
}
