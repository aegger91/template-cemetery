import { OrthodoxCross } from "@/components/orthodox-cross";
import { getSite } from "@/lib/content";
import { pickLocalized } from "@/lib/i18n";

/** "/" sends visitors to their browser language when the site has it, otherwise to the default language. */
export default function RootRedirect() {
  const site = getSite();
  const codes = site.languages.map((l) => l.code);
  const script = `(function(){var c=${JSON.stringify(codes)},d=${JSON.stringify(site.defaultLanguage)};var l=(navigator.languages||[navigator.language||""]).map(function(x){return String(x).toLowerCase().split("-")[0]});var p=l.find(function(x){return c.indexOf(x)>-1})||d;location.replace("/"+p+"/"+location.search+location.hash);})();`;
  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=/${site.defaultLanguage}/`} />
      </noscript>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <main className="grid min-h-dvh place-items-center bg-birch p-6">
        <div className="grid justify-items-center gap-5 text-center">
          <OrthodoxCross className="h-14 text-green" />
          <ul className="flex flex-wrap justify-center gap-3">
            {site.languages.map((l) => (
              <li key={l.code}>
                <a href={`/${l.code}/`} lang={l.code} className="inline-block rounded-lg border border-line bg-paper px-4 py-2 font-heading text-lg text-green">
                  {pickLocalized(site.name, [l.code, site.defaultLanguage]).text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
