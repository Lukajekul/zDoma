# TASKS.md

Status: `[ ]` open · `[~]` claimed (name, branch) · `[x]` done (one-line note).
Rules are in `AGENTS.md`. Pick one open task whose dependencies are all `[x]`.
User types (odpuščenec, zadolženec, bolničar) and UI rules: `AGENTS.md` §6–7.

## Foundation

- [x] **T-00** Scaffold Next.js + TS + Tailwind, folder layout, AGENTS.md. *Done: project skeleton in place.*
- [ ] **T-01** shadcn/ui setup + app shell following AGENTS.md §7: large text, 48 px buttons, "Nazaj" button, centred layout on desktop, status badge with word + colour. Deps: T-00
- [ ] **T-02** Supabase clients (`src/lib/supabase/`), `.env.example`, connect to the shared project. Deps: T-00
- [ ] **T-03** Database schema migration + `src/lib/types.ts`, per AGENTS.md §6: profiles (davčna številka, name, is_staff, must_change_password, address + občina for the patronažna sestra's filters), rehabilitacije (patient, template, status, start date, end date, created_by, assigned_nurse), family access (requester, patient, status pending/approved/rejected), medications, dose_logs, checkins, rehab_exercises, rehab_logs, alerts (all per rehabilitacija), audit_log. Row-level security: patient sees own, approved zadolženec reads only, staff sees all. Deps: T-02
- [ ] **T-04** Triage engine in `src/lib/triage/`: LACE score, evaluates a template's red-flag rules against answers → status + human-readable Slovenian reasons, template weekly summary. Pure functions, no condition-specific code. Deps: T-03
- [ ] **T-29** Template format + the six templates as data files in `src/lib/templates/` (questions, red-flag rules, default medicines, exercises, default length in days), per `docs/research.md` "Chosen templates": srčno popuščanje, po infarktu/operaciji srca, kolk/koleno, KOPB, možganska kap, rak na sistemskem zdravljenju. Emergency answers lead to the "Pokličite 112" screen. **Questions follow AGENTS.md §5a "Check-in": one-tap answers only, at most 5 a day, placeholders for the patient's own values** (e.g. `{suhaTeza}`, `{zdravilo}`). Deps: T-00
- [ ] **T-19** Login (`/prijava`): davčna številka + password/PIN, check-digit validation, **forced new password on first login** (temporary password from the prijavni listek), stay logged in, logout. Family registration (davčna številka + name + password). Staff go to the dashboard, everyone else to their home screen. Deps: T-01, T-03
- [ ] **T-25** Home screen: open straight into the only active rehabilitacija, cards when there are several, "Pretekle rehabilitacije" (read-only, no check-ins). Deps: T-19

## Odpuščenec (patient)

- [ ] **T-05** Daily check-in, one question per screen, showing **this patient's** questions (the ones the bolničar chose for the rehabilitacija, with the patient's own values filled in). **Every answer is one tap**: big buttons only, no typing or sliders; weight is a row of buttons around the patient's last weight (±0,5 kg steps, "Drugo" opens a number field); wound photo to Storage. Saving runs triage. Emergency answers show "Pokličite 112" first. Deps: T-04, T-25, T-29
- [ ] **T-06** Pill reminders: today's schedule, big "Vzeto" button, missed doses logged. Deps: T-25
- [ ] **T-07** Rehab plan: exercises with a picture/video and short Slovenian steps, "Opravljeno?" + pain 0–10 logging. Content from T-17. Deps: T-17, T-25

## Zadolženec (family)

- [ ] **T-26** Family access requests: "Zaprosi za dostop" by the patient's davčna številka (always replies "Prošnja poslana"), patient approves/rejects, patient's list of who has access with "Odstrani". Deps: T-19
- [ ] **T-20** "Skrbim za" tab: read-only view per patient of pills taken/missed, **medicines not yet picked up at the pharmacy (T-31), shown at the top as a warning**, exercises done/skipped, check-ins done, current status. Only shown with approved access. Deps: T-06, T-07, T-26

## Bolničar (staff)

- [ ] **T-08** Patient list sorted by status, live updates through Supabase Realtime. **Must work for a patronažna (travelling) sestra with many patients, on her phone at 390 px and on a PC:** search by name or davčna številka; filters as big chips with words: "Moji pacienti" (assigned to me, on by default), status (Rdeče / Rumeno / Zeleno, green hidden by default), občina/kraj, template, "Brez pregleda danes", "Zdravila niso prevzeta" (T-31), days since discharge; count on each chip; active filters kept in the URL so a reload or back keeps them; "Počisti filtre" button. Each row shows name, kraj, status word + colour and the top alert reason. Sort by status, then by how long the alert has been open. Deps: T-04, T-19
- [ ] **T-09** Patient detail: alert reasons, trend charts, wound photos side by side, template summary, call/adjust actions. Deps: T-08
- [ ] **T-21** Open a rehabilitacija at discharge: patient's davčna številka (+ name if new), pick a template, adjust medications, exercises and the end date, assign the patronažna sestra (default: the nurse covering the patient's občina, else the current user), **tick which of the template's check-in questions this patient gets and fill in their values (e.g. dry weight)**. For a new patient, create the account server-side with a temporary password and print the prijavni listek (davčna številka + temporary password + QR, never on the odpustnica). "Novo začasno geslo" and "Podaljšaj" (extend end date, also reopen recently ended) buttons. Every change written to audit_log. Deps: T-08, T-29

