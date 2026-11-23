"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getFundTotalsAdapter, type FundTotals } from "@/lib/fund-totals";
import { formatMoney } from "@/lib/payments";
import { useFormatters, useSite } from "../site-context";

export function FundTotalsList({ funds }: { funds: { id: string; name: string }[] }) {
  const { site, t, lang } = useSite();
  const f = useFormatters();
  const [totals, setTotals] = useState<Record<string, FundTotals | null>>({});
  const adapter = getFundTotalsAdapter(site.fundTotals?.provider, site.fundTotals?.endpoint);

  useEffect(() => {
    if (!adapter) return;
    let alive = true;
    Promise.all(funds.map(async (x) => [x.id, await adapter.getTotals(x.id).catch(() => null)] as const)).then((rows) => {
      if (alive) setTotals(Object.fromEntries(rows));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter?.id, funds]);

  if (!adapter) return null;
  const shown = funds.filter((x) => totals[x.id]);
  if (!shown.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {shown.map((x) => {
        const v = totals[x.id]!;
        return (
          <li key={x.id} className="rounded-xl border border-line bg-birch p-5">
            {adapter.id === "sample" && (
              <Badge variant="outline" className="mb-2 border-gold/50 text-gold">
                {t("common.sample")}
              </Badge>
            )}
            <p className="font-heading text-xl text-green">{x.name}</p>
            <p className="mt-2 font-heading text-3xl tabular-nums text-ink">{t("donate.raised", { amount: formatMoney(v.raised, f.currency, lang) })}</p>
            <p className="mt-1 text-sm text-slate">
              {t("donate.donors", { count: v.donors })}
              {v.updatedAt ? ` · ${t("donate.updated", { date: f.date(v.updatedAt.slice(0, 10)) })}` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
