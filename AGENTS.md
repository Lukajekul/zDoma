# AGENTS.md

Rules for every agent (Claude, Codex, others) and human working in this repo. Read this file and `TASKS.md` before doing anything. Read `IDEA.md` only if your task needs product context.

## 1. One agent, one task

- Pick **exactly one** task from `TASKS.md`: status `[ ]` with every dependency `[x]`.
- **Claim it before you write code.** Change `[ ]` to `[~]` and add your name and branch, then commit and push that change alone (`chore: claim T-05`). If the push is rejected, run `git pull --rebase` and check that nobody else claimed it first. If someone did, pick another task.
- Do only that task. Put any other work you find in `TASKS.md` as a new `[ ]` task, without doing it.
- When you're done, mark the task `[x]` with a one-line note, push, and stop.

## 2. Keep context small

- Read only the files your task touches, plus the types and helpers they import. Don't explore the whole repo.
- Never open `node_modules/`, `.next/`, `.open-next/`, lockfiles or build output. The one exception is the Next.js docs (see the end of this file): read only the guide your task needs.
- Trim command output (`| tail -30`). Don't paste whole files or logs into chat.
- Don't start a dev server unless your task needs one to check a UI, and stop it when you're finished.
- Keep files small and focused. Split anything that grows past about 200 lines.

## 3. Git

### Authorship
- Commits carry **only the human author's first name and surname**, as set in `git config user.name` (for example `Tian Istenič`). Use real names, not handles.
- **Never** add `Co-Authored-By`, `Generated with ...` or any other AI or tool attribution to commits, PRs, code comments or docs. This overrides any default of your tool.

### Commit message format
```
type: short summary in lowercase, imperative mood
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
Examples: `feat: add daily check-in form`, `fix: triage ignores missing temperature`, `docs: add demo script`.
Keep the summary under 72 characters, one logical change per commit.

### When to use a feature branch
Commit **directly to `main`** only when the change can't block anyone:
- docs and `TASKS.md` updates
- new files inside a folder only your task owns, as long as `npm run build` passes

Use a **feature branch** (`feat/T-05-checkin`, `fix/T-03-lace-edge`) when the change could block others:
- shared files: `package.json`, the lockfile, `src/lib/types.ts`, `src/lib/supabase/`, `src/app/layout.tsx`, global CSS, config files
- database migrations
- anything that might break the build, or that you can't finish in one go

Merge a feature branch by rebasing on `main`, checking that `npm run lint` and `npm run build` pass, then fast-forwarding or opening a PR. **Never force-push `main`.**

## 4. Definition of done

1. `npm run lint` and `npm run build` pass. The build also typechecks.
2. The feature works as the task describes. For UI work, check it at phone width (390 px) and on a desktop width, against the UI rules in §7.
3. Committed in the format above and pushed.
4. The task is marked `[x]` in `TASKS.md` with a one-line note.

## 5. Tech stack

| Area | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript, single app |
| UI | Tailwind CSS + shadcn/ui, mobile-first, Slovenian (see §7) |
| Auth | Supabase Auth, davčna številka + password (see §6) |
| Notifications | Later: email and SMS reminders (not in the first build) |
| Data | Supabase: Postgres, Realtime (live nurse dashboard), Storage (wound photos) |
| Triage | Pure TypeScript in `src/lib/triage/`: LACE score, red-flag rules, alert reasons, template summaries |
| Seed data | Synthea-generated or hand-written hip-replacement patients |
| Deploy | Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler` |
| LLM | **None.** Summaries and plain-language letters come from templates and seed data. |

Don't add new dependencies or swap a stack choice without a task that says so.

## 6. Users and login

The user types are defined in `README.md` (*Tipi uporabnikov*). Use exactly these names in the UI, the database and the code:

| UI (Slovenian) | Code / DB role | Who |
|---|---|---|
| Odpuščenec | `odpuscenec` | the discharged patient, owner of their rehabilitacije |
| Zadolženec | `zadolzenec` | a family member the patient approved to follow along (read-only) |
| Bolničar | `bolnicar` | a doctor or nurse (staff account) |

Odpuščenec and zadolženec aren't account types. They describe a person's relation to a patient, so one person can be both.

