// The declaration wording exists twice on purpose: declaration_texts holds the
// plain sentence as the evidence record, app/lib/declarations.js holds the same
// sentence with the bold and link markup the screen needs.
//
// "If the transfer is ever challenged, this is the screen produced in evidence."
// That only holds if the two stay identical. Run this after any wording change.
//
//   node scripts/check-declarations.mjs
import { readFileSync } from "node:fs";
// The app is not "type": "module", so Node reads a bare .js as CommonJS.
// declarations.js has no imports of its own, so loading its source as an ES
// module keeps one copy of the wording rather than duplicating it here.
const declSrc = readFileSync(new URL("../app/lib/declarations.js", import.meta.url), "utf8");
const { TEXTS, plain, MANDATORY, OPTIONAL } = await import(
  "data:text/javascript;base64," + Buffer.from(declSrc).toString("base64")
);

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const rows = await fetch(`${url}/rest/v1/declaration_texts?select=key,version,body`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
}).then((r) => r.json());

let bad = 0;
for (const k of [...MANDATORY, ...OPTIONAL]) {
  const db = rows.filter((r) => r.key === k).sort((a, b) => b.version - a.version)[0];
  const ui = plain(TEXTS[k]);
  if (!db || db.body !== ui) {
    bad++;
    console.error(`MISMATCH ${k}\n  db: ${db?.body}\n  ui: ${ui}`);
  } else {
    console.log(`ok  ${k.padEnd(16)} v${db.version}`);
  }
}
if (bad) { console.error(`\n${bad} wording(s) have drifted from the database`); process.exit(1); }
console.log("\nall nine match the database exactly");
