AI handoff brief • 22 November 2026 • Focus: no AI/LLM functionality

Purpose: Give another AI the full technical and clinical context needed to critically evaluate and refine a standards-informed, modular post-discharge questionnaire system. The immediate decision is whether modular composition is preferable to separately hand-coded questionnaires, and which standards can legitimately support its question bank.

# 1. Product context and existing baseline

zDoma is a patient-facing post-discharge follow-up application. Patients complete brief check-ins after leaving hospital; clinicians view responses, symptom trends, and review flags. The supplied research report describes a repository with diagnosis-specific questionnaire templates, a six-question limit, and existing green/yellow/red rule-based status logic. The intended stack is Next.js, TypeScript, and Supabase. Treat these repo facts as reported in the research, not independently verified.

Clinical scope of proposed demonstration: heart failure, total knee replacement, community-acquired pneumonia, and relevant medication classes (anticoagulants, diuretics, potentially a finite antibiotic course). Support people with more than one condition or procedure.

# 2. Core architectural decision

Preferred approach: retain hand-authored, clinician-reviewed individual questions, but stop hand-coding complete questionnaires for every diagnosis or diagnosis combination. Compose patient-specific check-ins deterministically from reusable modules. This is not automatic generation of clinical wording.

| Separately coded templates                                     | Modular item bank + rule composer                                |
|----------------------------------------------------------------|------------------------------------------------------------------|
| Easy initial implementation; straightforward for one condition | Some initial metadata/composition work; scales across conditions |
| Multi-condition cases require custom combinations              | Union of applicable condition, procedure and medication modules  |
| Duplicate symptom questions require manual fixes               | Deduplicate by concept, keeping clinical provenance              |
| Timing and frequency added separately to each template         | Store active-day windows and frequency per module item           |
| Clinical review still required                                 | Clinical review still required for wording and clinical rules    |

Example: a patient with heart failure, knee replacement and anticoagulant medication should receive core + heart-failure + knee + anticoagulant questions, with breathlessness asked only once if applicable. Mandatory red flags must not be trimmed to fit a fixed question count.

# 3. What counts as a standard?

| Category                                          | What it establishes                                                                            | Examples / limit                                                                                       |
|---------------------------------------------------|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Validated patient-reported outcome measure (PROM) | A tested, fixed instrument for its intended construct, recall interval, scoring and population | EQ-5D-5L, KCCQ-12, Oxford Knee Score, PROMIS; not interchangeable with daily triage                    |
| Guideline-informed monitoring item                | A clinical recommendation motivates an operational symptom question or threshold               | ESC/HFA weight monitoring; NICE recovery expectations; an original item is NOT automatically validated |
| Technical interoperability standard               | How questions, responses, conditional logic and metadata are represented                       | HL7 FHIR Questionnaire / Structured Data Capture (SDC); does not establish clinical validity           |
| Curated symptom item library                      | Reusable symptom items selected for a relevant treatment/condition                             | NCI PRO-CTCAE in oncology; applicability and usage terms must be checked                               |

Critical distinction: the overall proposed daily zDoma monitoring questionnaire is not itself a formally validated instrument. It can be defensibly described as “guideline-informed, clinician-reviewed symptom surveillance” until a dedicated validation study is completed.

# 4. Candidate standards and instruments

| Source                                   | Suggested role                                                                      | Key caveat                                                                       |
|------------------------------------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| NICE clinical guidelines                 | Procedural recovery, wound concerns, pneumonia recovery and VTE-related information | Confirm exact guideline, current edition and clinical interpretation             |
| ESC / Heart Failure Association guidance | Heart-failure monitoring (weight, breathing, oedema, self-care)                     | Review thresholds and population-specific applicability                          |
| HL7 FHIR Questionnaire + SDC             | Future-compatible item formats, enableWhen follow-ups, assembled subquestionnaires  | Structure only; does not validate wording, thresholds, or escalation             |
| EQ-5D-5L                                 | Possible weekly generic outcome assessment                                          | Official licensed/registered digital form; Slovenian translation and usage terms |
| PSFS                                     | Possible weekly personalized functional goals                                       | Confirm copyright/permission and appropriate implementation                      |
| KCCQ-12 / Oxford Knee Score              | Future condition-specific milestone measures                                        | Licences and original recall windows; postpone MVP                               |
| PROMIS                                   | Future short forms and adaptive outcome assessment                                  | Do not modify official wording; check electronic and translation permissions     |
| PRO-CTCAE                                | Potential future oncology symptom bank                                              | Not a universal postoperative question bank                                      |
| Barthel / WHODAS 2.0                     | Not recommended for patient daily MVP                                               | Fit, duration and/or electronic-use permission concerns                          |

# 5. Selection and adaptation logic

| Tier | Content                        | Policy                                                           |
|------|--------------------------------|------------------------------------------------------------------|
| 0    | Critical emergency red flags   | Every day, always first; cannot skip or use “same as yesterday”  |
| 1    | Essential deterioration trends | Ask daily in active window; only clinician may relax             |
| 2    | Recovery-phase monitoring      | Daily or every 2–3 days; rotate within time budget               |
| 3    | Triggered follow-ups           | Shown only if parent response triggers; one branch level for MVP |
| 4    | Periodic outcomes              | Weekly or fixed milestone; separate from daily triage            |

- Target ~6 screens / ~60 seconds, but patient safety overrides the budget; do not silently omit essential questions.

- Use discharge/first 2–3 days as a reference baseline where appropriate; compare against historical trend and expected recovery trajectory, not absolute thresholds alone.

