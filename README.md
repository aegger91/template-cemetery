# St. Example Orthodox Cemetery

Sample website template for an Orthodox cemetery. Generic brand name. All burial records are fictional samples.

## Run locally

```bash
npm install
npm run validate   # content against JSON Schemas
npm run dev        # http://127.0.0.1:4317
```

Static production build (plain host, no Node server needed):

```bash
npm run build      # writes out/
npm run preview    # serves out/ on port 4318
```

## What clients edit

Content lives under `content/`. Pages are JSON lists of sections you can turn on, off or reorder. Localized fields are either a string or `{ "en": "...", "ru": "...", "el": "..." }` with fallback to the default language. Design tokens are in `content/tokens.json`. Schemas are in `schemas/`.

Demo languages: English, Russian, Greek (`content/site.json`).

## Sections worth knowing

- **Find a grave** searches a static register (`public/data/burials/`, built from `content/burials/`).
- **Donate** is a fund picker. Raised totals are optional (`fundTotals` section, off by default) and only appear when a payment totals provider is connected.
- **Visiting info** is a short placeholder block clients fill in themselves (`enabled: false` to hide it).
- Forms post to `forms.endpoint` in `site.json`, or stay in demo mode with no endpoint.

This template does not ship catechesis, funeral how-tos or etiquette guides. Clients add that content later if they want it.

## Images

Public-domain Prokudin-Gorskii photographs (Wikimedia Commons). Credits: `SOURCES.md` and `content/sources.json`. Grave photos use drawn Orthodox-cross placeholders.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run data` | Merge burial JSON into the public search index |
| `npm run sample-burials` | Regenerate the large fictional sample register |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
