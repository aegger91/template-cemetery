"use client";

import { cn } from "@/lib/utils";
import { useSite } from "./site-context";

/** The short phrase set in the optional Slavonic or Greek display font, with its meaning. */
export function DisplayPhrase({ className, size = "base" }: { className?: string; size?: "base" | "lg" }) {
  const { site, L } = useSite();
  if (!site.displayPhrase || site.displayFont === "none") return null;
  const phraseLang = site.displayFont === "greek" ? "grc" : "cu";
  return (
    <p className={cn("flex flex-col items-center gap-0.5", className)}>
      <span lang={phraseLang} className={cn("font-display leading-none", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl")}>
        {site.displayPhrase}
      </span>
      <span className="text-sm tracking-wide opacity-80">{L(site.displayPhraseMeaning)}</span>
    </p>
  );
}
