import { GalleryGrid, type GalleryImage } from "./gallery-grid";
import { SectionShell } from "./shell";
import { getSources } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";
import type { ImageRef } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function GallerySection({ section, lang }: SectionProps) {
  const { L } = serverI18n(lang);
  const sources = getSources();
  const images: GalleryImage[] = ((section.images as ImageRef[]) ?? []).map((img) => {
    const src = sources.find((s) => s.id === img.sourceId);
    return {
      src: img.src,
      srcSmall: img.srcSmall ?? img.src.replace(/\.webp$/, "-sm.webp"),
      alt: L(img.alt),
      caption: L(img.caption),
      sourceUrl: src?.sourceUrl,
      author: src?.author.split(" (")[0],
    };
  });
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)} tone="stone">
      <GalleryGrid images={images} />
    </SectionShell>
  );
}
