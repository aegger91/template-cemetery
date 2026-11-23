import { VisitingHoursTable } from "./visiting-hours-table";
import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function VisitingHoursSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <VisitingHoursTable />
    </SectionShell>
  );
}
