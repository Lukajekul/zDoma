# AGENTS.md

Rules for every agent (Claude, Codex, others) and human working in this repo. Read this file and `TASKS.md` before doing anything. Read `IDEA.md` only if your task needs product context.

## 1. One agent, one task

- Pick **exactly one** task from `TASKS.md`: status `[ ]` with every dependency `[x]`.
- **Claim it before you write code.** Change `[ ]` to `[~]` and add your name and branch, then commit and push that change alone (`chore: claim T-05`). If the push is rejected, run `git pull --rebase` and check that nobody else claimed it first. If someone did, pick another task.
- Do only that task. Put any other work you find in `TASKS.md` as a new `[ ]` task, without doing it.
- When you're done, mark the task `[x]` with a one-line note, push, and stop.
- **Work in your own copy of the repo.** Several agents run on the same machines, and two agents in one folder switch branches and overwrite files under each other. Start in a fresh git worktree (`git worktree add ../zDoma-T-05 -b feat/T-05-checkin`) or your own clone, never in a folder another agent is using. Remove the worktree when the task is done.
- **Edit only your own lines in `TASKS.md`** (your claim, your status, new tasks at the end of a section). If a rebase conflicts there, keep both sides.
- **Stale claims:** if a `[~]` task has had no commits for about 2 hours, ask the human before taking it over. Never silently take over someone's task.
- If you get stuck or the task turns out to be wrong, write what you found next to the task in `TASKS.md`, set it back to `[ ]`, push and stop. Don't leave a `[~]` behind.

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

## 3a. Tests: only the must-haves

Tests cost time and tokens, so keep them minimal.
- **Write tests only for pure logic where a bug is dangerous:** triage rules and status (`src/lib/triage/`), the davčna številka check digit, temporary-password generation, medicine days-left (`src/lib/erecept/`), and a check that every template in `src/lib/templates/` is valid. A few cases each: one normal, one red flag, one edge case.
- **No other tests:** no UI or component tests, no snapshots, no end-to-end tests, no tests for Supabase calls or simple pages.
- Use Vitest, added by the first task that needs it (T-04). Run it quietly: `npx vitest run --reporter=dot 2>&1 | tail -15`.
- Don't add tests beyond these unless the task says so.

## 4. Definition of done

