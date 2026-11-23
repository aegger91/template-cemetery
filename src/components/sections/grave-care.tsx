import { GraveCareForm } from "../forms/grave-care-form";
import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function GraveCareSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const tasks = ((section.tasks as { id: string; label: Localized }[]) ?? []).map((x) => ({ id: x.id, label: L(x.label) }));
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <GraveCareForm tasks={tasks} />
    </SectionShell>
  );
}
