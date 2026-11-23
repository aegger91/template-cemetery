/**
 * Loads every published page in every language at 360 / 768 / 1280 and flags
 * text that overflows its box or overlaps another text box.
 * Usage: BASE=http://127.0.0.1:4318 node scripts/check-language-fit.mjs
 */
import { chromium } from "playwright-core";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://127.0.0.1:4318";
const root = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(readFileSync(path.join(root, "content/site.json"), "utf8"));
const langs = site.languages.map((l) => l.code);
const pages = readdirSync(path.join(root, "content/pages"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(root, "content/pages", f), "utf8")).slug)
  .map((slug) => (slug ? `${slug}/` : ""));
const widths = [360, 768, 1280];

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox"],
});

const problems = [];
let views = 0;

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const lang of langs) {
    for (const p of pages) {
      views++;
      const url = `${BASE}/${lang}/${p}`;
      await page.goto(url, { waitUntil: "networkidle" });
      if (p.includes("announcements/detail")) {
        await page.goto(`${url}?id=radonitsa`, { waitUntil: "networkidle" });
      }
      if (p.includes("find-a-grave/record")) {
        await page.goto(`${url}?id=sample-n01`, { waitUntil: "networkidle" });
      }
      await page.waitForTimeout(80);
      const found = await page.evaluate(() => {
        const out = [];
        const nodes = [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,label,span,li,td,th,legend")];
        const boxes = [];
        for (const el of nodes) {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
          if (el.classList.contains("sr-only") || style.position === "absolute" && (parseFloat(style.width) < 2 || style.clipPath === "inset(50%)" || style.clip === "rect(0px, 0px, 0px, 0px)")) continue;
          if (!el.childNodes.length) continue;
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!hasText && !["A", "BUTTON", "LABEL"].includes(el.tagName)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          const clipped =
            el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
          if (clipped && style.overflow !== "visible" && style.overflowX !== "visible") {
            // allow intentional truncate utilities
            if (!style.textOverflow || style.textOverflow === "clip") {
              if (!(style.overflow === "hidden" && el.className.toString().includes("truncate"))) {
                out.push({
                  kind: "clip",
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent || "").trim().slice(0, 80),
                  sw: el.scrollWidth,
                  cw: el.clientWidth,
                  sh: el.scrollHeight,
                  ch: el.clientHeight,
                });
              }
            }
          }
          if (hasText) boxes.push({ el, r, text: (el.textContent || "").trim().slice(0, 60) });
        }
        // overlap among leaf-ish text boxes in the header only (high-signal)
        const header = document.querySelector("header");
        if (header) {
          const headerBoxes = boxes.filter((b) => header.contains(b.el) && b.r.width > 8 && b.r.height > 8);
          for (let i = 0; i < headerBoxes.length; i++) {
            for (let j = i + 1; j < headerBoxes.length; j++) {
              const a = headerBoxes[i].r;
              const b = headerBoxes[j].r;
              const overlap =
                Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
              if (overlap > 24 && !headerBoxes[i].el.contains(headerBoxes[j].el) && !headerBoxes[j].el.contains(headerBoxes[i].el)) {
                out.push({
                  kind: "overlap",
                  a: headerBoxes[i].text,
                  b: headerBoxes[j].text,
                  overlap: Math.round(overlap),
                });
              }
            }
          }
        }
        const docOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        return { out: out.slice(0, 12), docOverflow };
      });
      if (found.docOverflow || found.out.length) {
        problems.push({ w, lang, url: page.url(), docOverflow: found.docOverflow, issues: found.out });
      }
    }
  }
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify({ views, problemViews: problems.length, problems }, null, 2));
if (problems.length) process.exitCode = 1;
