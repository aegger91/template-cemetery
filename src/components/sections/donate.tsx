import { DonateForm } from "../forms/donate-form";
import { SectionShell } from "./shell";
import { getFunds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function DonateSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const funds = getFunds().map((f) => ({ id: f.id, name: L(f.name), description: L(f.description) }));
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <DonateForm funds={funds} amounts={(section.amounts as number[]) ?? [25, 50, 100, 250]} />
    </SectionShell>
  );
}