- Examples from source research: heart failure weight rise \>2 kg over 3 days; pneumonia fever typically resolving by about a week, while cough may last weeks. These are examples requiring clinician verification before implementation.

- Worsening results can temporarily increase follow-up frequency; stability may reduce frequency of nonessential items under approved rules.

- Missed check-ins should appear in the dashboard; illustrative escalation: reminder after one, caregiver/nurse review after two. Define an approved workflow.

- For shared concepts, deduplicate the displayed question, but retain each contributing module/rule and have clinicians resolve different thresholds; “stricter wins” is only a proposed default.

# 6. Data and implementation specification

Suggested Item attributes: stable ID + version, concept/deduplication key, Slovenian/English text, response type/options/unit, priority tier, provenance/source URL and edition, validation label, reviewer/approval status, optional conditional follow-up definitions.

Suggested Module attributes: ID/type, matching criteria (ICD-10 prefix, procedure, medication class), item references, frequency, active recovery-day range, severity rules, and priority.

Suggested patient snapshot workflow: staff record clinical facts → composePlan(patientFacts, itemBank) → clinician reviews/removes/adjusts/approves → immutable approved plan snapshot → selectToday(plan, recoveryDay, answerHistory, budget) → answers saved → server-side rule assessment → transparent flags.

Suggested Supabase tables: items; modules; module_items; patient_facts; patient_plans (snapshot/version/approval metadata); checkins; answers (item-version links); flags (rule/version/severity/explanation/acknowledgment). Enforce row-level security, segregate roles, and calculate flags server-side.

# 7. Safety, licensing, and regulatory constraints

- The report warns that automated red/yellow/green clinical triage may trigger EU Medical Device Regulation (MDR) obligations. Do not describe the system as medically validated or regulatory-cleared.

- For the MVP, show results as prompts for clinician review, not autonomous diagnoses or treatment decisions; clinician-set thresholds and escalation policies are required.

- Track clinical sources and their versions and log clinician changes; approved plans should not change silently when the global question bank is updated.

- Preserve validated instruments verbatim and within prescribed scoring/recall intervals. Confirm digital licences and Slovenian language rights with holders before using them.

- The source report explicitly marks some illustrative thresholds as requiring primary-guideline verification. Do not treat the examples as independently verified clinical recommendations.

# 8. Concrete MVP scope

- About 25 curated items across six modules: core, heart failure, knee replacement, pneumonia, anticoagulant, diuretic (add antibiotic course if time).

- Pure TypeScript composePlan() and selectToday() with unit tests (Vitest); one-level conditional questions, deduplication, time windows, prioritization and trend logic.

- Clinician plan review/approval; patient check-in; dashboard with source-linked “why flagged” explanations and missed-check-in signal.

- Demo cases: knee surgery + anticoagulant; heart failure + diuretic; pneumonia + antibiotics; one multi-condition test case.

- Defer: AI, automatic letter parsing, visual authoring tool, machine-learning risk scores, wearables, PROMIS CAT, and FHIR export. Design for interoperability without implementing it now.

# 9. Questions for the next AI to answer

1.  Is a deterministic modular question bank genuinely better than hard-coded questionnaire templates for this particular MVP? Identify break-even complexity and possible simpler alternatives.

2.  Which published, current, authoritative guidelines or validated item banks can supply defensible daily post-discharge symptom questions for heart failure, knee surgery, pneumonia and medication monitoring? Distinguish exact validated items from original guideline-informed wording.

3.  Can a daily symptom-monitoring question bank meet an established formal standard, or must the product separately validate its entire decision logic and clinical workflow? What would validation entail?

4.  What minimum metadata and rule semantics should each question have to support safe deduplication, multiple coexisting conditions, recovery phases, and auditable flags?

5.  What is the correct approach when two active modules ask the same symptom but have different time windows, answer scales, or thresholds?

6.  Which parts of HL7 FHIR Questionnaire/SDC are worth following from day one, without implementing a full FHIR stack?

7.  Which Slovenian/EU licensing, language, privacy and medical-device obligations should be checked before any real patient deployment?

8.  Provide a small, clinically cautious TypeScript/JSON architecture and a realistic MVP build sequence. Do not include AI or LLM features.

# 10. Copy-ready instruction to the next AI

I am building zDoma, a post-discharge patient check-in application using Next.js, TypeScript and Supabase. We currently have diagnosis-specific hand-coded questionnaire templates and a simple green/yellow/red rules engine. I want to evaluate replacing the per-diagnosis templates with a small, reusable, clinician-curated question bank and deterministic composition rules based on diagnosis, procedures, medications, recovery day and answer history. Ignore all AI/LLM features. Focus on whether this is worthwhile, how to implement it safely and simply, and which exact clinical or technical standards support the questions. Clearly distinguish validated instruments, guideline-informed custom questions, and HL7 FHIR technical standards. Verify claims against primary sources, including current editions, licensing and Slovenia/EU applicability. Do not present illustrative thresholds as clinically approved. Give concrete recommendations, schema examples, trade-offs, and an MVP plan.

# 11. Source and evidence status

Primary basis: user-supplied 17-page “zDoma: Personalized Post-Discharge Questionnaire System — Research & Recommendations”, dated 22 November 2026. It surveys Epic MyChart Care Companion, SeamlessMD, Santeon, Luscii, NCI PRO-CTCAE, PROMs, NICE, ESC/HFA and FHIR SDC. This handoff summarizes that report plus the conversation. It is not an independent literature review or a clinical validation. Another AI should reopen official primary documents before making authoritative clinical, legal or licensing claims.
