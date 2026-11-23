import { RecordCard } from "../record-card";
import { SectionShell } from "./shell";
import { getBurialRecords } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function NotableBurials({ section, lang }: SectionProps) {
  const { L, t } = serverI18n(lang);
  const records = getBurialRecords((section.recordIds as string[]) ?? []);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <RecordCard key={r.id} record={r} lang={lang} L={L} t={t} />
        ))}
      </div>
    </SectionShell>
  );
}
