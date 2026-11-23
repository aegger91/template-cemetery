import { GraveRecordView } from "../grave-record-view";
import { getGrounds } from "@/lib/content";
import type { SectionProps } from "./section-renderer";

export function GraveRecordSection({ section }: SectionProps) {
  return (
    <section id={section.id} className="pt-6 pb-16 sm:pt-8 sm:pb-20">
      <GraveRecordView grounds={getGrounds()} />
    </section>
  );
}
