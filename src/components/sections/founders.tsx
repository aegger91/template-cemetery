import { RecordCard } from "../record-card";
import { SectionShell } from "./shell";
import { getBurialRecords } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function Founders({ section, lang }: SectionProps) {
  const { L, t } = serverI18n(lang);
  const records = getBurialRecords((section.recordIds as string[]) ?? []);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="stone">
      <div className="grid gap-5">
        {records.map((r) => (
          <RecordCard key={r.id} record={r} lang={lang} L={L} t={t} layout="row" />
        ))}
      </div>
    </SectionShell>
  );
}
