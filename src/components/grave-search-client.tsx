"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPinIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchBurialIndex } from "@/lib/burial-data";
import { prepare, search, type PreparedEntry, type SearchQuery } from "@/lib/search";
import { useLocationSearch } from "@/lib/use-location";
import { recordHref, yearsLabel } from "./record-card";
import { useSite } from "./site-context";

interface Filters {
  q: string;
  section: string;
  bornFrom: string;
  bornTo: string;
  reposedFrom: string;
  reposedTo: string;
}

const EMPTY: Filters = { q: "", section: "", bornFrom: "", bornTo: "", reposedFrom: "", reposedTo: "" };
const KEYS = Object.keys(EMPTY) as (keyof Filters)[];
const year = (s: string) => (/^\d{3,4}$/.test(s) ? Number(s) : undefined);

interface SearchProps {
  sections: { value: string; label: string }[];
  pageSize: number;
  total: number;
}

/** Filters start from the address bar, so a search can be bookmarked or shared. */
export function GraveSearch(props: SearchProps) {
  const search = useLocationSearch();
  const p = new URLSearchParams(search ?? "");
  const initial = { ...EMPTY };
  for (const k of KEYS) initial[k] = p.get(k) ?? "";
  return <GraveSearchForm key={search === null ? "server" : "client"} {...props} initial={initial} initialPage={Number(p.get("page")) || 1} hydrated={search !== null} />;
}

