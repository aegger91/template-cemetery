import { AnnouncementsList } from "../announcements-list";
import { SectionShell } from "./shell";
import { getAnnouncements } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function AnnouncementsListSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <AnnouncementsList items={getAnnouncements()} count={(section.count as number) ?? 24} />
    </SectionShell>
  );
}
