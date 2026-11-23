import "@fontsource/eb-garamond/400.css";
import "@fontsource/source-sans-3/400.css";
import "../globals.css";

import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { pickLocalized } from "@/lib/i18n";
import { tokenStyle } from "@/lib/server-i18n";

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    title: pickLocalized(site.name, [site.defaultLanguage]).text,
    icons: { icon: "/favicon.svg" },
    robots: { index: false },
  };
}

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  return (
    <html lang={site.defaultLanguage} style={tokenStyle(site.displayFont)}>
      <body>{children}</body>
    </html>
  );
}