function GraveSearchForm({ sections, pageSize, total, initial, initialPage, hydrated }: SearchProps & { initial: Filters; initialPage: number; hydrated: boolean }) {
  const { t, L, lang } = useSite();
  const [entries, setEntries] = useState<PreparedEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [page, setPage] = useState(initialPage);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    let alive = true;
    fetchBurialIndex()
      .then((rows) => alive && setEntries(prepare(rows)))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [hydrated, attempt]);

  const load = () => {
    setError(false);
    setAttempt((n) => n + 1);
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      setApplied((a) => (a.q === filters.q ? a : { ...a, q: filters.q }));
    }, 220);
    return () => window.clearTimeout(id);
  }, [filters.q]);

  useEffect(() => {
    if (!hydrated) return;
    const p = new URLSearchParams();
    for (const k of KEYS) if (applied[k]) p.set(k, applied[k]);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [applied, page, hydrated]);

  const active = KEYS.some((k) => applied[k]);
  const results = useMemo(() => {
    if (!entries || !active) return [];
    const q: SearchQuery = {
      q: applied.q || undefined,
      section: applied.section || undefined,
      bornFrom: year(applied.bornFrom),
      bornTo: year(applied.bornTo),
      reposedFrom: year(applied.reposedFrom),
      reposedTo: year(applied.reposedTo),
    };
    return search(entries, q);
  }, [entries, applied, active]);

  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * pageSize, current * pageSize);

  const set = (k: keyof Filters) => (v: string) => setFilters((f) => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(filters);
    setPage(1);
    resultsRef.current?.focus();
  };
  const clear = () => {
    setFilters(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };
  const sectionItems = [{ value: "all", label: t("search.anySection") }, ...sections];

  const yearInput = (k: keyof Filters, label: string) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`gs-${k}`} className="text-sm text-slate">
        {label}
      </Label>
      <Input
        id={`gs-${k}`}
        inputMode="numeric"
        maxLength={4}
        placeholder={t("search.year")}
        value={filters[k]}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "");
          set(k)(v);
          if (v.length === 4 || v === "") setApplied((a) => ({ ...a, [k]: v }));
        }}
        className="h-11 bg-paper text-base tabular-nums"
        dir="ltr"
      />
    </div>
  );

  return (
    <div className="grid gap-8">
      <form onSubmit={submit} role="search" className="grid gap-5 rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_48px_-40px_rgb(31_59_46/0.6)] sm:p-7">
        <div className="grid gap-1.5">
          <Label htmlFor="gs-q" className="text-[0.95rem] font-semibold text-ink">
            {t("search.name")}
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-slate" aria-hidden />
              <Input
                id="gs-q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder={t("search.namePlaceholder")}
                value={filters.q}
                onChange={(e) => {
                  set("q")(e.target.value);
                  setPage(1);
                }}
                className="h-12 bg-birch ps-11 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 text-base">
              {t("search.search")}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 grid gap-1.5 md:col-span-1">
            <Label htmlFor="gs-section" className="text-sm text-slate">
              {t("search.section")}
            </Label>
            <Select
              items={sectionItems}
              value={filters.section || "all"}
              onValueChange={(v) => {
                const value = v && v !== "all" ? String(v) : "";
                set("section")(value);
                setApplied((a) => ({ ...a, section: value }));
                setPage(1);
              }}
            >
              <SelectTrigger id="gs-section" className="h-11! w-full bg-paper text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectionItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {yearInput("bornFrom", t("search.bornFrom"))}
          {yearInput("bornTo", t("search.bornTo"))}
          {yearInput("reposedFrom", t("search.reposedFrom"))}
          {yearInput("reposedTo", t("search.reposedTo"))}
        </div>
        {active && (
          <Button type="button" variant="ghost" onClick={clear} className="w-fit gap-1.5 text-slate">
            <RotateCcwIcon className="size-4" aria-hidden />
            {t("search.clear")}
          </Button>
        )}
      </form>

      <div ref={resultsRef} tabIndex={-1} aria-live="polite" className="grid gap-4 outline-none">
        {error ? (
          <div className="grid justify-items-start gap-3 rounded-xl border border-danger/30 bg-paper p-5">
            <p className="font-semibold text-danger">{t("search.loadError")}</p>
            <Button variant="outline" onClick={load}>
              {t("common.retry")}
            </Button>
          </div>
        ) : !entries ? (
          <div className="grid gap-3" aria-label={t("common.loading")}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-birch-deep/70 motion-reduce:animate-none" />
            ))}
          </div>
        ) : !active ? (
          <div className="rounded-xl border border-dashed border-stone-deep/60 p-6 text-center">
            <p className="font-heading text-xl text-green">{t("search.start")}</p>
            <p className="mt-1 text-sm text-slate">{t("search.registerSize", { count: total })}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-line bg-paper p-6">
            <p className="font-heading text-xl text-green">{t("search.noResults")}</p>
            <p className="mt-1 max-w-2xl text-slate">{t("search.noResultsHelp")}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">{results.length === 1 ? t("search.resultsOne") : t("search.results", { count: results.length })}</p>
              {applied.q && <p className="text-sm text-slate">{t("search.sortedBy")}</p>}
            </div>
            <ul className="grid gap-3">
              {shown.map((r) => (
                <li key={r.id} className="grid gap-3 rounded-xl border border-line bg-paper p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                  <div className="min-w-0">
                    <p className="font-heading text-xl leading-snug text-green">
                      <Link href={recordHref(lang, r.id)} className="hover:underline hover:decoration-gold hover:underline-offset-4">
                        {r.title ? `${L(r.title)} ` : ""}
                        {r.native}
                      </Link>
                    </p>
                    {r.latin && r.latin !== r.native && <p className="text-sm text-slate">{r.latin}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-ink/85">
                      <span>{yearsLabel(r, t)}</span>
                      <span className="inline-flex items-center gap-1 text-slate">
                        <MapPinIcon className="size-3.5" aria-hidden />
                        {t("search.location", { section: r.section, row: r.row, plot: r.plot })}
                      </span>
                      {r.sample && (
                        <Badge variant="outline" className="border-gold/50 text-gold">
                          {t("common.sample")}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={recordHref(lang, r.id)} className="inline-flex h-10 items-center rounded-lg bg-green px-4 text-sm font-semibold text-paper hover:bg-green-mid">
                      {t("common.viewRecord")}
                    </Link>
                    <Link
                      href={`${recordHref(lang, r.id)}#map`}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-green hover:bg-green-soft/50"
                      aria-label={`${t("record.locate")}: ${r.native}`}
                    >
                      <MapPinIcon className="size-4" aria-hidden />
                      <span className="max-sm:sr-only">{t("record.locate")}</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav className="flex items-center justify-between gap-3" aria-label={t("search.page", { page: current, pages })}>
                <Button variant="outline" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                  {t("common.previous")}
                </Button>
                <span className="text-sm text-slate">{t("search.page", { page: current, pages })}</span>
                <Button variant="outline" disabled={current >= pages} onClick={() => setPage(current + 1)}>
                  {t("common.next")}
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
