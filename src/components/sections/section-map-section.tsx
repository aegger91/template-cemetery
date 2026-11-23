import { SectionMap } from "../section-map";
import { SectionShell } from "./shell";
import { getGrounds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function SectionMapSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <SectionMap grounds={getGrounds()} />
    </SectionShell>
  );
}
