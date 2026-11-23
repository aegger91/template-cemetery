import { GraveSearch } from "../grave-search-client";
import { SectionShell } from "./shell";
import { getBurialCount, getGrounds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function GraveSearchSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const sections = getGrounds().sections.map((s) => ({ value: s.id, label: L(s.name) }));
  return (
    <SectionShell id={section.id ?? "search"} heading={L(section.heading)} intro={L(section.intro)} className="pt-10 sm:pt-12">
      <GraveSearch sections={sections} pageSize={(section.pageSize as number) ?? 12} total={getBurialCount()} />
    </SectionShell>
  );
}
