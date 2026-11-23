import { AnnouncementDetail } from "../announcement-detail";
import { getAnnouncements, getSite } from "@/lib/content";
import type { SectionProps } from "./section-renderer";

export function AnnouncementDetailSection({ section }: SectionProps) {
  return (
    <section id={section.id} className="container-site py-10 sm:py-14">
      <AnnouncementDetail items={getAnnouncements()} calendar={getSite().churchCalendar ?? "new"} />
    </section>
  );
}