## Demo

- [ ] **T-10** Seed data: about 40 patients (enough that filtering matters) spread over a few občine and 2–3 patronažne sestre, across all six templates, mostly heart failure, incl. the demo story patient (heart failure, dry weight 72 kg → 74.5 kg, swollen ankles, one missed diuretic), one patient with two rehabilitacije (one finished), one patient who hasn't picked up a new medicine (T-31), approved zadolženci, and the bolničarji (incl. the patronažne sestre), all with made-up valid davčne številke. Deps: T-03, T-04, T-29
- [ ] **T-11** QR demo entry (`/demo`): creates a fresh heart-failure patient with an active rehabilitacija for the judge and logs them in (skipping the temporary-password step), then opens their check-in. Deps: T-05
- [ ] **T-12** Deploy to Cloudflare Workers with `@opennextjs/cloudflare`. Deps: T-02

## Mock-ups (clickable, no real logic)

- [ ] **T-13** "Moje okrevanje": plain-language discharge letter, own trends, status. Deps: T-01
- [ ] **T-14** Phone/SMS check-in screens. Deps: T-01
- [ ] **T-15** Emotional support screen. Deps: T-01

## eRecept (mock)

- [ ] **T-31** Pharmacy pick-up check, mocked eRecept. A medicine that was never collected after discharge is a silent cause of readmission. Each medication in a rehabilitacija gets a pick-up status (`prevzeto` / `ni prevzeto`, with the pick-up date). Source is a mock behind one interface in `src/lib/erecept/` (reads seed data; in production it would come from eRecept via CEZIH, say so in the pitch). Migration for the pick-up fields on a feature branch. Generic triage rule in `src/lib/triage/` (works for every template, no condition-specific code): not picked up N days after discharge (N is a setting, default 2, threshold to confirm, see IDEA.md open questions). Escalation follows "the app chases the patient": day N → reminder to the patient ("Zdravila Furosemid še niste prevzeli v lekarni."), then **the zadolženec is alerted** (warning at the top of "Skrbim za"; by email/SMS once T-28 exists, without medicine names: "Janez še ni prevzel zdravil v lekarni. Odprite zDoma."), and only then a bolničar alert with the reason "Furosemid ni prevzet 3 dni po odpustu". Demo switch in `/demo` to mark a medicine as picked up / not picked up. Deps: T-03, T-04, T-06
- [ ] **T-32** Reminder before medicines run out. Days left = pack size from the pick-up (T-31) ÷ daily dose from the medication plan, as a pure function in `src/lib/erecept/` with a few tests (normal, runs out today, missing pack size). When days left ≤ N (a setting, default 5), the pill screen (T-06) shows "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept." It only sends the patient to their GP and never suggests changing a dose. Email/SMS version goes with T-22. Deps: T-06, T-31

## Pitch and content

- [ ] **T-16** Find a real readmission rate or cost figure for Slovenia/EU, with source → `docs/pitch.md`.
- [ ] **T-17** Rehab content → `docs/rehab-content.md`: 3–5 exercises per template (walking plan for heart groups, breathing exercises for KOPB, physio for kolk/koleno, mobility for kap, light activity for rak), each with Slovenian title, 3–4 short steps, repetitions, a picture and an optional embeddable video, plus the source and its licence.
- [ ] **T-30** Pitch slides with evidence: one slide per patient group with its key paper, from `docs/research.md`. Verify each number against the full paper before it goes on a slide.

## Codeplain challenge (turri) — DRAFT, review together before anyone claims it

- [ ] **T-27** Write the T-04 triage engine as a ***plain spec (`plain/triage.plain`): LACE score, red-flag rules, status + Slovenian reasons, plus the davčna številka check-digit validator. Then generate the TypeScript into `src/lib/triage/` with turri (`turri regenerate`), using the demo patient (LACE 11, pain 3→7 → red) as an acceptance test. Commit the spec and the generated code. Needs: `turri` CLI (`npm i -g @turri-dev/cli`) and a model login (Claude subscription via `turri install pi-claude-code`, or a `GEMINI_API_KEY` free tier), with keys never committed. Replaces hand-writing T-04 if it works; fall back to hand-written code if not. Deps: T-03. **Open questions:** does turri produce clean TS for Next.js, and do we do T-04 this way or keep it as a separate showcase module?

## Later (after the demo works)

- [ ] **T-22** Email reminders for pills, exercises and check-ins to the odpuščenec, e.g. Resend from a scheduled Worker. Email field on profiles. Deps: T-06, T-07
- [ ] **T-23** SMS reminders and phone-number field on profiles. Deps: T-22
- [ ] **T-28** Notifications for zadolženci (AGENTS.md §6): "Prejemaj obvestila" switch per patient in "Skrbim za" (off by default, email/SMS choice), same reminders as the patient plus missed-task, medicine-not-picked-up (T-31) and yellow/red status messages, patient sees who gets them. No diagnosis or medicine names in outgoing messages. Deps: T-20, T-22
- [ ] **T-24** Bolničar template editor for recovery plans (all doctors can edit), with audit log view. Deps: T-21
- [ ] **T-18** LLM "paste a discharge letter → plain-language version" as an isolated API route. Only after all demo tasks are done.