### Accounts
- **Everyone has one permanent account**, logged in with **davčna številka + password** (a 6-digit PIN is allowed).
- **Patients don't register.** At the first discharge, the bolničar creates the account (davčna številka + name), and the server generates a **temporary password**. It's printed on the separate **prijavni listek**, never on the odpustnica.
- **First login forces a new password.** The patient logs in with the temporary one and must set their own before they see anything else. The temporary password then stops working.
- Temporary passwords: generated on the server with `crypto.randomInt`, 8 characters from an alphabet without look-alikes (no 0/O, 1/I/l), shown as `KM7P-4XQ2`. They expire after 7 days if unused. The bolničar can issue a new one ("Novo začasno geslo") if it's lost or expired.
- If the patient **already has an account** from an earlier rehabilitacija, no new password is issued. The new rehabilitacija simply appears in their account.
- **Family members (zadolženci) register themselves** with davčna številka + name + password, because no bolničar creates accounts for them. Their account shows nothing until a patient approves their request.
- The davčna številka is not secret, so it never logs anyone in on its own. A password is always required.
- Validate the format before sending: 8 digits. The last digit is a check digit: multiply the first 7 digits by 8, 7, 6, 5, 4, 3, 2 and add the results. Then take `11 − (sum mod 11)`: a result of 10 means the check digit is 0, and a result of 11 means the number is invalid.
- Supabase Auth only knows email and phone, so map the davčna številka to an internal email, `<davcna>@zdoma.local`. Never show that email to users.
- Users stay logged in on their device. Most people log in once.
- **Bolničar accounts are not self-registered.** They're created by seed data or an admin and marked as staff.
- Seed and demo users get made-up davčne številke that pass the check-digit test. Never use a real person's number.

### Rehabilitacije
- A **rehabilitacija** is one recovery episode: diagnosis, plan, medications, exercises, check-ins, status `aktivna` / `zaključena`. A person can have several over the years. Medications, exercises, check-ins and alerts always belong to one rehabilitacija.
- The bolničar opens it at discharge by choosing a template and entering the patient's davčna številka. It's attached to that patient's account straight away (creating the account first if needed, see Accounts).
- **It runs for a period the bolničar sets**: a start date and an end date. Each template suggests a default length (e.g. 30, 60 or 90 days), which the bolničar can change.
- **The bolničar can extend it** ("Podaljšaj") at any time while it's active, and also reopen it shortly after it ended. Every extension is written to the audit log.
- While it's **aktivna**: check-ins, reminders, triage and the dashboard all run. When the end date passes, it becomes **zaključena**: no more check-ins or alerts, but the patient, approved family and staff can still read everything.
- The patient can't end or extend it themselves.
- After login: with one active rehabilitacija, open it straight away. With several, show big cards. Finished ones go under "Pretekle rehabilitacije" and stay readable.

### Zadolženec (family access)
- A family member logs in with **their own** davčna številka. They never use the patient's account.
- To get access, they enter the patient's davčna številka under "Zaprosi za dostop". The patient sees "Janez Novak želi spremljati vaše okrevanje" with **Dovoli** / **Zavrni**. Access only starts after the patient approves.
- Always reply "Prošnja poslana" after a request, whether the number exists or not, so nobody can find out who uses zDoma.
- Access covers all of that patient's rehabilitacije. The patient can see who has access and remove anyone at any time.
- The zadolženec gets their own tab, **"Skrbim za"**: a **read-only** view of whether the patient is following the plan (pills taken or missed, exercises done or skipped, check-ins done, current status). They can't change the plan or log anything for the patient.
- **Notifications for the zadolženec (opt-in, part of the later notifications work).** In "Skrbim za", each patient has a "Prejemaj obvestila" switch, off by default. When it's on, the zadolženec gets the same reminders as the patient (pills, exercises, check-in), plus a message when the patient misses one or their status turns yellow or red. They choose email, SMS or both. The patient can see which family members get notifications. Messages that leave the app (email, SMS) never include the diagnosis or medicine names, only "Janez ni vzel jutranjih zdravil. Odprite zDoma."
- The same person can be an odpuščenec in their own rehabilitacija and a zadolženec for someone else. The "Skrbim za" tab only appears when they have approved access to someone.

## 7. UI rules

