"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, FlameIcon, MapPinIcon, ScrollTextIcon, SproutIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { fetchBurialRecord } from "@/lib/burial-data";
import { useLocationSearch } from "@/lib/use-location";
import { cn } from "@/lib/utils";
import type { BurialRecord, Grounds } from "@/lib/types";
import { GravePlaceholder } from "./grave-placeholder";
import { OrthodoxCross } from "./orthodox-cross";
import { SectionMap } from "./section-map";
import { useFormatters, useSite } from "./site-context";

type State = { kind: "loading" } | { kind: "missing" } | { kind: "error" } | { kind: "ready"; record: BurialRecord };

export function GraveRecordView({ grounds }: { grounds: Grounds }) {
  const { t, L, LL, lang, href, site } = useSite();
  const f = useFormatters();
  const search = useLocationSearch();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (search === null) return;
    let alive = true;
    fetchBurialRecord(new URLSearchParams(search).get("id") ?? "")
      .then((record) => alive && setState(record ? { kind: "ready", record } : { kind: "missing" }))
      .catch(() => alive && setState({ kind: "error" }));
    return () => {
      alive = false;
    };
  }, [search, attempt]);

  const load = () => {
    setState({ kind: "loading" });
    setAttempt((n) => n + 1);
  };

  useEffect(() => {
    if (state.kind !== "ready") return;
    const r = state.record;
    document.title = `${r.title ? `${L(r.title)} ` : ""}${r.name.native} | ${L(site.name)}`;
    if (window.location.hash === "#map") {
      requestAnimationFrame(() => document.getElementById("map")?.scrollIntoView());
    }
  }, [state, L, site.name]);

  const back = (
    <Link href={href("find-a-grave")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:underline hover:underline-offset-4">
      <ArrowLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
      {t("record.backToSearch")}
    </Link>
  );

  if (state.kind !== "ready")
    return (
      <div className="container-site grid gap-6">
        {back}
        {state.kind === "loading" ? (
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]" aria-label={t("common.loading")}>
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-birch-deep motion-reduce:animate-none" />
            <div className="grid content-start gap-3">
              <div className="h-10 w-3/4 animate-pulse rounded bg-birch-deep motion-reduce:animate-none" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-birch-deep motion-reduce:animate-none" />
              <div className="h-24 animate-pulse rounded bg-birch-deep motion-reduce:animate-none" />
            </div>
          </div>
        ) : (
          <div className="grid max-w-xl justify-items-start gap-3 rounded-xl border border-line bg-paper p-6">
            <h1 className="text-3xl">{state.kind === "missing" ? t("record.missing") : t("search.loadError")}</h1>
            <p className="text-slate">{state.kind === "missing" ? t("record.missingHelp") : t("common.error")}</p>
            {state.kind === "error" ? (
              <Button onClick={load}>{t("common.retry")}</Button>
            ) : (
              <Link href={href("find-a-grave")} className={buttonVariants()}>
                {t("record.backToSearch")}
              </Link>
            )}
          </div>
        )}
      </div>
    );

  const r = state.record;
  const seed = r.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const bio = r.bio ? LL(r.bio) : null;
  const q = `?grave=${encodeURIComponent(r.id)}`;
  const actions = [
    { icon: FlameIcon, label: t("record.requestPanikhida"), href: `/${lang}/services/${q}#request` },
    { icon: ScrollTextIcon, label: t("record.sendNote"), href: `/${lang}/services/commemoration/${q}#note` },
    { icon: SproutIcon, label: t("record.requestCare"), href: `/${lang}/grave-care/${q}#request` },
  ];
  const locationBoxes = [
    { label: t("record.section"), value: r.section },
    { label: t("record.row"), value: r.row },
    { label: t("record.plot"), value: r.plot },
  ];

  return (
    <article className="grid gap-12">
      <div className="container-site grid gap-6">
        {back}
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1.15fr] lg:gap-12">
          <figure className="overflow-hidden rounded-2xl border border-line bg-paper">
            {r.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.photo.src} alt={L(r.photo.alt)} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <GravePlaceholder marker={r.marker} seed={seed} className="aspect-[4/3]" />
            )}
            <figcaption className="border-t border-line px-4 py-2.5 text-sm text-slate">{r.photo ? t("record.photo") : t("record.photoPlaceholder")}</figcaption>
          </figure>

          <div className="grid content-start gap-5">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {r.sample && (
                  <Badge variant="outline" className="border-gold/60 text-gold">
                    {t("common.sampleRecord")}
                  </Badge>
                )}
              </div>
              {r.title && <p className="font-heading text-xl text-moss">{L(r.title)}</p>}
              <h1 className="text-4xl leading-tight sm:text-5xl">{r.name.native}</h1>
              {r.name.latin && r.name.latin !== r.name.native && <p className="text-lg text-slate">{r.name.latin}</p>}
              {r.name.variants?.length ? (
                <p className="text-sm text-slate">
                  {t("record.otherSpellings")}: {r.name.variants.join(", ")}
                </p>
              ) : null}
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              {r.born && (
                <div className="rounded-xl border border-line bg-paper p-4">
                  <dt className="text-sm text-slate">{t("record.born")}</dt>
                  <dd className="font-heading text-2xl text-ink">{f.partial(r.born)}</dd>
                </div>
              )}
              {r.reposed && (
                <div className="rounded-xl border border-line bg-paper p-4">
                  <dt className="text-sm text-slate">{t("record.reposed")}</dt>
                  <dd className="font-heading text-2xl text-ink">{f.partial(r.reposed)}</dd>
                </div>
              )}
            </dl>

            <div className="grid gap-2">
              <p className="eyebrow">{t("record.location")}</p>
              <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch gap-2">
                {locationBoxes.map((b) => (
                  <div key={b.label} className="rounded-xl bg-green px-3 py-2.5 text-center text-paper">
                    <p className="text-xs tracking-wider text-paper/75 uppercase">{b.label}</p>
                    <p className="font-heading text-3xl leading-tight">{b.value}</p>
                  </div>
                ))}
                <a href="#map" className="grid place-items-center rounded-xl border border-green/30 px-3 text-green hover:bg-green-soft/50" aria-label={t("record.locate")}>
                  <MapPinIcon className="size-6" aria-hidden />
                </a>
              </div>
            </div>

            {r.clergy?.length ? (
              <div className="grid gap-1.5">
                <p className="eyebrow">{t("record.clergy")}</p>
                <ul className="grid gap-1">
                  {r.clergy.map((c, i) => (
                    <li key={i} className="text-ink/90">
                      <span className="font-semibold">{L(c.name)}</span>
                      {c.role && <span className="text-slate">, {t(`record.role_${c.role}`).toLowerCase()}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              {actions.map((a, i) => (
                <Link key={a.href} href={a.href} className={cn(buttonVariants({ variant: i === 0 ? "default" : "outline" }), "h-11 gap-2 px-4")}>
                  <a.icon className="size-4" aria-hidden />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {bio && bio.text && (
          <section className="mx-auto mt-2 grid w-full max-w-3xl gap-3 border-t border-line pt-8 text-center">
            <OrthodoxCross className="mx-auto h-8 text-gold" />
            <h2 className="text-2xl">{t("record.biography")}</h2>
            <p className="text-lg leading-relaxed text-ink/90" lang={bio.lang}>
              {bio.text}
            </p>
            {bio.lang !== lang && <p className="text-sm text-slate">{t("common.shownInDefault")}</p>}
            <p className="mt-2 font-heading text-2xl italic text-gold">{t("record.memoryEternal")}</p>
          </section>
        )}
      </div>

      <section id="map" className="scroll-mt-24 bg-paper py-12 sm:py-16">
        <div className="container-site">
          <h2 className="mb-6 text-3xl">{t("record.locate")}</h2>
          <SectionMap grounds={grounds} target={{ section: r.section, row: r.row, plot: r.plot }} />
        </div>
      </section>
    </article>
  );
}