1. `npm run lint` and `npm run build` pass. The build also typechecks. If your task touched code covered by §3a, its tests pass too.
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
| Templates | One data file per patient group in `src/lib/templates/` (see §5a) |
| Triage | Pure TypeScript in `src/lib/triage/`: LACE score, evaluates a template's rules, alert reasons, template summaries |
| Seed data | Hand-written (or Synthea-based) patients across all six templates, mostly heart failure |
| Package manager | **npm only.** Never use yarn, pnpm or bun: a second lockfile breaks everyone's install. |
| Deploy | Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler` |
| LLM | **None.** Summaries and plain-language letters come from templates and seed data. |

Don't add new dependencies or swap a stack choice without a task that says so.

## 5a. Patient groups, templates and triage

Background and sources: `docs/research.md`. Six templates, heart failure is the main one and the demo story:

| Template id | Slovenian name |
|---|---|
| `srcno-popuscanje` | Srčno popuščanje (main) |
| `srce-po-infarktu` | Po infarktu ali operaciji srca |
| `kolk-koleno` | Nov kolk ali koleno |
| `kopb` | KOPB |
| `mozganska-kap` | Možganska kap |
| `rak-sistemsko` | Rak na sistemskem zdravljenju |

- **A template is data, not code**: check-in questions, red-flag rules (with a Slovenian reason text), recommended medicines (each with its usual dose options, times of day and a plain-language "what it's for", sourced from `docs/medicines.md`), exercises, default rehabilitacija length in days. One file per template in `src/lib/templates/`.
- **No condition-specific code anywhere else.** Screens render whatever the template lists. `src/lib/triage/` evaluates whatever rules the template lists. Adding a template must never need a new screen.
- **Every alert has a reason** a nurse can read, e.g. "Teža +2,5 kg v 3 dneh".
- **Emergency answers go to 112 first.** Chest pain, sudden severe breathlessness, fainting or stroke signs show a full-screen "Pokličite 112" before anything is saved or sent. For cancer, fever ≥38 °C shows the ward's phone number. zDoma is never presented as an emergency service.
- **Decision support, not diagnosis.** The app never tells a patient what they have or to change a dose. It tells them to call, and it tells staff who to look at.
- Thresholds come from `docs/research.md`. Don't invent medical rules. If one is missing, add a task to check it.

### What makes a patient keep using it
- **"Danes", not menus.** The patient's home is today's next action, one at a time, ending with "Končano za danes ✓".
- **Give something back every day,** against the patient's own numbers ("72,4 kg – blizu vaše ciljne teže ✓", "Dan 6 od 30"), never a diagnosis.
- **A real person behind it.** When a nurse acts, the patient sees her name and what happens next ("Sestra Mojca vas bo poklicala danes do 12:00").
- **Medicine changes first.** At discharge the pill list shows Novo / Spremenjeno / Ukinjeno against the medicines before admission, with a photo of each box.
- **Set up at the first home visit.** The patronažna sestra logs the patient in on their phone and does the first check-in with them.

### Check-in: simple and specific to the patient
- **One tap per answer.** Big buttons only: no typing, no sliders, no free text. Weight is a row of buttons around the patient's last weight, with "Drugo" for a number field.
- **Short.** At most 5 questions a day, one per screen.
- **"Enako kot včeraj".** When yesterday was green, one tap answers everything the same as yesterday, except questions the template marks `vednoVprasaj` (e.g. weight for heart failure).
- **Specific to this patient, not general.** The template lists the possible questions. The bolničar ticks which ones this patient gets at discharge, and questions use the patient's own values (dry weight, their medicine names), e.g. "Ali tehtate več kot 72 kg?" instead of "Kakšna je vaša teža?".

### Medicines picked up (eRecept)
- Every medicine shows whether it was picked up at the pharmacy. For the hackathon the source is a mock in `src/lib/erecept/`; in production it comes from eRecept via CEZIH.
- Not picked up → reminder to the patient, then the zadolženec is alerted, then the bolničar gets an alert with a reason ("Furosemid ni prevzet 3 dni po odpustu").
- Days left = pack size from the pick-up ÷ daily dose. A few days before they run out, the patient sees "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept." It never suggests changing a dose.

### Keep the bolničar's work minimal
- **Medicines in a few taps.** At discharge the template's recommended medicines are listed, pre-filled with what the patient already takes (eRecept). The bolničar ticks a medicine and taps one of its usual doses (e.g. Furosemid 20 / 40 / 80 mg, zjutraj). "Uredi" changes dose, times or duration, "Dodaj zdravilo" adds any other medicine. These are suggestions for staff only; the patient never sees dose options. Usual doses come from `docs/medicines.md`, never invented.
- Opening a rehabilitacija takes about a minute: template + davčna številka + changes. Everything else is pre-filled from the template.
- The dashboard shows only patients who need action. Green patients are hidden by default.
- **Patronažne sestre are assigned by address, not by hand.** Each one covers tereni (občina, optionally naselja). At discharge the app suggests the nurse whose teren covers the patient's address; the bolničar confirms with one tap. No match → "Nedodeljeni", which any nurse can take with "Prevzemi". "Nadomeščanje" hands her patients to a colleague until a date. The hospital nurse who opens the rehabilitacija is not the default.
- A patronažna (travelling) sestra may follow many patients, so the list must be easy to filter on her phone: search, "Moji pacienti" on by default, status, občina/kraj, template, missed check-in, medicines not picked up. Filters are big labelled chips, kept in the URL, with "Počisti filtre".
- The app chases the patient, not the nurse: a missed check-in reminds the patient, then the zadolženec, and only then reaches staff.
- Actions are one tap ("Poklicano – vse v redu", "Naročen pregled", "Obveščen osebni zdravnik") and write the audit log automatically.

## 6. Users and login

The user types are defined in `README.md` (*Tipi uporabnikov*). Use exactly these names in the UI, the database and the code:

| UI (Slovenian) | Code / DB role | Who |
|---|---|---|
| Odpuščenec | `odpuscenec` | the discharged patient, owner of their rehabilitacije |
| Zadolženec | `zadolzenec` | a family member the patient approved to follow along and help (can mark tasks done with the patient, can't change the plan) |
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
- **QR login card (prijavna kartica) for patients.** Every patient gets a card with a personal QR code (printed with the prijavni listek, reprinted any time). Scanning it with the phone camera opens zDoma with the davčna številka already filled in, so the patient only types their PIN. **The QR never logs in on its own: the PIN is always required**, because a lost card must not open someone's health data.
  - The QR holds a random token (at least 128 bits, `crypto.randomBytes`), stored only as a hash, in the URL fragment (`/prijava/qr#<token>`) so it doesn't end up in server logs.
  - "Nova prijavna kartica" (bolničar, or the patient in settings) issues a new token; the old card stops working at once. Written to audit_log.
  - 5 wrong PINs → the card is locked for 15 minutes and the screen says "Pokličite svojo patronažno sestro" if it keeps happening.
  - On the first login, the QR + temporary password leads straight to setting the PIN.
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
- The zadolženec gets their own tab, **"Skrbim za"**: whether the patient is following the plan (pills taken or missed, exercises done or skipped, check-ins done, current status).
- **When they do a task together with the patient, the zadolženec can mark it**: "Vzeto" for pills, "Opravljeno" for exercises, and the check-in answered with the patient. Every entry stores who entered it (`entered_by`) and shows it to the patient and staff, e.g. "Označila: Ana (hčerka)". The "Pokličite 112" screen works the same on their phone.
- They **can't** change the plan, medicines or end date, approve other family members, or undo the patient's own entries.
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
- **Slovenian formats.** Dates as `21. 11. 2026`, times as `8:00`, decimal comma (`74,5 kg`), via `Intl` with the `sl-SI` locale. All "today" and reminder times use the `Europe/Ljubljana` time zone, never the server's or UTC.

