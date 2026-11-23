import { VolunteerPanel } from "./volunteer-panel";
import { SectionShell } from "./shell";
import { getAnnouncements } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function VolunteerSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const bring = ((section.bring as Localized[]) ?? []).map((b) => L(b));
  const cleanup = getAnnouncements().filter((a) => a.kind === "cleanup");
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <VolunteerPanel cleanupDays={cleanup} bring={bring} />
    </SectionShell>
  );
}