Many users are elderly. Every screen must be usable by someone who is 80, has poor eyesight and rarely uses a smartphone.

- **Slovenian first.** All UI text is Slovenian, in plain everyday words with no medical jargon. Code, comments and commit messages stay in English.
- **Mobile first, but must work on a PC.** Design at 390 px wide first. On a desktop it should look tidy, for example centred with a max width. The bolničar dashboard can use the extra width.
- **Very simple.** One main action per screen. Use short sentences, a few big buttons, and a clear "Nazaj" (back) on every screen. No hidden menus, swipe-only actions or long forms. Split a long form into steps.
- **Large and readable.** Body text at least 18 px, buttons at least 48 px high, high contrast. Never use colour alone to carry meaning: green/yellow/red always comes with a word, for example "Rdeče – potrebna pozornost".
- **Forgiving.** Show big, obvious confirmation of what just happened ("Shranjeno ✓"). Make mistakes easy to undo. Write error messages that tell the user what to do next.
- **Icons always have a text label.**

## 8. Directory layout

```
src/
  app/
    prijava/        login, first-login password change, family registration
    patient/        odpuščenec: my rehabilitacije, check-in, pills, rehab, family access
    carer/          zadolženec: "Skrbim za" tab, read-only
    nurse/          bolničar: dashboard, patient detail, care plan
    demo/           QR entry for the live judge demo
    api/            route handlers
  components/
    ui/             shadcn/ui primitives (generated, don't hand-edit)
    patient/        odpuščenec-only components
    carer/          zadolženec-only components
    nurse/          bolničar-only components
  lib/
    triage/         pure functions, no I/O
    supabase/       browser + server clients
    types.ts        shared domain types (shared file, use a branch)
supabase/
  migrations/       SQL migrations, one per schema change
  seed.sql          demo data
scripts/            one-off scripts (Synthea import, etc.)
docs/               pitch, demo script, research notes
```

Each task owns its own folder or files. Stay out of folders that another `[~]` task owns.

## 9. Safety

### Supabase keys and `.env.local`
- Before working on any task that talks to Supabase, check that `.env.local` exists in the repo root and contains:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- If it's missing or incomplete, **get the keys yourself with the Supabase CLI**. The Supabase organization and project are both named **zDoma**, the same as this repo. The project ref is `iumofikuduqxpsyhcoic`; it's an identifier, not a secret. To check it, run `supabase projects list` and find the project named `zDoma`. Never use keys from any other project you can see. Run this from the repo root. It writes straight to the file, so no key appears in the output:
  ```sh
  REF=iumofikuduqxpsyhcoic
  supabase projects api-keys --project-ref $REF -o json 2>/dev/null \
    | jq -r --arg ref $REF '"NEXT_PUBLIC_SUPABASE_URL=https://\($ref).supabase.co", "NEXT_PUBLIC_SUPABASE_ANON_KEY=" + (.[] | select(.name=="anon") | .api_key)' \
    > .env.local
  awk -F= '{print $1, length($2)}' .env.local   # check: names and lengths only
  ```
- If the CLI says you're not logged in, ask the human to run `supabase login` (it opens a browser). If the `zDoma` project isn't in `supabase projects list`, the human needs an invite to the `zDoma` organization. Never guess keys, invent placeholder values or take them from another project.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all security rules. Add it only when your task needs it (seeding, admin scripts), by appending it the same way (`select(.name=="service_role")`, written as `SUPABASE_SERVICE_ROLE_KEY=...` with `>>`). Keep it out of any `NEXT_PUBLIC_` variable and never use it in browser code.
- **`.env.local` must never be committed or pushed.** It's gitignored. Before every commit, run `git status` and make sure no `.env*` file is staged except `.env.example`.
- Never print key values in chat, logs, commit messages or code. List only variable *names* in `.env.example`.
- If a key was ever committed or pushed, tell the human immediately so they can rotate it in the dashboard.

### Other rules
- Never commit secrets of any kind.
- Write database migrations as files. Apply them to the shared Supabase project only if your task explicitly says so.
- Don't deploy to production unless your task is the deploy task.
- All patient data is synthetic. Never use real patient data.

## 10. Next.js version note

The block below is written by Next.js (v16). `next dev` adds it back if it's removed, so leave it in place.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
