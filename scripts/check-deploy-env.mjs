// Runs before the Cloudflare build. OpenNext copies .env, .env.production,
// .env.local and .env.production.local into the Worker bundle, so a server-only
// secret in those files would ship inside the code. Keep it in
// .env.development.local (dev) and as a Worker secret (production).
import { existsSync, readFileSync } from "node:fs";

const SECRETS = ["SUPABASE_SERVICE_ROLE_KEY", "VAPID_PRIVATE_KEY"];
const FILES = [".env", ".env.production", ".env.local", ".env.production.local"];

const problems = FILES.filter(existsSync).flatMap((file) => {
  const names = readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.split("=")[0].trim());
  return SECRETS.filter((s) => names.includes(s)).map((s) => `${s} in ${file}`);
});

if (problems.length) {
  console.error(
    `Stop: server secrets would be bundled into the Worker:\n  ${problems.join("\n  ")}\n` +
      "Move them to .env.development.local and set them with `npx wrangler secret put <NAME>`.",
  );
  process.exit(1);
}
