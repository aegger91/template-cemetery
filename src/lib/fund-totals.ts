import type { FundTotalsProviderId } from "./types";

export interface FundTotals {
  raised: number;
  donors: number;
  updatedAt: string;
}

/**
 * Raised totals always come from the payment provider and are never typed in by hand.
 * A small server job (webhook or scheduled API sync) sums the payments tagged with each
 * fund id and serves them at the endpoint from content/site.json, for example
 * GET /api/funds/perpetual-care/totals -> { "raised": 1250, "donors": 18, "updatedAt": "..." }.
 * When no provider is connected the adapter returns null and the section hides itself.
 */
export interface FundTotalsAdapter {
  id: FundTotalsProviderId;
  getTotals(fundId: string): Promise<FundTotals | null>;
}

function endpointAdapter(id: FundTotalsProviderId, endpoint: string): FundTotalsAdapter {
  return {
    id,
    async getTotals(fundId) {
      // TODO(builder): the sync job behind this endpoint should read
      //   stripe: charges / payment intents with metadata.fund_id
      //   authorizeNet: settled transactions tagged with the fund id
      //   tithely: transactions for the matching Tithe.ly fund
      const res = await fetch(endpoint.replace("{fundId}", encodeURIComponent(fundId)));
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<FundTotals>;
      if (typeof data.raised !== "number") return null;
      return { raised: data.raised, donors: data.donors ?? 0, updatedAt: data.updatedAt ?? "" };
    },
  };
}

const sample: FundTotalsAdapter = {
  id: "sample",
  async getTotals(fundId) {
    const seed = Array.from(fundId).reduce((n, c) => n + c.charCodeAt(0), 0);
    return { raised: 1000 + (seed % 37) * 125, donors: 8 + (seed % 23), updatedAt: new Date().toISOString() };
  },
};

export function getFundTotalsAdapter(provider: FundTotalsProviderId | undefined, endpoint?: string): FundTotalsAdapter | null {
  if (!provider || provider === "none") return null;
  if (provider === "sample") return sample;
  if (!endpoint) return null;
  return endpointAdapter(provider, endpoint);
}
