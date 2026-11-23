import { PreplanningForm } from "../forms/preplanning-form";
import { SectionShell } from "./shell";
import { getGrounds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function PreplanningSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const sections = getGrounds()
    .sections.filter((s) => (s.availablePlots ?? 0) > 0)
    .map((s) => ({ id: s.id, name: L(s.name) }));
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <PreplanningForm sections={sections} />
    </SectionShell>
  );
}
