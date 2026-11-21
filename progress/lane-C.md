# Lane C – Odpuščenec: handoff

- **Owner:** An Jesenko (Claude)
- **Status:** all Lane C tasks done, plus T-21, T-36 (for Lane D, with their OK) and T-49
- **Last update:** 21. 11. 2026

Start here if you pick up Lane C. Each task has its own `progress/T-xx.md` with details; this file ties them together.

## Done (all `[x]`, merged to main)

| Task | What | Where |
|---|---|---|
| T-01 | shadcn/ui, 18 px base, status colours, shared kit `AppShell` / `BigButton` / `StatusBadge` / `BackButton`, sl-SI formatters | `src/components/shell/`, `src/lib/format.ts`, `/ui` |
| T-14 | Clickable SMS + phone-call check-in mock-ups | `/patient/mockup` |
| T-25 | Patient home: one active rehab → straight to "Danes", several → cards, "Pretekle rehabilitacije" | `/patient`, `/patient?seznam=1` |
| T-06 | Pills today by time of day, "Vzeto" + undo, past gaps logged as `izpusceno` | `/patient/<id>/zdravila` |
| T-07 | Exercises with picture + steps, "Opravljeno?" → pain 0–10 one tap | `/patient/<id>/vaje`, images in `public/vaje/` |
| T-05 | Daily check-in: one question per screen, weight row + "Drugo", "Enako kot včeraj", 112 before saving, triage + alerts, end screen | `/patient/<id>/pregled` |
| T-33 | "Danes": one next action (check-in → pills due now → exercise → later/done) | `/patient/<id>` |
| T-40 | Progress ring (SVG, CCW from 12, % + words) on "Danes" and the end screen | `src/lib/progress-ring.ts`, `src/components/patient/progress-ring.tsx` |
| T-35 | Medicine changes Ukinjeno / Novo / Spremenjeno, shown first on "Danes" until "Razumem"; mock eRecept history | `/patient/<id>/spremembe`, `erecept.zdravilaPredSprejemom()` |
| T-21 | Discharge wizard (7 steps), result page with listek, "Podaljšaj", "Nova koda QR" | `/nurse/odpust`, `/nurse/odpust/<id>` |
| T-36 | "Danes obiščite", "Prvi obisk" checklist → "Nameščeno ✓", "Nadomeščanje", nurse name on patient "Danes" | `/nurse/danes`, `/nurse/prvi-obisk/<id>`, `/nurse/nadomescanje` |
| T-49 | "Moji pacienti" counts covered nurses' patients; patient sees the substitute; RLS migration `20261121233000` **applied** | `src/components/nurse/dashboard-filters.ts`, `src/app/patient/_lib/nurse.ts` |

## Most important: not tested against the real database

Everything from T-25 on was checked only with sample data (preview pages, throwaway Vitest files, headless Chromium screenshots at 390 px and 1440 px) and fake env values. **No real login, query, insert or RLS path has been exercised.**

- Blocker: this machine has no `.env.local`. Fetching the keys with the AGENTS.md §9 command was denied by the agent's permission check (twice). The human must run it, allow it, or copy the file from a teammate. The Supabase CLI itself is logged in (`supabase db push` worked).
- Seed data exists (T-10: 46 patients incl. the heart-failure demo story; demo accounts listed in its docs).

### End-to-end test plan (do this first)
1. `.env.local` in place → `npm run build && npx next start`.
2. Log in as the demo patient (QR / `/demo`, T-11). Check: `/patient` redirects to "Danes"; changes card first (T-35) → "Razumem"; check-in incl. weight row, "Enako kot včeraj" (needs a green yesterday), emergency answer → 112 screen before saving; end screen + ring; "Da, vzeto" on pills; exercises + pain; "Danes" moves to the next action.
3. Check RLS paths: inserts into `checkins`, `alerts`, `dose_logs`, `rehab_logs`, Storage upload to `wound-photos/<rehabId>/…`, cookie on "Razumem".
4. Log in as a nurse: `/nurse` buttons + "Prvi obisk" to-do; run the discharge wizard for a new and an existing davčna številka (account + listek, medicines diff, nurse suggestion by teren); "Podaljšaj" → patient ring shows "Okrevanje podaljšano do …"; "Nadomeščanje" → substitute sees the patients in "Moji pacienti" and "Danes obiščite", patient sees "Do … vas obiskuje …".
5. Fix what breaks, one `fix:` commit per issue.

## Open points for others
- **Safety, templates (T-43):** in srčno popuščanje the chest pain/fainting question isn't `vednoVprasaj`, so "Enako kot včeraj" copies yesterday's "Ne" without asking. Recommend making emergency questions `vednoVprasaj` in every template.
- **T-45** (claimed by someone else): scheduled job for missed doses; reuse `unloggedDoses()` from `src/app/patient/_lib/schedule.ts`.
- No real medicine box photos yet (`medications.photo_url` empty); a drawn box with the name is shown.
- The mock eRecept history is "medicines of the previous rehabilitacija", so a first-ever patient's medicines are all "Novo".
- Editing a plan's medicines/exercises after the rehabilitacija is opened isn't built (not in any task yet).
- Pill slot times on "Danes" (6:00 / 11:00 / 17:00 / 20:00) and the 14-day reopen window are product settings, not medical rules.

## Reusable pieces (patient side)
- Server data: `src/app/patient/_lib/` – `rehabs.ts`, `checkins.ts` (`loadCheckinContext`), `doses.ts`, `exercises.ts`, `ring.ts`, `nurse.ts`, `marker-names.ts`.
- Pure: `checkin-plan.ts`, `schedule.ts`, `danes.ts`, `changes.ts`, `src/lib/progress-ring.ts`.
- Components: `src/components/patient/` (`checkin/`, `danes/`, `dose-card`, `exercise-card`, `progress-ring`, `medicine-changes`, …). T-20 can reuse them with its own family-checked actions.

## How I checked UI without the database
- Temporary `src/app/zz-preview/` page rendering components with sample data (deleted before each commit).
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9 NEXT_PUBLIC_SUPABASE_ANON_KEY=x npm run build && npx next start -p <port>` (process env only, never written to a file).
- Headless Chromium via a small CDP script (in the agent's scratchpad, not in the repo) for clicks and full-page screenshots.
