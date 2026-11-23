import "@fontsource/eb-garamond/400.css";
import "@fontsource/source-sans-3/400.css";
import "./globals.css";

import type { Metadata } from "next";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { getSite, getUi } from "@/lib/content";
import { pickLocalized, translate } from "@/lib/i18n";
import { tokenStyle } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "404", icons: { icon: "/favicon.svg" } };

export default function GlobalNotFound() {
  const site = getSite();
  return (
    <html lang={site.defaultLanguage} style={tokenStyle(site.displayFont)}>
      <body className="bg-birch">
        <main className="grid min-h-dvh place-items-center p-6">
          <div className="grid max-w-3xl justify-items-center gap-8 text-center">
            <OrthodoxCross className="h-16 text-green" />
            <div className="grid gap-6 sm:grid-cols-3">
              {site.languages.map((l) => {
                const dict = getUi(l.code);
                return (
                  <div key={l.code} lang={l.code} dir={l.dir ?? "ltr"} className="grid content-start gap-2">
                    <h1 className="text-2xl">{translate(dict, "common.notFoundTitle")}</h1>
                    <p className="text-sm text-slate">{translate(dict, "common.notFoundText")}</p>
                    <a href={`/${l.code}/`} className="font-semibold text-green underline decoration-gold underline-offset-4">
                      {translate(dict, "common.goHome")}
                    </a>
                  </div>
                );
              })}
            </div>
            <p className="font-heading text-lg text-green">{pickLocalized(site.name, [site.defaultLanguage]).text}</p>
          </div>
        </main>
      </body>
    </html>
  );
}
