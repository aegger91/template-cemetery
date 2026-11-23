"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDownIcon, GlobeIcon, HeartIcon, MenuIcon, PhoneIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HoursToday } from "./hours-today";
import { useSite } from "./site-context";
import { cn } from "@/lib/utils";

interface ResolvedLink {
  href: string;
  label: string;
}
export type HeaderNavItem = ResolvedLink | { label: string; children: ResolvedLink[] };

const hasChildren = (i: HeaderNavItem): i is { label: string; children: ResolvedLink[] } => "children" in i;
const stripHash = (h: string) => h.split("#")[0];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, languages, t } = useSite();
  const pathname = usePathname() ?? `/${lang}/`;
  if (languages.length < 2) return null;
  const target = (code: string) => pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${code}`);
  const go = (code: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = target(code) + window.location.search + window.location.hash;
  };
  const current = languages.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-slate hover:bg-birch-deep hover:text-green",
          className,
        )}
        aria-label={t("common.language")}
      >
        <GlobeIcon className="size-4" aria-hidden />
        <span>{current?.label}</span>
        <ChevronDownIcon className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            render={<a href={target(l.code)} hrefLang={l.code} lang={l.code} onClick={go(l.code)} />}
            className={cn("cursor-pointer text-base", l.code === lang && "font-semibold text-green")}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderBar({
  items,
  donate,
  homeHref,
  siteName,
  logo,
  logoCompact,
}: {
  items: HeaderNavItem[];
  donate?: ResolvedLink;
  homeHref: string;
  siteName: string;
  logo: React.ReactNode;
  logoCompact: React.ReactNode;
}) {
  const { t, site, dir, lang, languages } = useSite();
  const scrolled = useScrolled();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (h: string) => stripHash(h) === pathname;
  const groupActive = (c: ResolvedLink[]) => c.some((l) => isActive(l.href));
  const phoneHref = `tel:${site.contact.phone.replace(/\D/g, "")}`;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-paper/95 backdrop-blur supports-backdrop-filter:bg-paper/85",
        "transition-shadow duration-(--motion-duration)",
        scrolled ? "border-line shadow-[0_6px_24px_-18px_rgb(31_59_46/0.45)]" : "border-transparent",
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-green text-paper/90 transition-[max-height,opacity] duration-(--motion-duration) ease-(--motion-easing)",
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
        )}
        aria-hidden={scrolled}
        inert={scrolled}
      >
        <div className="container-site flex h-9 items-center justify-between gap-3 text-[0.82rem]">
          <HoursToday className="min-w-0 truncate" tone="dark" />
          <a href={phoneHref} className="hidden shrink-0 items-center gap-1.5 hover:text-gold-soft sm:inline-flex" dir="ltr">
            <PhoneIcon className="size-3.5" aria-hidden />
            {site.contact.phone}
          </a>
        </div>
      </div>

      <div
        className={cn(
          "container-site flex items-center justify-between gap-3 transition-[height] duration-(--motion-duration) ease-(--motion-easing)",
          scrolled ? "h-(--tk-layout-headerHeightCondensed)" : "h-(--tk-layout-headerHeight)",
        )}
      >
        <Link href={homeHref} className="flex min-w-0 items-center rounded-md" aria-label={siteName}>
          <span className={cn("min-w-0", scrolled ? "hidden" : "hidden xl:contents")}>{logo}</span>
          <span className={cn("min-w-0", scrolled ? "contents" : "contents xl:hidden")}>{logoCompact}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <NavigationMenu className="hidden xl:flex" align="start">
            <NavigationMenuList className="gap-0.5">
              {items.map((item) =>
                hasChildren(item) ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger
                      className={cn(
                        "h-10 bg-transparent px-2.5 text-[0.95rem] font-medium text-ink hover:text-green",
                        groupActive(item.children) && "text-green underline decoration-gold decoration-2 underline-offset-8",
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-72 gap-0.5 p-1.5">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <NavigationMenuLink
                              render={<Link href={c.href} />}
                              active={isActive(c.href)}
                              className="block rounded-md px-3 py-2 text-[0.95rem] leading-snug text-ink hover:bg-green-soft hover:text-green data-active:font-semibold data-active:text-green"
                            >
                              {c.label}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      render={<Link href={item.href} />}
                      active={isActive(item.href)}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-10 bg-transparent px-2.5 text-[0.95rem] font-medium text-ink hover:text-green data-active:text-green data-active:underline data-active:decoration-gold data-active:decoration-2 data-active:underline-offset-8",
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <LanguageSwitcher className="hidden md:inline-flex" />

          {donate && (
            <Link
              href={donate.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "ms-1 h-10 gap-2 rounded-full bg-gold px-4 text-[0.95rem] text-paper hover:bg-gold/90 max-[359px]:px-3",
              )}
            >
              <HeartIcon className="size-4 max-[400px]:hidden" aria-hidden />
              {donate.label}
            </Link>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-lg" className="size-10 text-green xl:hidden" aria-label={t("common.openMenu")} />}
            >
              <MenuIcon className="size-6" aria-hidden />
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-[88vw] max-w-sm gap-0 overflow-y-auto bg-paper p-0">
              <SheetHeader className="border-b border-line px-5 py-4">
                <SheetTitle className="font-heading text-xl text-green">{t("common.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="px-3 py-2" aria-label={t("common.menu")}>
                <Accordion multiple={false}>
                  {items.map((item) =>
                    hasChildren(item) ? (
                      <AccordionItem key={item.label} value={item.label} className="border-line">
                        <AccordionTrigger className="px-2 py-3.5 text-lg font-medium text-ink hover:no-underline">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="mb-2 border-s-2 border-gold-soft ps-3">
                            {item.children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "block rounded-md px-2 py-2.5 text-base text-slate hover:bg-green-soft hover:text-green",
                                    isActive(c.href) && "font-semibold text-green",
                                  )}
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <div key={item.href} className="border-b border-line">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn("block px-2 py-3.5 text-lg font-medium text-ink", isActive(item.href) && "text-green")}
                        >
                          {item.label}
                        </Link>
                      </div>
                    ),
                  )}
                </Accordion>
              </nav>
              <div className="mt-auto space-y-4 border-t border-line px-5 py-5">
                {languages.length > 1 && (
                  <div>
                    <p className="eyebrow mb-2">{t("common.language")}</p>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((l) => (
                        <a
                          key={l.code}
                          href={pathname?.replace(new RegExp(`^/${lang}(?=/|$)`), `/${l.code}`)}
                          hrefLang={l.code}
                          lang={l.code}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm",
                            l.code === lang ? "border-green bg-green text-paper" : "border-line text-ink hover:border-green",
                          )}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <a href={phoneHref} className="flex items-center gap-2 text-green" dir="ltr">
                  <PhoneIcon className="size-4" aria-hidden />
                  {site.contact.phone}
                </a>
                <HoursToday className="text-sm text-slate" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
