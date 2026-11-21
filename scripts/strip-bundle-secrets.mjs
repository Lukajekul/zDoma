// Runs after `opennextjs-cloudflare build`, before preview/deploy.
// OpenNext copies every .env* value (for production, development and test)
// into .open-next/cloudflare/next-env.mjs, which ships inside the Worker.
// Server secrets must come from Worker secrets instead
// (`npx wrangler secret put <NAME>`), so remove them here and then make sure
// no secret value is left anywhere in the bundle.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const SECRETS = ["SUPABASE_SERVICE_ROLE_KEY", "VAPID_PRIVATE_KEY", "SEED_PASSWORD", "CRON_SECRET"];
const BUNDLE = ".open-next";
const ENV_MODULE = path.join(BUNDLE, "cloudflare", "next-env.mjs");

if (!existsSync(ENV_MODULE)) {
  console.error(`Missing ${ENV_MODULE}: run opennextjs-cloudflare build first.`);
  process.exit(1);
}

// 1. Drop secret keys from every mode in next-env.mjs.
const stripped = readFileSync(ENV_MODULE, "utf8").replace(
  /^export const (\w+) = (\{.*\});$/gm,
  (_, mode, json) => {
    const vars = JSON.parse(json);
    for (const name of SECRETS) delete vars[name];
    return `export const ${mode} = ${JSON.stringify(vars)};`;
  },
);
writeFileSync(ENV_MODULE, stripped);

// 2. Collect secret values from local env files and scan the whole bundle for them.
const values = [".env", ".env.local", ".env.production", ".env.production.local", ".env.development.local", ".dev.vars"]
  .filter(existsSync)
  .flatMap((file) => readFileSync(file, "utf8").split("\n"))
  .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
  .filter((m) => m && SECRETS.includes(m[1]) && m[2].length >= 16)
  .map((m) => m[2].replace(/^["']|["']$/g, ""));

function* files(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else yield full;
  }
}

const leaks = [];
for (const file of files(BUNDLE)) {
  const content = readFileSync(file);
  if (values.some((v) => content.includes(v))) leaks.push(file);
}

if (leaks.length) {
  console.error(`Stop: a server secret is still in the Worker bundle:\n  ${leaks.join("\n  ")}`);
  process.exit(1);
}
console.log(`Bundle checked: no server secrets (${SECRETS.join(", ")}).`);
