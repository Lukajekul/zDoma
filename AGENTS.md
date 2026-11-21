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
2. The feature works as the task describes. For UI work, check it at phone width (390 px).
3. Committed in the format above and pushed.
4. The task is marked `[x]` in `TASKS.md` with a one-line note.

## 5. Tech stack

| Area | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript, single app |
| UI | Tailwind CSS + shadcn/ui, mobile-first |
| Data | Supabase: Postgres, Realtime (live nurse dashboard), Storage (wound photos) |
| Triage | Pure TypeScript in `src/lib/triage/`: LACE score, red-flag rules, alert reasons, template summaries |
| Seed data | Synthea-generated or hand-written hip-replacement patients |
| Deploy | Cloudflare Workers via `@opennextjs/cloudflare` + `wrangler` |
| LLM | **None.** Summaries and plain-language letters come from templates and seed data. |

Don't add new dependencies or swap a stack choice without a task that says so.

## 6. Directory layout

```
src/
  app/
    patient/        patient app: check-in, pills, rehab, my recovery
    nurse/          nurse dashboard + patient detail
    demo/           QR entry for the live judge demo
    api/            route handlers
  components/
    ui/             shadcn/ui primitives (generated, don't hand-edit)
    patient/        patient-only components
    nurse/          nurse-only components
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

## 7. Safety

- Never commit secrets. Keys go in `.env.local` (gitignored). List new variable *names* in `.env.example`.
- Write database migrations as files. Apply them to the shared Supabase project only if your task explicitly says so.
- Don't deploy to production unless your task is the deploy task.
- All patient data is synthetic. Never use real patient data.

## 8. Next.js version note

The block below is written by Next.js (v16). `next dev` adds it back if it's removed, so leave it in place.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
