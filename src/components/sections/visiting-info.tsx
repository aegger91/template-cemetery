import { InfoIcon } from "lucide-react";
import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

/** Optional short block for the client's own visitor notes. Turn off with "enabled": false. */
export function VisitingInfo({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const text = L(section.text as Localized | undefined);
  if (!text && !section.heading) return null;
  return (
    <SectionShell id={section.id} tone="paper">
      <div className="flex max-w-3xl gap-4 rounded-xl border border-line bg-birch p-5 sm:p-6">
        <InfoIcon className="mt-1 size-5 shrink-0 text-moss" aria-hidden />
        <div className="grid gap-1.5">
          {section.heading ? <h2 className="text-2xl">{L(section.heading)}</h2> : null}
          {text ? <p className="text-ink/85">{text}</p> : null}
        </div>
      </div>
    </SectionShell>
  );
}
