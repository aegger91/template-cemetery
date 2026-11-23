"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDownIcon, GlobeIcon, HeartIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
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

/** Shadow only; height never changes, so sticky scroll does not jump. */
function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > threshold));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);
  return scrolled;
}

function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, languages, t } = useSite();
  const pathname = usePathname() ?? `/${lang}/`;
  if (languages.length < 2) return null;
  const target = (code: string) => pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${code}`);
  const current = languages.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-md px-2 text-sm leading-normal text-slate hover:bg-birch-deep hover:text-green",
          className,
        )}
        aria-label={t("common.language")}
      >
        <GlobeIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{current?.label}</span>
        <ChevronDownIcon className="size-3.5 shrink-0" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            render={<a href={target(l.code)} hrefLang={l.code} lang={l.code} onClick={(e) => { e.preventDefault(); window.location.assign(target(l.code) + window.location.search + window.location.hash); }} />}
            className={cn("cursor-pointer text-base leading-normal", l.code === lang && "font-semibold text-green")}
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
}: {
  items: HeaderNavItem[];
  donate?: ResolvedLink;
  homeHref: string;
  siteName: string;
  logo: React.ReactNode;
  logoCompact?: React.ReactNode;
}) {
  const { t, site, dir, lang, languages } = useSite();
  const scrolled = useScrolled();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (h: string) => stripHash(h) === pathname;
  const groupActive = (c: ResolvedLink[]) => c.some((l) => isActive(l.href));
  const phoneHref = `tel:${site.contact.phone.replace(/\D/g, "")}`;

  useEffect(() => {
    setOpen(false);
  }, [pathname, lang]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-paper",
        "transition-[box-shadow,border-color] duration-200 ease-out",
        scrolled ? "border-line shadow-[0_6px_24px_-18px_rgb(31_59_46/0.45)]" : "border-line/60 shadow-none",
      )}
    >
      <div className="bg-green text-paper/90">
        <div className="container-site flex h-9 items-center justify-between gap-3 text-[0.82rem] leading-normal">
          <HoursToday className="min-w-0 truncate" tone="dark" />
          <a href={phoneHref} className="hidden shrink-0 items-center gap-1.5 leading-normal hover:text-gold-soft sm:inline-flex" dir="ltr">
            <PhoneIcon className="size-3.5" aria-hidden />
            {site.contact.phone}
          </a>
        </div>
      </div>

      <div className="container-site flex h-(--tk-layout-headerHeight) items-center justify-between gap-3">
        <Link href={homeHref} className="flex min-w-0 max-w-[min(100%,18rem)] items-center rounded-md sm:max-w-xs xl:max-w-sm" aria-label={siteName}>
          {logo}
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <NavigationMenu className="hidden xl:flex" align="start">
            <NavigationMenuList className="gap-0.5">
              {items.map((item) =>
                hasChildren(item) ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger
                      className={cn(
                        "h-10 bg-transparent px-2.5 text-[0.95rem] leading-normal font-medium whitespace-nowrap text-ink hover:text-green",
                        groupActive(item.children) && "text-green underline decoration-gold decoration-2 underline-offset-8",
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-72 gap-0.5 p-1.5">
                        {item.children.map((c) => (
                          <li key={c.href + c.label}>
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
                        "h-10 bg-transparent px-2.5 text-[0.95rem] leading-normal font-medium whitespace-nowrap text-ink hover:text-green data-active:text-green data-active:underline data-active:decoration-gold data-active:decoration-2 data-active:underline-offset-8",
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
                "ms-1 h-10 gap-2 rounded-full bg-gold px-4 text-[0.95rem] leading-normal whitespace-nowrap text-paper hover:bg-gold/90 max-[359px]:px-3",
              )}
            >
              <HeartIcon className="size-4 max-[400px]:hidden" aria-hidden />
              {donate.label}
            </Link>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-lg" className="size-10 text-green xl:hidden" aria-label={open ? t("common.closeMenu") : t("common.openMenu")} />}
            >
              {open ? <XIcon className="size-6" aria-hidden /> : <MenuIcon className="size-6" aria-hidden />}
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "left" : "right"} className="flex w-[88vw] max-w-sm flex-col gap-0 overflow-y-auto bg-paper p-0">
              <SheetHeader className="border-b border-line px-5 py-4">
                <SheetTitle className="font-heading text-xl leading-normal text-green">{t("common.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="px-3 py-2" aria-label={t("common.menu")}>
                <Accordion>
                  {items.map((item) =>
                    hasChildren(item) ? (
                      <AccordionItem key={item.label} value={item.label} className="border-line">
                        <AccordionTrigger className="px-2 py-3.5 text-lg leading-normal font-medium text-ink hover:no-underline">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="mb-2 border-s-2 border-gold-soft ps-3">
                            {item.children.map((c) => (
                              <li key={c.href + c.label}>
                                <Link
                                  href={c.href}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "block rounded-md px-2 py-2.5 text-base leading-snug text-slate hover:bg-green-soft hover:text-green",
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
                          className={cn("block px-2 py-3.5 text-lg leading-normal font-medium text-ink", isActive(item.href) && "text-green")}
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
                          href={(pathname ?? `/${lang}/`).replace(new RegExp(`^/${lang}(?=/|$)`), `/${l.code}`)}
                          hrefLang={l.code}
                          lang={l.code}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm leading-normal",
                            l.code === lang ? "border-green bg-green text-paper" : "border-line text-ink hover:border-green",
                          )}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <a href={phoneHref} className="flex items-center gap-2 leading-normal text-green" dir="ltr">
                  <PhoneIcon className="size-4" aria-hidden />
                  {site.contact.phone}
                </a>
                <HoursToday className="text-sm leading-normal text-slate" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
