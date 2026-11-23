import { AnnouncementsList } from "../announcements-list";
import { SectionShell } from "./shell";
import { getAnnouncements } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function UpcomingAnnouncementsSection({ section, lang }: SectionProps) {
  const { L, href } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <AnnouncementsList items={getAnnouncements()} count={(section.count as number) ?? 4} allHref={href("announcements")} />
    </SectionShell>
  );
}
