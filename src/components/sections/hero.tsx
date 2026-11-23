import { HeroPanel } from "./hero-panel";
import { DisplayPhrase } from "../display-phrase";
import { getAnnouncements, getSources } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { ImageRef } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function Hero({ section, lang }: SectionProps) {
  const { site, L, t, href } = serverI18n(lang);
  const image = section.image as ImageRef | undefined;
  const source = image?.sourceId ? getSources().find((s) => s.id === image.sourceId) : undefined;
  const heading = L((section.heading as never) ?? site.name);
  return (
    <section id={section.id} className="relative">
      <div className="relative isolate overflow-hidden bg-green">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            srcSet={image.srcSmall ? `${image.srcSmall} 720w, ${image.src} 1600w` : undefined}
            sizes="100vw"
            alt={L(image.alt)}
            fetchPriority="high"
            className="absolute inset-0 -z-10 size-full object-cover object-[50%_62%] opacity-90 saturate-[0.55] sepia-[0.12]"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-green via-green/55 to-green/10" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green/55 to-transparent rtl:bg-gradient-to-l" aria-hidden />
        <div className="container-site flex min-h-[29rem] flex-col justify-end pt-24 pb-36 sm:min-h-[34rem] lg:pb-44">
          <div className="max-w-2xl text-paper">
            <DisplayPhrase className="mb-5 items-start text-gold-soft" size="lg" />
            <h1 className="text-[2.35rem] leading-[1.05] text-paper sm:text-6xl">{heading}</h1>
            {section.intro ? <p className="mt-4 max-w-xl text-lg text-paper/85 sm:text-xl">{L(section.intro)}</p> : null}
          </div>
        </div>
        {source && (
          <p className="absolute end-3 bottom-2 max-w-[60%] truncate text-[0.7rem] text-paper/55">
            {source.author.split(" (")[0]}, {source.date}. {t("common.publicDomain")}
          </p>
        )}
      </div>
      <div className="container-site relative z-10 -mt-28 lg:-mt-32">
        <HeroPanel announcements={getAnnouncements()} searchAction={href("find-a-grave")} directionsUrl={site.contact.directionsUrl} address={L(site.contact.address)} announcementsHref={href("announcements")} />
      </div>
    </section>
  );
}
