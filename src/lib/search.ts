import type { BurialIndexEntry } from "./types";

const GREEK_DIGRAPHS: [string, string][] = [
  ["ου", "u"], ["αι", "e"], ["ει", "i"], ["οι", "i"], ["υι", "i"], ["μπ", "b"], ["ντ", "d"],
  ["γκ", "g"], ["γγ", "ng"], ["αυ", "av"], ["ευ", "ev"],
];
const GREEK: Record<string, string> = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l", μ: "m",
  ν: "n", ξ: "ks", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "i", φ: "f", χ: "h", ψ: "ps", ω: "o",
};
const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "i", ь: "", э: "e", ю: "iu", я: "ia", і: "i", ї: "i", є: "e", ґ: "g",
  ђ: "dj", ј: "i", љ: "lj", њ: "nj", ћ: "c", џ: "dz", ў: "u", ѣ: "e", ѳ: "f", ѵ: "i", ѧ: "ia",
};
const LATIN_FOLDS: [RegExp, string][] = [
  [/ph/g, "f"], [/th/g, "t"], [/kh/g, "h"], [/ch/g, "h"], [/ck/g, "k"], [/c/g, "k"], [/q/g, "k"],
  [/x/g, "ks"], [/w/g, "v"], [/y/g, "i"], [/j/g, "i"], [/ou/g, "u"], [/oo/g, "u"], [/ee/g, "i"],
  [/ae/g, "e"], [/ai/g, "e"], [/ei/g, "i"], [/oi/g, "i"], [/(.)\1+/g, "$1"],
];

/**
 * Reduces a name in Latin, Cyrillic or Greek letters to a rough Latin sound-alike,
 * so Иоанн, Ioann and Ιωάννης, or Георгий and Georgios, land close together.
 */
export function fold(input: string): string {
  let s = input.toLowerCase().normalize("NFD").replace(/\p{M}+/gu, "");
  for (const [g, l] of GREEK_DIGRAPHS) s = s.split(g).join(l);
  s = Array.from(s, (ch) => GREEK[ch] ?? CYRILLIC[ch] ?? ch).join("");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  for (const [re, to] of LATIN_FOLDS) s = s.replace(re, to);
  return s.replace(/\s+/g, " ").trim();
}

export const tokens = (s: string) => fold(s).split(" ").filter(Boolean);

function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenScore(q: string, t: string): number {
  if (t === q) return 4;
  if (t.startsWith(q)) return 3;
  if (q.length >= 4 && (withinOneEdit(q, t) || withinOneEdit(q, t.slice(0, q.length)))) return 1;
  return 0;
}

export interface PreparedEntry extends BurialIndexEntry {
  keys: string[];
  bornYear?: number;
  reposedYear?: number;
}

export function prepare(entries: BurialIndexEntry[]): PreparedEntry[] {
  return entries.map((e) => ({
    ...e,
    keys: Array.from(new Set([e.native, e.latin ?? "", ...(e.variants ?? [])].flatMap(tokens))),
    bornYear: e.born ? Number(e.born.slice(0, 4)) : undefined,
    reposedYear: e.reposed ? Number(e.reposed.slice(0, 4)) : undefined,
  }));
}

export interface SearchQuery {
  q?: string;
  section?: string;
  bornFrom?: number;
  bornTo?: number;
  reposedFrom?: number;
  reposedTo?: number;
}

const inYears = (y: number | undefined, from?: number, to?: number) =>
  (from == null && to == null) || (y != null && (from == null || y >= from) && (to == null || y <= to));

export function search(entries: PreparedEntry[], query: SearchQuery): PreparedEntry[] {
  const qTokens = query.q ? tokens(query.q) : [];
  const scored: { e: PreparedEntry; score: number }[] = [];
  for (const e of entries) {
    if (query.section && e.section !== query.section) continue;
    if (!inYears(e.bornYear, query.bornFrom, query.bornTo)) continue;
    if (!inYears(e.reposedYear, query.reposedFrom, query.reposedTo)) continue;
    let score = 0;
    let ok = true;
    for (const q of qTokens) {
      let best = 0;
      for (const t of e.keys) best = Math.max(best, tokenScore(q, t));
      if (!best) {
        ok = false;
        break;
      }
      score += best;
    }
    if (ok) scored.push({ e, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || (a.e.latin ?? a.e.native).localeCompare(b.e.latin ?? b.e.native))
    .map((s) => s.e);
}
