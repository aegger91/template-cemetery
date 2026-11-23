import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

/** Plain paragraphs for pages a builder adds. No HTML is rendered from content. */
export function RichText({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const paragraphs = (section.paragraphs as Localized[]) ?? [];
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <div className="prose-quiet max-w-2xl">
        {paragraphs.map((p, i) => (
          <p key={i}>{L(p)}</p>
        ))}
      </div>
    </SectionShell>
  );
}
