import { VolunteerPanel } from "./volunteer-panel";
import { SectionShell } from "./shell";
import { getServices } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function VolunteerSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const bring = ((section.bring as Localized[]) ?? []).map((b) => L(b));
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <VolunteerPanel cleanupDays={getServices().cleanupDays ?? []} bring={bring} />
    </SectionShell>
  );
}
