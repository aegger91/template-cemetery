import "@fontsource/eb-garamond/latin-400.css";
import "@fontsource/eb-garamond/latin-ext-400.css";
import "@fontsource/eb-garamond/cyrillic-400.css";
import "@fontsource/eb-garamond/cyrillic-ext-400.css";
import "@fontsource/eb-garamond/greek-400.css";
import "@fontsource/eb-garamond/latin-500.css";
import "@fontsource/eb-garamond/latin-ext-500.css";
import "@fontsource/eb-garamond/cyrillic-500.css";
import "@fontsource/eb-garamond/greek-500.css";
import "@fontsource/eb-garamond/latin-600.css";
import "@fontsource/eb-garamond/latin-ext-600.css";
import "@fontsource/eb-garamond/cyrillic-600.css";
import "@fontsource/eb-garamond/greek-600.css";
import "@fontsource/eb-garamond/latin-400-italic.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-ext-400.css";
import "@fontsource/source-sans-3/cyrillic-400.css";
import "@fontsource/source-sans-3/cyrillic-ext-400.css";
import "@fontsource/source-sans-3/greek-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "@fontsource/source-sans-3/latin-ext-600.css";
import "@fontsource/source-sans-3/cyrillic-600.css";
import "@fontsource/source-sans-3/greek-600.css";
import "@fontsource/ponomar/400.css";
import "@fontsource/gfs-didot/400.css";
import "../globals.css";

import type { Metadata } from "next";
import { SiteProvider, type PublicSite } from "@/components/site-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { nowIn } from "@/lib/calendar";
import { getSite } from "@/lib/content";
import { serverI18n, tokenStyle } from "@/lib/server-i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSite().languages.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { site, L } = serverI18n(lang);
  return {
    title: { default: L(site.name), template: `%s | ${L(site.shortName ?? site.name)}` },
    description: L(site.tagline),
    icons: { icon: "/favicon.svg" },
    alternates: {
      languages: Object.fromEntries(site.languages.map((l) => [l.code, `/${l.code}/`])),
    },
  };
}

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const i18n = serverI18n(lang);
  const { site, t } = i18n;
  const language = site.languages.find((l) => l.code === lang);
  const dir = language?.dir ?? "ltr";

  const publicSite: PublicSite = {
    name: site.name,
    shortName: site.shortName,
    languages: site.languages,
    defaultLanguage: site.defaultLanguage,
    timezone: site.timezone,
    churchCalendar: site.churchCalendar ?? "new",
    visitingHours: site.visitingHours,
    contact: site.contact,
    orthodoxConnect: site.orthodoxConnect,
    forms: site.forms,
    payments: site.payments,
    fundTotals: site.fundTotals,
    displayFont: site.displayFont,
    displayPhrase: site.displayPhrase,
    displayPhraseMeaning: site.displayPhraseMeaning,
  };

  return (
    <html lang={lang} dir={dir} style={tokenStyle(site.displayFont)}>
      <body className="flex min-h-dvh flex-col">
        <SiteProvider lang={lang} site={publicSite} dict={i18n.dict} buildNow={nowIn(site.timezone)}>
          <a
            href="#main"
            className="sr-only z-[60] rounded-md bg-green px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
          >
            {t("common.skipToContent")}
          </a>
          <SiteHeader lang={lang} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter lang={lang} />
          <Toaster position="bottom-center" />
        </SiteProvider>
      </body>
    </html>
  );
}

export const viewport = { themeColor: "#1F3B2E" };
