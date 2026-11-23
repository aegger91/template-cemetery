// Prepares static files from content/ before dev and build:
//   public/data/burials/index.json          compact rows for search
//   public/data/burials/records/<id>.json   one file per grave
//   public/favicon.svg, public/images/logo-square.svg   drawn from the shared cross geometry
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (...p) => JSON.parse(readFileSync(path.join(root, ...p), "utf8"));

const dir = path.join(root, "content", "burials");
const records = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .flatMap((f) => read("content", "burials", f).records);

const seen = new Set();
for (const r of records) {
  if (seen.has(r.id)) throw new Error(`Duplicate burial id: ${r.id}`);
  seen.add(r.id);
}

const out = path.join(root, "public", "data", "burials");
rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "records"), { recursive: true });

const index = records.map((r) => {
  const row = { id: r.id, native: r.name.native, section: r.section, row: r.row, plot: r.plot };
  if (r.name.latin) row.latin = r.name.latin;
  if (r.name.variants?.length) row.variants = r.name.variants;
  if (r.title) row.title = r.title;
  if (r.born) row.born = r.born;
  if (r.reposed) row.reposed = r.reposed;
  if (r.sample) row.sample = true;
  if (r.notable) row.notable = true;
  return row;
});
writeFileSync(path.join(out, "index.json"), JSON.stringify({ count: index.length, records: index }));
for (const r of records) writeFileSync(path.join(out, "records", `${r.id}.json`), JSON.stringify(r));

const g = read("src", "components", "cross-geometry.json").slavic;
const tokens = read("content", "tokens.json").color;
const shapes = (fill) =>
  [
    ...g.rects.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${fill}"/>`),
    ...g.polygons.map((p) => `<polygon points="${p}" fill="${fill}"/>`),
  ].join("");

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="${tokens.green}"/><circle cx="32" cy="32" r="27.5" fill="none" stroke="${tokens.goldSoft}" stroke-width="1.5"/><g transform="translate(20.6 13) scale(0.38)">${shapes(tokens.goldSoft)}</g></svg>\n`;
writeFileSync(path.join(root, "public", "favicon.svg"), favicon);

mkdirSync(path.join(root, "public", "images"), { recursive: true });
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="14" fill="${tokens.green}"/><rect x="7" y="7" width="106" height="106" rx="9" fill="none" stroke="${tokens.goldSoft}" stroke-width="1.5"/><g transform="translate(36 20) scale(0.8)">${shapes(tokens.goldSoft)}</g></svg>\n`;
writeFileSync(path.join(root, "public", "images", "logo-square.svg"), square);

console.log(`build-data: ${records.length} burial records, favicon and square logo written`);
