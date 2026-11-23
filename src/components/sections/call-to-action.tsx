import Link from "next/link";
import { OrthodoxCross } from "../orthodox-cross";
import { buttonVariants } from "@/components/ui/button";
import { serverI18n } from "@/lib/server-i18n";
import { cn } from "@/lib/utils";
import type { ImageRef, PageLink } from "@/lib/types";
import type { SectionProps } from "./section-renderer";

export function CallToAction({ section, lang }: SectionProps) {
  const { L, resolveLink } = serverI18n(lang);
  const image = section.image as ImageRef | undefined;
  const green = section.tone === "green";
  const link = section.link ? resolveLink(section.link as PageLink) : null;
  const second = section.secondaryLink ? resolveLink(section.secondaryLink as PageLink) : null;
  return (
    <section id={section.id} className={cn("py-14 sm:py-20", green && "bg-green text-paper")}>
      <div className="container-site">
        <div
          className={cn(
            "reveal relative grid overflow-hidden",
            image ? "rounded-2xl border border-line bg-paper md:grid-cols-[1.1fr_1fr]" : "max-w-3xl",
          )}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              srcSet={image.srcSmall ? `${image.srcSmall} 720w, ${image.src} 1600w` : undefined}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt={L(image.alt)}
              loading="lazy"
              className="aspect-[16/10] size-full object-cover saturate-[0.65] md:aspect-auto md:min-h-80"
            />
          )}
          <div className={cn("flex flex-col justify-center gap-4", image && "p-6 sm:p-10")}>
            {green && <OrthodoxCross className="h-12 text-gold-soft" />}
            <h2 className={cn("text-3xl sm:text-4xl", green && "text-paper")}>{L(section.heading)}</h2>
            {section.text ? <p className={cn("max-w-xl text-lg", green ? "text-paper/85" : "text-slate")}>{L(section.text as never)}</p> : null}
            <div className="mt-2 flex flex-wrap gap-3">
              {link && (
                <Link
                  href={link.href}
                  className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base", green && "bg-gold text-ink hover:bg-gold-soft")}
                >
                  {link.label}
                </Link>
              )}
              {second && (
                <Link
                  href={second.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 px-5 text-base",
                    green && "border-paper/40 bg-transparent text-paper hover:bg-paper/10 hover:text-paper",
                  )}
                >
                  {second.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
