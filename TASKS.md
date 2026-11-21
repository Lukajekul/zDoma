# TASKS.md

Status: `[ ]` open · `[~]` claimed (name, branch) · `[x]` done (one-line note).
Rules are in `AGENTS.md`. Pick one open task whose dependencies are all `[x]`.

## Foundation

- [x] **T-00** Scaffold Next.js + TS + Tailwind, folder layout, AGENTS.md. *Done: project skeleton in place.*
- [ ] **T-01** shadcn/ui setup + app shell: phone-width layout, colours, status badge (green/yellow/red). Deps: T-00
- [ ] **T-02** Supabase clients (`src/lib/supabase/`), `.env.example`, connect to the shared project. Deps: T-00
- [ ] **T-03** Database schema migration + `src/lib/types.ts`: patients, medications, dose_logs, checkins, rehab_exercises, rehab_logs, alerts. Deps: T-02
- [ ] **T-04** Triage engine in `src/lib/triage/`: LACE score, red-flag rules, status + human-readable reasons, template weekly summary. Pure functions. Deps: T-03

## Patient app

- [ ] **T-05** Daily check-in: pain, temperature, mobility, wound photo upload to Storage; saving runs triage. Deps: T-01, T-04
- [ ] **T-06** Pill reminders: today's schedule, "taken" button, missed doses logged. Deps: T-01, T-03
- [ ] **T-07** Rehab plan: exercises with embedded videos, "completed?" + pain 0–10 logging. Deps: T-01, T-03

## Nurse dashboard

- [ ] **T-08** Patient list sorted by status, live updates through Supabase Realtime. Deps: T-01, T-04
- [ ] **T-09** Patient detail: alert reasons, trend charts, wound photos side by side, template summary, call/adjust actions. Deps: T-08

## Demo

- [ ] **T-10** Seed data: 10–20 hip-replacement patients incl. the demo story patient (LACE 11, pain 3→7). Deps: T-03, T-04
- [ ] **T-11** QR demo entry (`/demo`): creates a fresh patient for the judge, then opens their check-in. Deps: T-05
- [ ] **T-12** Deploy to Cloudflare Workers with `@opennextjs/cloudflare`. Deps: T-02

## Mock-ups (clickable, no real logic)

- [ ] **T-13** "My recovery": plain-language discharge letter, own trends, status. Deps: T-01
- [ ] **T-14** Phone/SMS and family-member check-in screens. Deps: T-01
- [ ] **T-15** Emotional support screen. Deps: T-01

## Pitch

- [ ] **T-16** Find a real readmission rate or cost figure for Slovenia/EU, with source → `docs/pitch.md`.
- [ ] **T-17** Pick 3–5 hip-replacement rehab videos from reputable physio sources → `docs/rehab-videos.md`.

## Stretch

- [ ] **T-18** LLM "paste a discharge letter → plain-language version" as an isolated API route. Only after all demo tasks are done.
