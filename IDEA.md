# zDoma: Post-Discharge Recovery Monitoring

ADAHack 2026, Challenge 1 (Ixtlan Team): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

The Slovenian `README.md` is the main project description. This file is the English summary of the idea. Evidence and sources: `docs/research.md`.

## One-liner

Patients do a short daily check-in at home, the system flags early warning signs, and staff act before a complication becomes a readmission. Staff only see the patients who need them.

## The problem

After discharge, patients go home with little medical oversight. Complications such as heart-failure decompensation, infections or medication mistakes often go unnoticed until the patient is back in the emergency room. Nurses can't phone every patient every day, so they need a way to see who needs attention.

- About half of patients hospitalised for acute heart failure in Europe are readmitted within a year.
- 19% of patients have an adverse event within weeks of discharge, and 66% of those involve medicines.

## Core loop

**Patient reports → system flags → staff act**

Every feature must feed this loop. If a feature doesn't produce data for triage or help staff act, it's an extra.

## Patient groups

The platform is generic, but it's built for six severe conditions where problems after discharge are common and often missed, and where research shows home monitoring helps. **Heart failure** is the main group and the demo story.

| Group | Patient reports | Red flags | Key paper |
|---|---|---|---|
| **Heart failure** (main) | weight, swelling, breathlessness | weight +2 kg in 3 days, worse breathlessness, missed diuretic | Cochrane 2015: home monitoring, −20% deaths, −29% heart-failure admissions |
| **After a heart attack or heart surgery** | chest pain, breathlessness, wound, pills | chest pain → 112, missed blood thinners, wound, fever | Cochrane 2023: home cardiac rehab as effective as centre-based |
| **Hip or knee replacement** | pain, temperature, wound photo, calf swelling | fever >38 °C, red or oozing wound, one swollen calf (possible clot) | Infections and implant problems cause 59% of readmission costs |
| **COPD** | breathlessness, cough and sputum colour, fever | much worse breathlessness, green or yellow sputum, fever | European COPD Audit: 35% readmitted within 90 days; home monitoring −26% exacerbation readmissions |
| **Stroke** | blood pressure, new weakness or speech problems, falls | face/arm/speech signs → 112, high blood pressure, a fall | Cochrane 2017: care continuing at home reduces death or dependency (OR 0.80) |
| **Cancer on chemotherapy at home** | temperature, nausea, diarrhoea, pain, mood | fever ≥38 °C → call the oncology ward at once | Basch, JAMA 2017: symptom reporting from home, survival 31.2 vs 26.0 months |

For every group: pill reminders, because medicine problems are the most common harm after discharge.

### Templates

Each group is one **template**: a hand-written data file with check-in questions, red-flag rules, recommended medicines with their usual doses, exercises and a default rehabilitacija length. The code is generic. One check-in screen shows the template's questions, and one function checks the answers against the template's rules and returns a status and a reason. A new condition is one new file, with no new screens. There's no AI.

## Users

| Role | Who | Main job |
|---|---|---|
| Odpuščenec | the discharged patient | follows the plan, does check-ins |
| Zadolženec | a family member the patient approved | follows along, marks tasks done when doing them with the patient |
| Bolničar | a doctor or nurse | opens the rehabilitacija, acts when needed |

Odpuščenec and zadolženec describe a relationship to a patient, not an account type. One person can be both.

### What makes zDoma different

*The app shows only what changed today: in your weight and in your medicines. The rest is handled by the patronažna sestra and the family.*

1. **"Danes", not menus:** the app opens on today's next action and ends with "Končano za danes ✓". A normal day is 3–4 taps.
2. **"Enako kot včeraj":** if nothing changed, one tap. The app asks more only when something is different.
3. **Something back every day:** own numbers ("72,4 kg – blizu vaše ciljne teže ✓", "Dan 6 od 30"), and the nurse's name when she acts ("Sestra Mojca vas bo poklicala danes do 12:00").
4. **Medicines, end to end:** what changed at discharge (Novo / Spremenjeno / Ukinjeno, with a photo of each box), whether it was picked up (eRecept), and a reminder before it runs out.
5. **Set up at the first patronaža visit:** the patronažna sestra installs it on the patient's phone and does the first check-in with them, so nobody aged 80 has to set up an app alone.

### Patient app
- **Daily check-in (about 30 s):** at most 5 questions, one per screen, **one tap per answer**. The questions are chosen for this patient by the bolničar and use their own values ("Ali tehtate več kot 72 kg?"), not a generic form.
- **Pill reminders** with a "Vzeto" button. Missed doses feed into triage.
- **Pharmacy pick-up (eRecept, mocked):** each medicine shows whether it was collected. Not collected after discharge → reminder to the patient, then the family, then an alert for staff ("Furosemid ni prevzet 3 dni po odpustu"). In production from eRecept via CEZIH.
- **Before medicines run out:** days left = pack size from the pick-up ÷ daily dose. "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept."
- **Rehab plan:** exercises with a picture or video, then "Opravljeno?" and "Bolečina 0–10?".
- **Discharge information** in plain language and the warning signs, one tap away from "Danes".
- **Family access:** approve or reject requests, remove access any time.
- **Escalation instead of open chat:** when the status turns red, a nurse calls.

### Family (zadolženec)
- Registers with their own davčna številka and password, never using the patient's account.
- Requests access with the patient's davčna številka. The app always answers "Prošnja poslana", so nobody can find out who uses zDoma.
- Gets a **"Skrbim za"** tab: medicines not picked up at the pharmacy (shown as a warning), pills taken or missed, exercises done or skipped, check-ins, current status.
- **Can mark tasks done when doing them with the patient** (pills, exercises, check-in). Each entry shows who marked it ("Označila: Ana (hčerka)"). Can't change the plan.
- Later: opt-in email/SMS notifications for that patient, with no diagnosis or medicine names in the messages.

