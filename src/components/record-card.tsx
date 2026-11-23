import Link from "next/link";
import { GravePlaceholder } from "./grave-placeholder";
import { Badge } from "@/components/ui/badge";
import type { BurialRecord, Localized } from "@/lib/types";

export const recordHref = (lang: string, id: string) => `/${lang}/find-a-grave/record/?id=${encodeURIComponent(id)}`;

export function yearsLabel(r: { born?: string; reposed?: string }, t: (k: string, v?: Record<string, string | number>) => string) {
  const from = r.born?.slice(0, 4);
  const to = r.reposed?.slice(0, 4);
  if (from && to) return t("common.yearsRange", { from, to });
  if (from) return t("common.bornYear", { year: from });
  if (to) return t("common.reposedYear", { year: to });
  return "";
}

export function RecordCard({
  record,
  lang,
  L,
  t,
  role,
  layout = "card",
}: {
  record: BurialRecord;
  lang: string;
  L: (f: Localized | undefined) => string;
  t: (k: string, v?: Record<string, string | number>) => string;
  role?: string;
  layout?: "card" | "row";
}) {
  const title = record.title ? `${L(record.title)} ` : "";
  const seed = record.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const range = yearsLabel(record, t);
  return (
    <article
      className={
        layout === "row"
          ? "reveal grid gap-5 rounded-xl border border-line bg-paper p-4 sm:grid-cols-[12rem_1fr] sm:p-5"
          : "reveal flex flex-col overflow-hidden rounded-xl border border-line bg-paper"
      }
    >
      <div className={layout === "row" ? "overflow-hidden rounded-lg" : ""}>
        {record.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={record.photo.src} alt={L(record.photo.alt)} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <GravePlaceholder marker={record.marker} seed={seed} className="aspect-[4/3]" />
        )}
      </div>
      <div className={layout === "row" ? "flex min-w-0 flex-col gap-2" : "flex flex-1 flex-col gap-2 p-5"}>
        <div className="flex flex-wrap items-center gap-2">
          {record.sample && (
            <Badge variant="outline" className="border-gold/50 text-gold">
              {t("common.sampleRecord")}
            </Badge>
          )}
          {role && <span className="text-xs font-semibold tracking-wider text-moss uppercase">{role}</span>}
        </div>
        <h3 className="font-heading text-2xl leading-snug">
          {title}
          {record.name.native}
        </h3>
        {record.name.latin && record.name.latin !== record.name.native && (
          <p className="-mt-1 text-sm text-slate" lang="en">
            {record.name.latin}
          </p>
        )}
        <p className="text-[0.95rem] font-semibold text-ink/80">
          {range}
        </p>
        {record.summary ? <p className="text-[0.98rem] text-slate">{L(record.summary)}</p> : null}
        <Link
          href={recordHref(lang, record.id)}
          className="mt-auto w-fit pt-2 font-semibold text-green underline decoration-gold underline-offset-4 hover:decoration-2"
        >
          {t("common.viewRecord")}
        </Link>
      </div>
    </article>
  );
}
