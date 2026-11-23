import type { BurialIndexEntry, BurialRecord } from "./types";

/**
 * The register is published as static files by scripts/build-data.mjs:
 *   /data/burials/index.json         compact rows used by search
 *   /data/burials/records/{id}.json  one full record per grave
 * so the site stays a plain static build no matter how many graves it holds.
 */
let indexPromise: Promise<BurialIndexEntry[]> | null = null;

export function fetchBurialIndex(): Promise<BurialIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch("/data/burials/index.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<{ records: BurialIndexEntry[] }>;
      })
      .then((d) => d.records)
      .catch((e) => {
        indexPromise = null;
        throw e;
      });
  }
  return indexPromise;
}

export async function fetchBurialRecord(id: string): Promise<BurialRecord | null> {
  if (!/^[a-z0-9-]+$/i.test(id)) return null;
  const r = await fetch(`/data/burials/records/${id}.json`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as BurialRecord;
}
