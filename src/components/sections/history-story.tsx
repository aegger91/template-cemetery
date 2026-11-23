import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import { cn } from "@/lib/utils";
import type { ImageRef, Localized } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function HistoryStory({ section, lang, index }: SectionProps) {
  const { L } = serverI18n(lang);
  const image = section.image as ImageRef | undefined;
  const paragraphs = (section.paragraphs as Localized[]) ?? [];
  const imageEnd = section.imageSide === "end";
  return (
    <SectionShell id={section.id} tone={index % 2 ? "paper" : "plain"}>
      <div className={cn("grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16", imageEnd && "lg:grid-cols-[1.1fr_1fr]")}>
        {image && (
          <figure className={cn("reveal", imageEnd && "lg:order-2")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              srcSet={image.srcSmall ? `${image.srcSmall} 720w, ${image.src} 1600w` : undefined}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt={L(image.alt)}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-xl object-cover saturate-[0.7] sm:aspect-[4/3] lg:aspect-[4/5]"
            />
            {image.caption ? <figcaption className="mt-3 text-sm text-slate">{L(image.caption)}</figcaption> : null}
          </figure>
        )}
        <div className="prose-quiet max-w-2xl">
          {section.heading ? <h2 className="mb-6 text-3xl sm:text-4xl">{L(section.heading)}</h2> : null}
          {paragraphs.map((p, i) => (
            <p key={i}>{L(p)}</p>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
