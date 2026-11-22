# Modular questionnaire

Code: `src/lib/moduli/` (T-76). Background: the research report of 22. 11. 2026 and `docs/zDoma_AI_Handoff_Brief.md`.

## Idea

Nothing is generated. A clinician writes or approves every item once, and it goes into the shared item bank (`banka/postavke.ts`). Modules (`banka/moduli.ts`) group items and their flag rules:

| Module | Switched on by |
|---|---|
| `jedro` (red flags, weekly EQ-5D-5L) | everyone |
| `stanje:srcno-popuscanje` | ICD-10 `I50` |
| `stanje:pljucnica` | ICD-10 `J12`–`J18` |
| `poseg:endoproteza-kolena` | procedure `endoproteza-kolena` |
| `zdravilo:antikoagulant` | ATC `B01AA`, `B01AB`, `B01AE`, `B01AF` |
| `zdravilo:diuretik` | ATC `C03` |
| `zdravilo:antibiotik` | ATC `J01`, until the course's `konec` |

## Flow

1. **Enrolment.** Staff enter `DejstvaPacienta` (diagnoses, procedures, medicines, discharge date). `sestaviNacrt` switches on every matching module and merges their items. Items with the same `koncept` are asked once: the item from the module with the lowest `prednost` is kept, and the most frequent schedule, the widest active window and "essential" are combined. When two modules carry the same rule id, the stricter rule wins and the plan records which module set it. Reviewer notes go in `opozorila`, for example more than 6 mandatory questions a day, or a rule that could not be carried over.
2. **Review.** `odobriNacrt` lets a clinician remove items (never red flags) and freezes the plan as a snapshot. Later changes to the bank never change an approved plan.
3. **Every day.** `izberiDanes(nacrt, dan, zgodovina)` returns today's screens:
   - Red flags come first and are never trimmed. They are also never filled by "Enako kot včeraj".
   - Core trend items (tier 1), essential items and stepped-up items are always asked.
   - Phase items (tier 2) fill the rest of the 6-screen budget. They are ranked by tier, then module priority, then the item asked longest ago. The rest are deferred.
   - A flagged item stays daily, with its follow-up, for 3 days (step-up). A tier-2 item with 5 stable days drops to every other day (step-down).
   - Weekly validated instruments are asked only when `licencaUrejena` is true.
4. **Follow-ups.** `nadaljnjeZa` shows a follow-up right after its parent when the answer is in `ko`. There is one level only, and follow-ups don't count toward the budget. This works like FHIR `enableWhen`.
5. **Flags.** `oceniNacrt` runs the plan's rules through the existing `oceniPravilo`, plus `poDnevu` (an answer still present after the expected recovery day). Weight is compared with the patient's own earlier days. Every flag has a reason, a module, a rule source and a question source. `OZNAKA_OPOMBA` states that flags are a prompt for staff, not a diagnosis.
6. **Missed check-ins.** `zamujeniPregledi` counts missed days in a row: 1 → reminder to the patient, 2 → zadolženec, 3 or more → staff.

## Standards

Daily items are "guideline-informed, clinician-reviewed symptom surveillance": they use our own wording (`status: "zdoma"`) and are **not** validated instruments. Validated instruments (`status: "validiran"`) are used unchanged, weekly, and only once licensed. Every threshold with `potrjeno: false` is an example still to be confirmed (T-77).

## Adding a condition

Add the new items to `postavke.ts`, reusing existing concepts where the question is the same, and add one module to `moduli.ts`. `npm test` runs `preveriBanko`. It checks:
- versioned ids and sources
- follow-ups that are tier 3 and one level deep
- rules that match answers
- items sharing a concept that share answer ids
- red flags that have a 112 rule
