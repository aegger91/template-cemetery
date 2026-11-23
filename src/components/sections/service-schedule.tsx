import { ScheduleViews } from "./schedule-views";
import { SectionShell } from "./shell";
import { getServices } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function ServiceScheduleSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <ScheduleViews services={getServices()} />
    </SectionShell>
  );
}
