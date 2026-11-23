// Checks every content file against its JSON Schema: npm run validate
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const f of readdirSync(path.join(root, "schemas"))) {
  const schema = read(`schemas/${f}`);
  ajv.addSchema(schema, f);
}

const jobs = [
  ["content/site.json", "site.schema.json"],
  ["content/tokens.json", "tokens.schema.json"],
  ["content/navigation.json", "navigation.schema.json"],
  ["content/grounds.json", "grounds.schema.json"],
  ["content/services.json", "services.schema.json"],
  ["content/funds.json", "funds.schema.json"],
  ["content/announcements.json", "announcements.schema.json"],
  ["content/sources.json", "sources.schema.json"],
  ...readdirSync(path.join(root, "content/pages")).map((f) => [`content/pages/${f}`, "page.schema.json"]),
  ...readdirSync(path.join(root, "content/burials")).map((f) => [`content/burials/${f}`, "burials.schema.json"]),
  ...readdirSync(path.join(root, "content/i18n")).map((f) => [`content/i18n/${f}`, "ui.schema.json"]),
];

let failed = 0;
for (const [file, schema] of jobs) {
  const validate = ajv.getSchema(schema);
  if (!validate) throw new Error(`Missing schema ${schema}`);
  if (!validate(read(file))) {
    failed++;
    console.error(`\n${file}`);
    for (const e of validate.errors ?? []) console.error(`  ${e.instancePath || "/"} ${e.message}`);
  }
}
if (failed) {
  console.error(`\n${failed} file(s) failed validation`);
  process.exit(1);
}
console.log(`validate: ${jobs.length} content files match their schemas`);
