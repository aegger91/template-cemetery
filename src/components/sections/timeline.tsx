import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function Timeline({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const items = (section.items as { year: string; text: Localized }[]) ?? [];
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <ol className="relative grid gap-0 border-s border-gold/40 ps-6 sm:ps-8">
        {items.map((item, i) => (
          <li key={i} className="reveal relative pb-8 last:pb-0">
            <span className="absolute -start-[calc(1.5rem+5px)] top-2 size-[9px] rotate-45 bg-gold sm:-start-[calc(2rem+5px)]" aria-hidden />
            <p className="font-heading text-2xl text-green tabular-nums">{item.year}</p>
            <p className="mt-1 max-w-2xl text-[1.02rem] text-ink/85">{L(item.text)}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