### Staff (bolničar): as little work as possible
- **Discharge in about 1 minute:** pick a template, enter the patient's davčna številka, adjust medicines and the end date.
- **Medicines in a few taps:** the template recommends the usual medicines for that illness, merged with what the patient already takes (eRecept). Tick one and tap a usual dose (Furosemid 20 / 40 / 80 mg). "Uredi" for anything else, "Dodaj zdravilo" for other medicines. Doses come from guidelines (`docs/medicines.md`), and only staff see the options.
- **The dashboard shows only problems.** Green patients are hidden, and every alert says why it fired.
- **Patronažna sestra assigned by address:** each covers a teren (občina, villages). At discharge the app suggests the right one, the bolničar confirms with one tap. No match → "Nedodeljeni" on the dashboard, nobody gets lost. "Nadomeščanje" covers leave.
- **Built for the patronažna sestra with many patients:** on her phone she searches and filters by "Moji pacienti", status, občina, template, missed check-in and medicines not picked up.
- **The app chases the patient, not the nurse:** a missed check-in reminds the patient, then the family, and only then reaches staff.
- **One-tap actions:** "Poklicano – vse v redu", "Naročen pregled", "Obveščen osebni zdravnik".
- **Extend the rehabilitacija** with one button.
- Every change and action is written to the audit log automatically.

## Accounts and rehabilitacije

1. At the first discharge, the bolničar creates the patient's account. The server generates a **temporary password**, printed on a separate **prijavni listek**, never on the odpustnica.
2. On first login the patient must set their own password (a 6-digit PIN is allowed). Unused temporary passwords expire after 7 days, and the bolničar can issue a new one.
3. A **rehabilitacija** is one recovery episode. The bolničar opens it from a template and sets an end date, and can extend it. While active, check-ins, reminders and alerts run. After the end date it's read-only.
4. A returning patient keeps their account and password. The new rehabilitacija just appears.

The davčna številka isn't secret, so a password is always required.

## Safety

- **zDoma is not an emergency service.** Chest pain, sudden severe breathlessness, fainting or stroke signs always show a full-screen "Pokličite 112" first.
- **Decision support, not diagnosis.** The system sorts patients, and staff decide.
- **Synthetic data only**, with made-up davčne številke that pass the check-digit test.

## UI

Built for elderly users: Slovenian first, mobile first but works on a PC, one action per screen, text at least 18 px, buttons at least 48 px, status colours always with a word.

## Tech

Next.js + TypeScript, Tailwind + shadcn/ui, Supabase (Postgres, Realtime, Storage, Auth), Cloudflare Workers. LACE score at discharge plus template rules. No LLM.

## Demo

**Live, with two screens:**
1. A judge scans a QR code and does a check-in on their own phone.
2. They enter a higher weight and swollen ankles.
3. On the dashboard on the projector, their card turns red, together with the reason.

**Patient story:** A 78-year-old man with heart failure, dry weight 72 kg. On days 3–5 after discharge his weight rises to 74.5 kg, his ankles swell and he skips one diuretic. His daughter, approved as his zadolženka, sees the missed pill. When she visits, she does the check-in with him and marks his evening tablets as taken. His status turns red with the reasons shown, the nurse calls and adjusts the diuretic dose by phone, and a readmission is avoided.

## Scope for 24h

**Must work in the demo**
- Login with the temporary password and setting your own
- Bolničar opens a rehabilitacija from a template
- Daily check-in from the template, with the "Pokličite 112" screen
- Dashboard with traffic lights and explained alerts
- Pill and exercise reminders with logging
- "Skrbim za" tab for family
- Live QR demo

**Clickable mock-ups only**
- Phone/SMS check-in

**Later**
- Email and SMS reminders, including for family
- Template editor for clinicians
- Step data from Google Fit / Apple Health
- LLM plain-language discharge letter

**Cut**
- Appointment booking (zVEM / eNaročanje already does this)
- Open doctor chat (doesn't scale)
- Filming our own rehab videos (embed existing physio videos instead)
- Separate "Moje okrevanje" view and emotional support screen (too generic; own trend is on the check-in end screen)

## Pitch

- **Lead with the evidence:** one slide per patient group with its key paper (`docs/research.md`). Check every number in the full paper first.
- **Answer the known weak points:** earlier trials failed when patients stopped using the system, and the benefit disappeared when monitoring stopped. zDoma answers with a 4-tap check-in, family support, and a rehabilitacija the bolničar can extend.
- **Present it as decision support:** staff decide and the system prioritises.
- **Integration:** built on FHIR, with patient data access in line with GDPR and the European Health Data Space.
- **Rollout:** pilot heart failure in one department, then add the other templates.

## Open questions

- [ ] Find a Slovenian heart-failure readmission or cost figure (NIJZ, ZZZS)
- [ ] Check the red-flag thresholds with someone who has medical knowledge (e.g. 2 kg in 2 or 3 days)
- [ ] Verify every number in the original papers before it goes on a slide
- [ ] Confirm with Ixtlan how patronaža assignment works in practice (teren by address, delovni nalog from hospital/GP)
- [ ] Confirm after how many days an uncollected prescription should alert (default 2) with Ixtlan / someone with medical knowledge
- [ ] Choose exercises and videos for all six groups from reputable sources
- [x] Pick the tech stack
- [x] Decide how family members connect to the patient
- [x] Choose the patient groups (six, heart failure first)
