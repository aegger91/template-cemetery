import { OrthodoxCross } from "../orthodox-cross";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function PageHeader({ section, page, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const heading = L((section.heading as Localized | undefined) ?? page.title);
  return (
    <section id={section.id} className="relative overflow-hidden border-b border-line bg-paper">
      <OrthodoxCross className="pointer-events-none absolute -end-6 -top-6 h-64 text-green/[0.04] sm:end-10" />
      <div className="container-site relative py-12 sm:py-16">
        <div className="rule-ornament mb-5 max-w-40" aria-hidden>
          <OrthodoxCross className="h-5" />
        </div>
        <h1 className="max-w-3xl text-4xl sm:text-5xl">{heading}</h1>
        {section.intro ? <p className="mt-4 max-w-2xl text-lg text-slate sm:text-xl">{L(section.intro)}</p> : null}
      </div>
    </section>
  );
}
