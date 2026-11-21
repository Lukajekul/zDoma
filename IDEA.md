# zDoma: Post-Discharge Recovery Monitoring

ADAHack 2026, Challenge 1 (Ixtlan Team): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

The Slovenian `README.md` is the main project description. This file is the English summary of the idea. Evidence and sources: `docs/research.md`.

## One-liner

zDoma notices the problems patients don't report after discharge: medicines never collected from the pharmacy, missed pills, weight creeping up. It tries to sort them out with the patient and family first, and the patronažna sestra sees only what's left, always with a reason. The 30-second daily check-in is one input, not the product.

## The problem

After discharge, patients go home with little medical oversight. Complications such as heart-failure decompensation, infections or medication mistakes often go unnoticed until the patient is back in the emergency room. Nurses can't phone every patient every day, so they need a way to see who needs attention.

- About half of patients hospitalised for acute heart failure in Europe are readmitted within a year.
- 19% of patients have an adverse event within weeks of discharge, and 66% of those involve medicines.

## Core loop

**Patient and pharmacy (eRecept) give data → system flags → patient and family reminded first → only then staff act**

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

*Questionnaires ask how the patient feels. zDoma also knows whether they collected and took their medicines, and shows the nurse only what the patient and family couldn't sort out.*

Every other team will build a daily questionnaire with a traffic-light dashboard (Ixtlan's warning). These three are what we lead with:

1. **Medicines, from pharmacy to pill:** 66% of harm after discharge involves medicines. zDoma knows whether the patient collected each medicine (eRecept), whether they take it and when it runs out, without the patient typing anything. At discharge it shows what changed (Novo / Spremenjeno / Ukinjeno, with a photo of each box). eRecept is mocked for the hackathon.
2. **Built into patronaža, not a new workflow:** the patient is assigned by address to the patronažna sestra who already visits them. She installs the app at the first visit and does the first check-in with them. On her phone she sees her patients sorted by who needs her.
3. **The app chases the patient, not the nurse:** a missed check-in or uncollected medicine reminds the patient, then the family, and only then reaches staff. The nurse sees only what the patient and family couldn't fix.

### Why patients keep using it

Earlier trials failed when patients stopped using the system. So:

1. **"Danes", not menus:** the app opens on today's next action and ends with "Končano za danes ✓". A normal day is 3–4 taps.
2. **"Enako kot včeraj":** if nothing changed, one tap. The app asks more only when something is different.
3. **A progress ring for the whole recovery:** a circle filling counter-clockwise, one slice per day: green when the check-in was done, red when it was missed, grey for days to come, with the percentage in the middle and "Opravljeno 18 dni · Izpuščeno 2 dni · Še 10 dni" under it. The family sees the same ring.
4. **Something back every day:** own numbers ("72,4 kg – blizu vaše ciljne teže ✓", "Dan 6 od 30"), and the nurse's name when she acts ("Sestra Mojca vas bo poklicala danes do 12:00").

### Patient app
- **Daily check-in (about 30 s):** at most 6 questions, one per screen, **one tap per answer**. The template's questions come pre-ticked (the bolničar can untick any) and use this patient's own values ("Ali tehtate več kot 72 kg?"), not a generic form.
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
- **Discharge in three steps:** pick a template, enter the davčna številka and the patient's values (e.g. dry weight), confirm. Questions, medicines (template + eRecept), patronažna sestra and end date are pre-filled; changing them is optional.
- **Medicines in a few taps:** the template recommends the usual medicines for that illness, merged with what the patient already takes (eRecept). Tick one and tap a usual dose (Furosemid 20 / 40 / 80 mg). "Uredi" for anything else, "Dodaj zdravilo" for other medicines. Doses come from guidelines (`docs/medicines.md`), and only staff see the options.
- **The dashboard shows only problems.** Green patients are hidden, and every alert says why it fired.
- **Patronažna sestra assigned by address:** each covers a teren (občina, villages). At discharge the app suggests the right one, the bolničar confirms with one tap. No match → "Nedodeljeni" on the dashboard, nobody gets lost. "Nadomeščanje" covers leave.
- **Built for the patronažna sestra with many patients:** on her phone she searches and filters by "Moji pacienti", status, občina, template, missed check-in and medicines not picked up.
- **A daily reminder, every day:** "Dobro jutro, Janez. Čas je za današnji pregled." at the patient's time (default 8:00), even when all has been fine. The patient can move it but not switch it off.
- **The app chases the patient, not the nurse:** a missed check-in reminds the patient, then the family, and only then reaches staff.
- **One-tap actions:** "Poklicano – vse v redu", "Naročen pregled", "Obveščen osebni zdravnik".
- **Extend the rehabilitacija** with one button.
- Every change and action is written to the audit log automatically.

## Accounts and rehabilitacije

1. At the first discharge, the bolničar creates the patient's account and prints a **prijavni listek** with a login QR code, never on the odpustnica.
2. The patient scans the QR with the phone camera and is logged in: no password, no PIN. The phone stays logged in.
3. A **rehabilitacija** is one recovery episode. The bolničar opens it from a template and sets an end date, and can extend it. While active, check-ins, reminders and alerts run. After the end date it's read-only.
4. A returning patient keeps their account and ticket. The new rehabilitacija just appears.

The davčna številka isn't secret, so it never logs anyone in on its own. Staff and family log in with davčna številka + password.

**QR login:** the QR code on the prijavni listek is the patient's login: scan it and you're in, so an 80-year-old never types anything. The same QR can be shown on the patronažna sestra's or the zadolženec's phone. The ticket works like a key: if it's lost, "Nova koda QR" disables the old one at once and signs out every device.

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
3. On the dashboard on the projector, their card turns red, with the reasons: "Teža +2,5 kg v 3 dneh" and "Furosemid ni prevzet 3 dni po odpustu".
4. Show the escalation for the uncollected medicine: patient reminded first, then the daughter, only then the nurse.

**Patient story:** A 78-year-old man with heart failure, dry weight 72 kg. On days 3–5 after discharge his weight rises to 74.5 kg, his ankles swell and he skips one diuretic. His daughter, approved as his zadolženka, sees the missed pill. When she visits, she does the check-in with him and marks his evening tablets as taken. His status turns red with the reasons shown, the nurse calls and adjusts the diuretic dose by phone, and a readmission is avoided.

## Scope for 24h

**Must work in the demo**
- Daily check-in notification (Web Push)
- Patient login by scanning the QR ticket
- Bolničar opens a rehabilitacija from a template
- Daily check-in from the template, with the "Pokličite 112" screen
- Dashboard with traffic lights and explained alerts
- Pill and exercise reminders with logging
- Medicine pick-up (mocked eRecept) with escalation: patient → family → staff
- "Skrbim za" tab for family
- Live QR demo

All six templates exist as data files, but only heart failure is built and demoed end to end.

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

- **Lead with what others don't have:** medicines from pharmacy to pill, the patronaža fit, and the escalation ladder. The check-in is the 30-second input, not the product.
- **Evidence:** heart failure in depth with its key paper; the other five groups on one slide, "one data file each" (`docs/research.md`). Check every number in the full paper first.
- **Answer the known weak points:** earlier trials failed when patients stopped using the system, and the benefit disappeared when monitoring stopped. zDoma answers with a 4-tap check-in, family support, and a rehabilitacija the bolničar can extend.
- **Present it as decision support:** staff decide and the system prioritises.
- **Integration:** built on FHIR, with patient data access in line with GDPR and the European Health Data Space.
- **Rollout:** pilot heart failure in one department, then add the other templates.

## Open questions

- [ ] Find a Slovenian heart-failure readmission or cost figure (NIJZ, ZZZS)
- [ ] Check the red-flag thresholds with someone who has medical knowledge (e.g. 2 kg in 2 or 3 days)
- [ ] Verify every number in the original papers before it goes on a slide
- [ ] Check the patronaža workflow with Ixtlan: whether and when the patronažna sestra visits after discharge (delovni nalog from hospital or GP), whether the teren is really assigned by address, whether she'd install the app at the first visit, and whether a "who needs me" list would save her work (e.g. instead of phoning every patient)
- [ ] Confirm after how many days an uncollected prescription should alert (default 2) with Ixtlan / someone with medical knowledge
- [ ] Choose exercises and videos for all six groups from reputable sources
- [x] Pick the tech stack
- [x] Decide how family members connect to the patient
- [x] Choose the patient groups (six, heart failure first)
