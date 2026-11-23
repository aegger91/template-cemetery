import { useId } from "react";
import { CrossShape, OrthodoxCross } from "./orthodox-cross";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/lib/types";

interface LogoProps {
  style: SiteConfig["logo"]["style"];
  image?: string;
  name: string;
  tagline?: string;
  sealTop: string;
  sealBottom: string;
  lang: string;
  className?: string;
  compact?: boolean;
}

function Seal({ top, bottom, lang, className }: { top: string; bottom: string; lang: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const topLen = Math.min(200, top.length * 7.6);
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" lang={lang}>
      <defs>
        <path id={`${id}-top`} d="M 26 100 A 74 74 0 0 1 174 100" />
        <path id={`${id}-bottom`} d="M 14 100 A 86 86 0 0 0 186 100" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="var(--color-paper)" />
      <circle cx="100" cy="100" r="95" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
      <circle cx="100" cy="100" r="68" fill="var(--color-green)" />
      <circle cx="100" cy="100" r="64" fill="none" stroke="var(--color-gold-soft)" strokeWidth="1.2" />
      <text
        fill="var(--color-green)"
        fontFamily="var(--font-heading)"
        fontSize="13.5"
        fontWeight="600"
        letterSpacing="1.2"
        style={{ textTransform: "uppercase" }}
      >
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle" textLength={topLen} lengthAdjust="spacingAndGlyphs">
          {top}
        </textPath>
      </text>
      <text
        fill="var(--color-green)"
        fontFamily="var(--font-heading)"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.5"
        style={{ textTransform: "uppercase" }}
      >
        <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>
      <circle cx="16" cy="100" r="2.6" fill="var(--color-gold)" />
      <circle cx="184" cy="100" r="2.6" fill="var(--color-gold)" />
      <CrossShape x={100} y={58} height={84} fill="var(--color-gold-soft)" />
    </svg>
  );
}

function Kiot({ image, className }: { image?: string; className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden="true">
      <path d="M4 96 V36 A36 32 0 0 1 76 36 V96 Z" fill="var(--color-gold)" />
      <path d="M9 92 V37 A31 27 0 0 1 71 37 V92 Z" fill="var(--color-paper)" />
      <path d="M13 88 V38 A27 23 0 0 1 67 38 V88 Z" fill="var(--color-green)" />
      {image ? (
        <image href={image} x="13" y="15" width="54" height="73" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <CrossShape x={40} y={26} height={54} fill="var(--color-gold-soft)" />
      )}
      <rect x="2" y="94" width="76" height="5" rx="1" fill="var(--color-gold)" />
    </svg>
  );
}

export function Logo({ style, image, name, tagline, sealTop, sealBottom, lang, className, compact }: LogoProps) {
  const text = (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className={cn("font-heading font-semibold text-green text-balance", compact ? "text-[1.02rem]" : "text-[1.15rem] sm:text-[1.3rem]")}>
        {name}
      </span>
      {tagline && !compact && <span className="hidden text-xs tracking-wide text-slate 2xl:block">{tagline}</span>}
    </span>
  );
  const mark = "transition-[width,height] duration-(--motion-duration) ease-(--motion-easing)";
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      {style === "seal" && <Seal top={sealTop} bottom={sealBottom} lang={lang} className={cn(mark, compact ? "size-11" : "size-14 sm:size-16")} />}
      {style === "kiot" && <Kiot image={image} className={cn(mark, compact ? "h-11 w-9" : "h-14 w-11 sm:h-16 sm:w-13")} />}
      {style === "square" &&
        (image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={cn(mark, "rounded-md object-cover", compact ? "size-10" : "size-12 sm:size-14")} />
        ) : (
          <span className={cn(mark, "grid place-items-center rounded-md bg-green text-gold-soft", compact ? "size-10" : "size-12 sm:size-14")}>
            <OrthodoxCross className="h-3/4" />
          </span>
        ))}
      {text}
    </span>
  );
}
