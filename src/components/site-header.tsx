import { HeaderBar, type HeaderNavItem } from "./header-bar";
import { Logo } from "./logo";
import { serverI18n } from "@/lib/server-i18n";

export function SiteHeader({ lang }: { lang: string }) {
  const { site, nav, L, resolveLink, href } = serverI18n(lang);
  const items: HeaderNavItem[] = nav.header.map((item) =>
    item.children
      ? { label: L(item.label), children: item.children.map(resolveLink) }
      : { ...resolveLink(item) },
  );
  const logoProps = {
    style: site.logo.style,
    image: site.logo.image,
    sealTop: L(site.logo.sealTopText ?? site.name),
    sealBottom: L(site.logo.sealBottomText),
    lang,
  };
  return (
    <HeaderBar
      items={items}
      donate={nav.donate ? resolveLink(nav.donate) : undefined}
      homeHref={href("")}
      siteName={L(site.name)}
      logo={<Logo {...logoProps} name={L(site.name)} tagline={L(site.tagline)} />}
      logoCompact={<Logo {...logoProps} name={L(site.shortName ?? site.name)} compact />}
    />
  );
}
