# CI and automatic deploys

`.github/workflows/ci.yml` runs on GitHub Actions:

| When | What |
|---|---|
| Every pull request | `npm run lint`, Vitest, `npm run build` |
| Every push to `main` | the same checks, then `npm run deploy` to Cloudflare Workers |
| By hand | Actions → CI → "Run workflow" (deploys if run on `main`) |

A deploy only starts when the checks pass. A newer push cancels older checks, but never a deploy that has already started.

Live site: https://zdoma.tian-istenic34.workers.dev

## One-time setup

A repo admin adds these under **Settings → Secrets and variables → Actions**.

**Secrets** (hidden):

| Name | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → template **"Edit Cloudflare Workers"**, limited to the account that hosts `zdoma` |
| `CLOUDFLARE_ACCOUNT_ID` | `npx wrangler whoami`, or the Workers overview page in the dashboard |

**Variables** (public values, they ship to the browser anyway):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as in `.env.local` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | same as in `.env.local` (needed for push reminders) |

Or with the GitHub CLI, from the repo root (an admin, values read from `.env.local`, nothing printed):

```sh
for n in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_VAPID_PUBLIC_KEY; do
  grep "^$n=" .env.local | cut -d= -f2- | gh variable set "$n"
done
gh secret set CLOUDFLARE_API_TOKEN      # paste the token when asked
gh secret set CLOUDFLARE_ACCOUNT_ID     # paste the account id when asked
```

## Server secrets

`SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY` and `CRON_SECRET` are **not** in GitHub. They stay Worker secrets (`npx wrangler secret put <NAME>`, AGENTS.md §9) and survive every deploy. Never add them as GitHub variables.

## When a deploy fails

- "Missing repo secrets/variables": add the names listed in the error, then re-run the job.
- Authentication errors from wrangler: the API token expired or lacks Workers edit rights. Create a new one.
- Build errors: the same as `npm run build` locally; fix on a branch and push.
