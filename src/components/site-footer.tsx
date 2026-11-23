import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { OrthodoxCross } from "./orthodox-cross";
import { DisplayPhrase } from "./display-phrase";
import { serverI18n } from "@/lib/server-i18n";

export function SiteFooter({ lang }: { lang: string }) {
  const { site, nav, L, t, resolveLink, href } = serverI18n(lang);
  const showNewsletter = Boolean(site.orthodoxConnect?.enabled && site.orthodoxConnect.newsletter);
  return (
    <footer className="mt-20 bg-green text-paper/85">
      <div className="container-site py-14">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <OrthodoxCross className="h-10 text-gold-soft" />
          <DisplayPhrase className="text-gold-soft" />
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="[&_.text-green]:text-paper [&_.text-slate]:text-paper/70">
              <Logo
                style={site.logo.style}
                image={site.logo.image}
                name={L(site.name)}
                tagline={L(site.tagline)}
                sealTop={L(site.logo.sealTopText ?? site.name)}
                sealBottom={L(site.logo.sealBottomText)}
                lang={lang}
              />
            </div>
            <ul className="space-y-2 text-[0.95rem]">
              <li className="flex gap-2.5">
                <MapPinIcon className="mt-1 size-4 shrink-0 text-gold-soft" aria-hidden />
                <span>{L(site.contact.address)}</span>
              </li>
              <li className="flex gap-2.5">
                <PhoneIcon className="mt-1 size-4 shrink-0 text-gold-soft" aria-hidden />
                <a href={`tel:${site.contact.phone.replace(/\D/g, "")}`} className="hover:text-paper" dir="ltr">
                  {site.contact.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MailIcon className="mt-1 size-4 shrink-0 text-gold-soft" aria-hidden />
                <a href={`mailto:${site.contact.email}`} className="break-all hover:text-paper">
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </div>
          {nav.footer?.map((col) => (
            <nav key={L(col.label)} aria-label={L(col.label)}>
              <h2 className="mb-3 font-sans text-sm font-semibold tracking-[0.12em] text-gold-soft uppercase">{L(col.label)}</h2>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const r = resolveLink(link);
                  return (
                    <li key={r.href}>
                      <Link href={r.href} className="hover:text-paper hover:underline">
                        {r.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>
        {showNewsletter && (
          <div className="mt-12 grid gap-4 rounded-xl border border-paper/15 bg-green-mid/40 p-6 md:grid-cols-[1fr_minmax(0,26rem)] md:items-center">
            <div>
              <h2 className="font-heading text-2xl text-paper">{t("footer.newsletterTitle")}</h2>
              <p className="mt-1 text-paper/75">{t("footer.newsletterText")}</p>
            </div>
            <NewsletterForm />
          </div>
        )}
        <div className="mt-12 flex flex-col gap-2 border-t border-paper/15 pt-6 text-sm text-paper/60 sm:flex-row sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear(), name: L(site.name) })}</p>
          <Link href={href("image-credits")} className="hover:text-paper">
            {t("footer.credits")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
