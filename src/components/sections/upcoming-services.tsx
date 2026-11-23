import { UpcomingList } from "./upcoming-list";
import { SectionShell } from "./shell";
import { getServices } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function UpcomingServicesSection({ section, lang, page }: SectionProps) {
  const { L, href } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <UpcomingList
        services={getServices()}
        count={(section.count as number) ?? 4}
        scheduleHref={page.slug === "services" ? undefined : href("services")}
      />
    </SectionShell>
  );
}
