import { Hero } from "./hero";
import { PageHeader } from "./page-header";
import { QuickLinks } from "./quick-links";
import { UpcomingServicesSection } from "./upcoming-services";
import { NotableBurials } from "./notable-burials";
import { HistoryStory } from "./history-story";
import { Timeline } from "./timeline";
import { Founders } from "./founders";
import { GallerySection } from "./gallery";
import { GraveSearchSection } from "./grave-search";
import { GraveRecordSection } from "./grave-record";
import { SectionMapSection } from "./section-map-section";
import { ServiceScheduleSection } from "./service-schedule";
import { ServiceRequestSection } from "./service-request";
import { CommemorationSection } from "./commemoration";
import { PlotsAvailability } from "./plots-availability";
import { PreplanningSection } from "./preplanning";
import { GraveCareSection } from "./grave-care";
import { DonateSection } from "./donate";
import { FundTotalsSection } from "./fund-totals";
import { VolunteerSection } from "./volunteer";
import { VisitingHoursSection } from "./visiting-hours";
import { VisitingInfo } from "./visiting-info";
import { ContactSection } from "./contact";
import { RichText } from "./rich-text";
import { CallToAction } from "./call-to-action";
import { ImageCredits } from "./image-credits";
import type { Page, Section } from "@/lib/types";

export interface SectionProps {
  section: Section;
  page: Page;
  lang: string;
  index: number;
}

/** Every section type a page can list. Add a component here to offer a new section to the builder. */
const REGISTRY: Record<string, (p: SectionProps) => React.ReactNode> = {
  hero: Hero,
  pageHeader: PageHeader,
  quickLinks: QuickLinks,
  upcomingServices: UpcomingServicesSection,
  notableBurials: NotableBurials,
  historyStory: HistoryStory,
  timeline: Timeline,
  founders: Founders,
  gallery: GallerySection,
  graveSearch: GraveSearchSection,
  graveRecord: GraveRecordSection,
  sectionMap: SectionMapSection,
  serviceSchedule: ServiceScheduleSection,
  serviceRequestForm: ServiceRequestSection,
  commemorationForm: CommemorationSection,
  plotsAvailability: PlotsAvailability,
  preplanningForm: PreplanningSection,
  graveCareForm: GraveCareSection,
  donateForm: DonateSection,
  fundTotals: FundTotalsSection,
  volunteer: VolunteerSection,
  visitingHours: VisitingHoursSection,
  visitingInfo: VisitingInfo,
  contact: ContactSection,
  richText: RichText,
  callToAction: CallToAction,
  imageCredits: ImageCredits,
};

export function SectionRenderer({ page, lang }: { page: Page; lang: string }) {
  return (
    <>
      {page.sections
        .filter((s) => s.enabled !== false)
        .map((section, index) => {
          const Component = REGISTRY[section.type];
          if (!Component) {
            if (process.env.NODE_ENV !== "production") console.warn(`Unknown section type "${section.type}" on page "${page.slug}"`);
            return null;
          }
          return <Component key={`${section.type}-${index}`} section={section} page={page} lang={lang} index={index} />;
        })}
    </>
  );
}
