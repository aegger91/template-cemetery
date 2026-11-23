import { SectionShell } from "./shell";
import { getSources } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function ImageCredits({ section, lang }: SectionProps) {
  const { t, L } = serverI18n(lang);
  return (
    <SectionShell id={section.id} heading={L(section.heading)}>
      <ul className="grid gap-5 md:grid-cols-2">
        {getSources().map((s) => (
          <li key={s.id} className="grid grid-cols-[6rem_1fr] gap-4 rounded-xl border border-line bg-paper p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.file.replace(/\.webp$/, "-sm.webp")} alt="" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
            <dl className="grid min-w-0 gap-1 text-sm" lang="en">
              <dt className="sr-only">Title</dt>
              <dd className="font-heading text-lg leading-snug text-green">{s.title}</dd>
              <dt className="sr-only">{t("credits.author")}</dt>
              <dd>
                {s.author}
                {s.date ? `, ${s.date}` : ""}
              </dd>
              <dt className="sr-only">{t("credits.license")}</dt>
              <dd className="text-slate">{s.license}</dd>
              {s.changes && (
                <>
                  <dt className="sr-only">{t("credits.changes")}</dt>
                  <dd className="text-slate">{s.changes}</dd>
                </>
              )}
              <dt className="sr-only">{t("credits.source")}</dt>
              <dd>
                <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-green underline underline-offset-2">
                  {t("credits.source")}: Wikimedia Commons
                </a>
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
