"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSite } from "../site-context";

export interface GalleryImage {
  src: string;
  srcSmall: string;
  alt: string;
  caption?: string;
  sourceUrl?: string;
  author?: string;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const { t, dir } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  const total = images.length;
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      if (e.key === back) step(-1);
      if (e.key === fwd) step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, dir]);

  const current = open === null ? null : images[open];
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src} className={cn("reveal", i === 0 && "col-span-2 row-span-2")}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block size-full overflow-hidden rounded-lg bg-stone focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
              aria-label={t("gallery.open", { n: i + 1 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={i === 0 ? img.src : img.srcSmall}
                alt={img.alt}
                loading="lazy"
                className="aspect-square size-full object-cover saturate-[0.7] transition-transform duration-(--motion-duration) ease-(--motion-easing) group-hover:scale-[1.03]"
              />
              {img.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-3 pt-8 pb-2 text-start text-sm text-paper max-sm:hidden">
                  {img.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] gap-3 bg-paper p-3 sm:max-w-4xl sm:p-4">
          {current && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.src} alt={current.alt} className="max-h-[70vh] w-full rounded-md bg-stone object-contain" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pe-8">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="font-heading text-lg text-green">{current.caption || current.alt}</DialogTitle>
                  <DialogDescription className="text-sm text-slate">
                    {t("gallery.of", { n: (open ?? 0) + 1, total })}
                    {current.author ? ` · ${current.author}` : ""}
                    {current.sourceUrl && (
                      <>
                        {" · "}
                        <a href={current.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          {t("gallery.source")}
                        </a>
                      </>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label={t("common.previous")}>
                    <ChevronLeftIcon className="rtl:rotate-180" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => step(1)} aria-label={t("common.next")}>
                    <ChevronRightIcon className="rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
