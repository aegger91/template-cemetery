import { FundTotalsList } from "./fund-totals-list";
import { SectionShell } from "./shell";
import { getFunds } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

/**
 * Optional, off by default. Figures come only from the payment provider through the
 * totals adapter (site.json fundTotals). With provider "none" nothing renders.
 */
export function FundTotalsSection({ section, lang }: SectionProps) {
  const { L, site } = serverI18n(lang);
  if (!site.fundTotals || site.fundTotals.provider === "none") return null;
  const ids = (section.fundIds as string[]) ?? [];
  const funds = getFunds()
    .filter((f) => !ids.length || ids.includes(f.id))
    .map((f) => ({ id: f.id, name: L(f.name) }));
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="paper">
      <FundTotalsList funds={funds} />
    </SectionShell>
  );
}
