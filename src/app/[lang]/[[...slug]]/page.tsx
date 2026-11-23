import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getPage, getPages, getSite } from "@/lib/content";
import { serverI18n } from "@/lib/server-i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPages().map((p) => ({ slug: p.slug ? p.slug.split("/") : [] }));
}

type Params = Promise<{ lang: string; slug?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = getPage((slug ?? []).join("/"));
  if (!page) return {};
  const { L, site } = serverI18n(lang);
  const path = page.slug ? `${page.slug}/` : "";
  return {
    title: page.slug ? L(page.title) : { absolute: L(site.name) },
    description: L(page.description ?? site.tagline),
    alternates: { languages: Object.fromEntries(getSite().languages.map((l) => [l.code, `/${l.code}/${path}`])) },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const page = getPage((slug ?? []).join("/"));
  if (!page) notFound();
  return <SectionRenderer page={page} lang={lang} />;
}
