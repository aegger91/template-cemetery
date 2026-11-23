import { CommemorationForm } from "../forms/commemoration-form";
import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function CommemorationSection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <CommemorationForm
        amounts={(section.suggestedAmounts as number[]) ?? [5, 10, 20]}
        candlePrice={(section.candlePrice as number) ?? 0}
        lampadaPrice={(section.lampadaPrice as number) ?? 0}
        fundId={(section.fundId as string) ?? "chapel-upkeep"}
      />
    </SectionShell>
  );
}