## 8. Directory layout

```
src/
  app/
    prijava/        login, first-login password change, family registration
    patient/        odpuščenec: my rehabilitacije, check-in, pills, rehab, family access
    carer/          zadolženec: "Skrbim za" tab, marking tasks with the patient
    nurse/          bolničar: dashboard, patient detail, care plan
    demo/           QR entry for the live judge demo
    api/            route handlers
  components/
    ui/             shadcn/ui primitives (generated, don't hand-edit)
    patient/        odpuščenec-only components
    carer/          zadolženec-only components
    nurse/          bolničar-only components
  lib/
    templates/      one data file per patient group (§5a)
    triage/         pure functions, no I/O
    supabase/       browser + server clients
    types.ts        shared domain types, the source of truth for the data model (shared file, use a branch)
    database.types.ts  generated from the database, never hand-edited
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
- **Database migrations** go in `supabase/migrations/` as files, on a feature branch. Everyone shares one database, so:
  1. Merge the branch to `main` first.
  2. **Ask the human for approval**, then apply it: `supabase link --project-ref iumofikuduqxpsyhcoic` (once), then `supabase db push`.
  3. Regenerate the types: `supabase gen types typescript --project-id iumofikuduqxpsyhcoic > src/lib/database.types.ts`, and commit them.
  4. Never edit a migration that's already applied. Write a new one. Never run `supabase db reset` or drop tables on the shared project.
- Every table has row-level security switched on, with policies matching §6: a patient sees their own data, an approved zadolženec can read and add task logs and check-ins for that patient (with `entered_by`) but change nothing else, staff see everything.
- Don't deploy to production unless your task is the deploy task.
- All patient data is synthetic. Never use real patient data.

## 10. Next.js version note

The block below is written by Next.js (v16). `next dev` adds it back if it's removed, so leave it in place.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
