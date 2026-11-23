import { MailIcon, MapPinIcon, ParkingSquareIcon, PhoneIcon, ClockIcon } from "lucide-react";
import { ContactForm } from "../forms/contact-form";
import { LocatorMap } from "../locator-map";
import { SectionShell } from "./shell";
import { serverI18n } from "@/lib/server-i18n";
import type { SectionProps } from "./section-renderer";

export function ContactSection({ section, lang }: SectionProps) {
  const { L, t, site } = serverI18n(lang);
  const c = site.contact;
  const rows = [
    { icon: MapPinIcon, label: t("contact.address"), value: L(c.address) },
    { icon: PhoneIcon, label: t("contact.phone"), value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}`, ltr: true },
    { icon: MailIcon, label: t("contact.email"), value: c.email, href: `mailto:${c.email}`, ltr: true },
    { icon: ClockIcon, label: t("contact.officeHours"), value: L(c.officeHours) },
    { icon: ParkingSquareIcon, label: t("contact.parking"), value: L(c.parking) },
  ].filter((r) => r.value);
  return (
    <SectionShell id={section.id} heading={L(section.heading)} intro={L(section.intro)}>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="grid gap-6">
          <dl className="grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:p-6">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-3.5">
                <r.icon className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-sm font-semibold text-slate">{r.label}</dt>
                  <dd className="text-ink">
                    {r.href ? (
                      <a href={r.href} dir={r.ltr ? "ltr" : undefined} className="font-semibold text-green underline decoration-gold/70 underline-offset-4">
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <LocatorMap embedUrl={c.mapEmbedUrl} directionsUrl={c.directionsUrl} label={t("contact.mapTitle")} openLabel={t("contact.openMap")} name={L(site.shortName ?? site.name)} />
        </div>
        <div>
          <h3 className="mb-4 font-heading text-2xl">{t("contact.heading")}</h3>
          <ContactForm />
        </div>
      </div>
    </SectionShell>
  );
}
