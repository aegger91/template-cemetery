import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, FlameIcon, HeartIcon, MapIcon, SearchIcon, SproutIcon } from "lucide-react";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

const ICONS = { search: SearchIcon, candle: FlameIcon, calendar: CalendarDaysIcon, sprout: SproutIcon, map: MapIcon, heart: HeartIcon };

interface QuickLink {
  icon?: keyof typeof ICONS;
  page: string;
  anchor?: string;
  label: Localized;
  text?: Localized;
}

export function QuickLinks({ section, lang }: SectionProps) {
  const { L, href } = serverI18n(lang);
  const items = (section.items as QuickLink[]) ?? [];
  return (
    <section id={section.id} className="py-14 sm:py-16">
      <div className="container-site">
        {section.heading ? <h2 className="mb-8 text-3xl">{L(section.heading)}</h2> : null}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon ?? "search"] ?? SearchIcon;
            return (
              <li key={item.page + (item.anchor ?? "")} className="reveal">
                <Link
                  href={href(item.page, item.anchor)}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-line bg-paper p-5 transition-colors duration-(--motion-duration) hover:border-gold/60 hover:bg-green-soft/40"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-green-soft text-green">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-heading text-xl text-green">{L(item.label)}</span>
                  {item.text ? <span className="text-[0.95rem] text-slate">{L(item.text)}</span> : null}
                  <ArrowRightIcon className="mt-auto size-4 text-gold transition-transform duration-(--motion-duration) group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
