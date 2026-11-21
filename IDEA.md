# Post-Discharge Recovery Monitoring

ADAHack 2026, Challenge 1 (Ixtlan Team): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

## One-liner

Patients do a short daily check-in at home, the system flags early warning signs, and nurses act before a complication becomes a readmission.

## The problem

After discharge, patients go home with little medical oversight. Complications such as infections, heart-failure decompensation or medication mistakes often go unnoticed until the patient is back in the emergency room. Nurses can't phone every patient every day, so they need a way to see who needs attention.

## Core loop

**Patient reports → system flags → nurse acts**

Every feature must feed this loop. If a feature doesn't produce data for triage or help a nurse act, it's an extra.

## Patient app

- **Daily check-in (about 60 s).** Questions are tailored to the diagnosis:
  - Hip or knee surgery: pain, temperature, wound photo, mobility
  - Heart failure: weight, swelling, breathlessness
- **Pill reminders.** Shows which pill to take and when, with a "taken" button. Missed doses feed into the risk score.
- **Rehab plan.** Exercises with videos, matched to the diagnosis and stepping up week by week. After each session the patient answers "Completed?" and "Pain 0–10?", and those answers feed into triage.
- **My recovery.**
  - The discharge letter rewritten in plain language: diagnosis, what each medicine is for, warning signs, what to avoid
  - The patient's own trends: pain, temperature, weight, rehab adherence, missed pills
  - The same green/yellow/red status the nurse sees
- **Escalation instead of open chat.** When the status turns red, a nurse calls the patient back. Patients don't send free-form messages to doctors.
- **Emotional support.** A single screen that connects severe cases, such as cancer patients, to a real support service.

## Nurse dashboard

- A patient list sorted by traffic-light status (green / yellow / red).
- **Every alert says why it fired.** For example: "Flagged because pain rose 3→7 over 3 days and 2 rehab sessions were skipped."
- Trend alerts, for example "weight +2 kg in 3 days" or "rehab adherence 40%".
- Wound photos shown side by side over time, so the nurse can compare them.
- A one-paragraph weekly summary for each patient, generated from a template using the triage data.
- One-click actions: call the patient, adjust the plan, book a visit.
- A workload line, for example: "Today: 140 patients monitored, 6 need attention, about 15 min of work."

## Clinical credibility

- **LACE index at discharge** (Length of stay, Acuity, Comorbidities, ED visits). This validated readmission-risk score sets how often each patient checks in: daily for high risk, every 3 days for low risk.
- **Red-flag rules taken from guidelines:**
  - Heart failure: weight gain over 2 kg in 3 days
  - After surgery: temperature over 38 °C; a wound that is red, warm or oozing
- **Synthetic patients generated with Synthea,** in FHIR format. This is the same standard hospitals use, which answers the question of how the system would connect to them.
- **Decision support, not diagnosis.** The system prioritises patients and nurses make the decisions. No AI diagnosis and no AI wound analysis.

## What sets it apart

- **Works for patients who don't use apps.** Many discharged patients are elderly, so they can check in by phone call or SMS ("Press 1 if pain is worse than yesterday"), or a family member can check in for them.
- **Passive data.** Daily steps come from Google Fit or Apple Health. A sharp drop in mobility is an early warning that needs no input from the patient.
- **Alerts explain themselves.** Nurses can see exactly why a patient was flagged.
- **No AI guesswork.** Summaries come from templates and plain-language letters are written by hand, so nothing is made up. A live LLM letter rewrite is a stretch goal only.

## Demo

**Live, with two screens:**

1. A judge scans a QR code and does the check-in on their own phone.
2. They report high pain and a skipped rehab session.
3. On the nurse dashboard, projected on screen, their card turns red, together with the reason.

**Patient story:** A hip replacement patient has a LACE score of 11 (high risk), so they check in daily. Their pain rises from day 3 to day 5 and they skip two rehab sessions. Their status turns yellow with the reasons shown, the nurse calls, and a wound infection is caught early, before it needs another hospital stay.

## Scope for 24h

**Must work in the demo**
- Daily check-in (web, mobile-first)
- Nurse dashboard with traffic lights and explained alerts
- LACE score with red-flag rules
- Rehab exercises with completion and pain logging
- Pill reminders
- QR live demo

**Clickable mock-ups only**
- Full "My recovery" data view
- Phone/SMS and family check-in
- Google Fit / Apple Health step data
- Emotional support screen

**Cut**
- Appointment booking (zVEM / eNaročanje already does this)
- Open doctor chat (doesn't scale)
- Filming our own rehab videos (embed 3–5 existing physio videos for hip replacement instead)

## Pitch

- **Lead with one real cost figure:** the readmission rate or the cost per readmission in Slovenia or the EU. Use a real source and don't make up a number.
- **Present it as decision support:** nurses decide and the system prioritises. This deals with liability concerns.
- **Integration:** built on FHIR, with patient data access in line with GDPR and the European Health Data Space.
- **Rollout:** pilot one condition (hip replacement) in one department, then add heart failure and oncology.

## Open questions

- [ ] Find a real readmission cost or rate figure for Slovenia or the EU
- [ ] Check the red-flag thresholds with someone who has medical knowledge
- [x] Pick the tech stack (Next.js + TS, Supabase, Cloudflare Workers, no LLM; see AGENTS.md)
- [ ] Choose 3–5 hip-replacement rehab videos from reputable physio sources
