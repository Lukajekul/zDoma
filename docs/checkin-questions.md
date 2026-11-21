# Check-in questions from European guidelines (T-41)

The daily check-in questions for each of the six templates, each traced to a European source. T-29 copies them into `src/lib/templates/`.

## Is this "the European standard"?

**No single EU-wide standard sets the questions a patient answers at home.** No EU law, CEN norm or EMA document lists home check-in questions. What does exist, and what proves our questions, are:

1. **Guidelines from the European specialist societies**: ESC and its Heart Failure Association (heart), EAPC (cardiac rehab), ESO (stroke), ESMO (cancer).
2. **ECDC**, the EU agency, which defines a wound infection the same way for every European hospital.
3. **GOLD** for COPD. It's a global report, not a European one, but the ERS publishes its summary in the *European Respiratory Journal* and European pulmonologists work from it.

Each question below names the guideline sentence it rests on. So the honest line for the pitch is: *"Every question and threshold comes from the current guideline of the European specialist society for that disease."*

**Verification status**
- ✅ **Quoted**: read in the original source, quoted word for word.
- ⚠️ **To confirm**: from a secondary source, or the guideline text couldn't be opened. Check it before you quote it on stage, or ask someone with medical knowledge.

**Rules from `AGENTS.md` §5a still apply.** At most 5 questions a day, one tap per answer, the patient's own values in `{braces}`, and emergency answers go to "Pokličite 112" first. The guidelines say *what* to watch. Most don't set a yellow/red colour, so the "Alert" column means *a nurse looks at it*, and T-04 decides the colour.

**Blood pressure question (shared rule).** Srčno popuščanje, Po infarktu and Možganska kap always ask "Izmerite krvni tlak. Kakšen je?" whether or not the patient has a monitor. Answers: **Pod {ciljniTlak} · {ciljniTlak} ali več · Nimam ga**. "Nimam ga" saves no reading and **counts as not completed**: a red part of that day's slice in the progress ring (§5a), and the nurse sees "Brez merilnika tlaka". The target `{ciljniTlak}` is set per patient at discharge (default 130/80). No guideline gives a red-flag number for a single home reading, so a reading above target is only a trend for the nurse: alert after several days in a row (number of days to confirm, T-42).

---

## 1. Srčno popuščanje (`srcno-popuscanje`)

**Sources**
- **HFA/ESC self-care**: Jaarsma T et al. *Self-care of heart failure patients: practical management recommendations from the Heart Failure Association of the ESC.* Eur J Heart Fail 2021;23(1):157–174. doi:10.1002/ejhf.2008. [PMC8048442](https://pmc.ncbi.nlm.nih.gov/articles/PMC8048442/)
- **ESC patient site**: [heartfailurematters.org – Rapid weight gain](https://www.heartfailurematters.org/warning-signs/rapid-weight-gain/)

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Stopite na tehtnico. Koliko tehtate danes? *(vednoVprasaj)* | weight buttons around the last weight | **> +2 kg in 3 days** → alert "Teža +2,5 kg v 3 dneh" | HFA: *"a sudden unexpected weight gain of >2 kg in 3 days as a rule of thumb; however, this may need to be tailored to the individual patient."* ESC patient site: *"weigh yourself every day, at the same time, and to tell your doctor or nurse if you notice your weight increase by more than 2 kilos (3 pounds) in 3 days."* | ✅ |
| 2 | Ali vas danes bolj duši kot običajno? | Ne · Pri hoji bolj · Tudi ko ležim ali ponoči | "Tudi ko ležim ali ponoči" → alert | HFA Table 2 "Shortness of breath / dyspnoea" (during activity; lying flat/at night). Table 1: *"Consult your health care provider if you need to use more pillows at night due to shortness of breath (orthopnoea)…"* | ✅ |
| 3 | Ali so vam gležnji ali noge danes bolj otekli? | Ne · Da | Da → alert | HFA Table 2: *"Oedema (legs, hands, ankles, thighs, scrotum, waist, abdomen)"* | ✅ |
| 4 | Ste včeraj vzeli {zdravilo za vodo}? | Da · Ne | Ne → alert "Izpuščen diuretik" | HFA: *"Patients who are non‐adherent have significantly increased rates of hospitalization and decompensation."* and *"Recommend patients not to skip the diuretic therapy…"* | ✅ |
| 5 | Ali imate bolečino v prsih ali ste omedleli? | Ne · Da | Da → **Pokličite 112** | HFA Table 2 lists *"Chest pain"* and *"Dizziness"* as signs to monitor. That they mean 112 comes from `AGENTS.md` §5a. heartfailurematters has a page "Chest pain: when to get urgent medical help", not read. | ⚠️ |
| 6 | Izmerite krvni tlak. Kakšen je? | Pod {ciljniTlak} · {ciljniTlak} ali več · Nimam ga | see shared rule above | HFA Table 2 lists *"Blood pressure"* and *"Pulse"* among things to self-monitor | ✅ |

- Weight is checked against the patient's dry weight too (`{suhaTeza}`). The guideline says to tailor the 2 kg rule to the individual, so T-21 should let the bolničar change it.

## 2. Po infarktu ali operaciji srca (`srce-po-infarktu`)

**Sources**
- **ESC ACS guideline**: Byrne RA et al. *2023 ESC Guidelines for the management of acute coronary syndromes.* Eur Heart J 2023;44(38):3720–3826. doi:10.1093/eurheartj/ehad191. [OUP](https://academic.oup.com/eurheartj/article/44/38/3720/7243210). Sections 13.1 Cardiac rehabilitation, 13.1.3 Adherence and persistence, 14.7 Preparation for discharge.
- **EAPC cardiac rehab**: Ambrosetti M et al. *Secondary prevention through comprehensive cardiovascular rehabilitation: from knowledge to implementation. 2020 update.* Eur J Prev Cardiol 2021;28(5):460–495. doi:10.1177/2047487320913379. [OUP](https://academic.oup.com/eurjpc/article/28/5/460/6145619)
- **ECDC wound infection**: ECDC. *HAI-Net SSI protocol, version 2.3.* Stockholm: ECDC; 2025. [PDF](https://www.ecdc.europa.eu/sites/default/files/documents/surgical-site-infections-protocol-surveillance-2-3.pdf)

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Ste danes čutili bolečino ali pritisk v prsih? | Ne · Da, je minila · Da, še traja | "Še traja" → **Pokličite 112**; "je minila" → alert | ESC press releases tell people with chest pain or pressure to call emergency services immediately. The ACS guideline's red flag is *prolonged chest pain (>15 min) and/or recurrent pain within 1 h* (sec. 3.1.1), but that was not read word for word. | ⚠️ |
| 2 | Ste včeraj vzeli {zdravilo proti strjevanju krvi}? | Da · Ne | Ne → alert | EAPC Table 1: *"Adherence: to the medical regime, adequate lifestyle, and self-monitoring (weight, BP, symptoms)"*. ESC ACS sec. 13.1.3 "Adherence and persistence" exists, wording not read. | ✅ / ⚠️ |
| 3 | Ali vas bolj duši kot običajno? | Ne · Malo · Zelo, tudi v mirovanju | "Zelo" → alert | EAPC Table 1: self-monitoring of *"symptoms"*. No specific threshold. | ⚠️ |
| 4 | *(after surgery only)* Kakšna je rana? | V redu · Bolj rdeča, otekla ali boleča · Iz nje se cedi | either problem → alert + wound photo | ECDC 3.1.1 superficial SSI: *"purulent drainage… from the superficial incision"* or *"pain or tenderness, localised swelling, redness, or heat"*, within 30 days | ✅ |
| 5 | *(after surgery only)* Ali imate vročino 38 °C ali več? | Ne · Da | Da → alert | ECDC 3.1.2 deep SSI lists *"fever (> 38°C)"* | ✅ |
| 6 | Izmerite krvni tlak. Kakšen je? | Pod {ciljniTlak} · {ciljniTlak} ali več · Nimam ga | see shared rule above | EAPC Table 1: *"self-monitoring (weight, BP, symptoms)"* | ✅ |

- The walking plan is in the rehab module, not the check-in. EAPC: cardiac rehab *"has received the highest class of recommendation and level of evidence"* ✅.

## 3. Nov kolk ali koleno (`kolk-koleno`)

**Sources**
- **ECDC wound infection**: HAI-Net SSI protocol v2.3 (above).
- **WHO**: *Global guidelines for the prevention of surgical site infection*, 2nd ed., 2018. ISBN 978-92-4-155047-5. [WHO](https://www.who.int/publications/i/item/9789241550475)
- **ESA blood clots (VTE)**: European guidelines on perioperative venous thromboembolism prophylaxis, Eur J Anaesthesiol 2018 (+ 2024 update). ⚠️ Citation not checked.

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Kakšna je rana? (+ fotografija) | V redu · Bolj rdeča, otekla, topla ali boleča · Iz nje se cedi | either problem → alert | ECDC 3.1.1: *"pain or tenderness, localised swelling, redness, or heat"*, *"purulent drainage"* | ✅ |
| 2 | Ali imate vročino 38 °C ali več? | Ne · Da | Da → alert | ECDC 3.1.2: *"fever (> 38°C)"* | ✅ |
| 3 | Ali je ena meča otekla, topla ali boleča? | Ne · Da | Da → alert (possible clot) | ESA VTE guideline: patient education on clot warning signs. Not read. | ⚠️ |
| 4 | Ali vas je nenadoma začelo dušiti ali vas boli v prsih? | Ne · Da | Da → **Pokličite 112** (possible lung clot) | as #3 | ⚠️ |
| 5 | Kako močna je bolečina danes? | 0–2 · 3–5 · 6–8 · 9–10 | rising 3 days in a row → alert | No European source found for "pain rising over days". | ⚠️ |

- ECDC follows deep wound infections **for 90 days** when an implant is in place (*"within 90 days if implant* is in place"*) ✅. That supports a 90-day default length for this template.

## 4. KOPB (`kopb`)

**Sources**
- **GOLD 2023 executive summary**: Agustí A et al. *Global Initiative for Chronic Obstructive Lung Disease 2023 Report: GOLD Executive Summary.* Eur Respir J 2023;61(4):2300239. doi:10.1183/13993003.00239-2023. [ERS](https://publications.ersnet.org/lookup/doi/10.1183/13993003.00239-2023)
- The exacerbation definition below is taken from reviews that quote GOLD 2023, e.g. [PMC10447769](https://pmc.ncbi.nlm.nih.gov/articles/PMC10447769). ⚠️ Check it against the GOLD report.

GOLD 2023 defines a flare-up as *an event with dyspnoea and/or cough and sputum that worsen over < 14 days*. The questions follow those three symptoms.

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Ali vas danes bolj duši kot običajno? | Ne · Malo bolj · Mnogo bolj · Ne morem povedati cele povedi | "Mnogo bolj" → alert; "cele povedi" → **Pokličite 112** | GOLD 2023 definition: dyspnoea. The 112 sign comes from `docs/research.md` and has no source yet. | ⚠️ |
| 2 | Ali več kašljate kot običajno? | Ne · Da | Da → alert if it lasts 2+ days | GOLD 2023: cough | ⚠️ |
| 3 | Kakšen je izmeček? | Kot običajno · Ga je več · Rumen ali zelen | either change → alert | GOLD 2023: sputum | ⚠️ |
| 4 | Ste danes potrebovali {inhalator za olajšanje} več kot običajno? | Ne · Da | Da → alert | Not checked. | ⚠️ |
| 5 | Ali imate vročino 38 °C ali več? | Ne · Da | Da → alert | Not checked. | ⚠️ |

- COPD is the weakest-sourced template. Its questions match the GOLD definition, but none of the thresholds was read in a primary text: the GOLD and ERS/ATS PDFs couldn't be opened. Confirm them with a pulmonologist or the GOLD report.

## 5. Možganska kap (`mozganska-kap`)

**Sources**
- **ESO secondary prevention**: Dawson J et al. *ESO guideline on pharmacological interventions for long-term secondary prevention after ischaemic stroke or TIA.* Eur Stroke J 2022;7(3):I–II. doi:10.1177/23969873221100032. [PMC9446324](https://pmc.ncbi.nlm.nih.gov/articles/PMC9446324/)
- **ESO + SAFE, Stroke Action Plan for Europe**: *The Essentials of Stroke Care*, lay version, 2023. [PDF](https://strokeactionplan.org/wp-content/uploads/2023/02/SAP-E_Lay-Version_Essentials-of-Stroke-Care.pdf)
- **ESO/ESSD swallowing**: Dziewas R et al. Eur Stroke J 2021;6(3):LXXXIX–CXV. doi:10.1177/23969873211039721. [PMC8564153](https://pmc.ncbi.nlm.nih.gov/articles/PMC8564153)

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Ste opazili nov povešen kot ust, šibko roko ali nogo ali težave z govorom? | Ne · Da | Da → **Pokličite 112** | SAP-E: *"Stroke is a medical emergency… everyone across Europe can recognise stroke symptoms and know to call an ambulance."* The FAST signs (face, arm, speech) are the common European campaign, but no ESO page naming them was read. | ✅ / ⚠️ |
| 2 | Izmerite krvni tlak. Kakšen je? | Pod {ciljniTlak} · {ciljniTlak} ali več · Nimam ga | see shared rule above (default target 130/80) | ESO: *"BP lowering treatment to a target of <130/80 mmHg, except in subgroups at increased risk of harm"*. SAP-E: *"Blood pressure must be monitored regularly after leaving the hospital."* | ✅ |
| 3 | Ste včeraj vzeli {zdravilo proti strjevanju krvi}? | Da · Ne | Ne → alert | SAP-E: treatment choice should consider *"maximising compliance (to encourage the stroke survivor to take their medication as prescribed)"* | ✅ |
| 4 | Ste od včeraj padli? | Ne · Da | Da → alert | SAP-E: *"Stroke professionals should follow local practice to prevent falls."* | ✅ |
| 5 | Ste se pri jedi ali pitju zakašljali ali zadušili? | Ne · Da | Da → alert | ESO/ESSD recommends swallowing screening in all stroke patients, but in hospital. Use at home is our own choice. | ⚠️ |

- **Weekly, not daily**: "Ste se zadnje dni počutili žalostni ali brez volje?" SAP-E: assessment *"should include swallowing, mood"*, and *"A post-stroke check list should be used at follow-ups"* ✅. No ESO depression-screening guideline was found.
- The 130/80 target can't be one red-flag rule for everyone: the guideline excludes *"subgroups at increased risk of harm"*. The bolničar sets the patient's target at discharge.

## 6. Rak na sistemskem zdravljenju (`rak-sistemsko`)

**Sources**
- **ESMO PROMs**: Di Maio M et al. *The role of patient-reported outcome measures in the continuum of cancer clinical care: ESMO Clinical Practice Guideline.* Ann Oncol 2022;33(9):878–892. doi:10.1016/j.annonc.2022.04.007. It recommends electronic symptom reporting during treatment, with alerts for severe or worsening symptoms (per [Lancet Reg Health Eur 2024](https://www.thelancet.com/journals/lanepe/article/PIIS2666-7762(24)00172-8/fulltext)). ⚠️ The guideline text couldn't be opened.
- **ESMO febrile neutropenia**: Klastersky J et al. Ann Oncol 2016;27(suppl 5):v111–v118. doi:10.1093/annonc/mdw325. Fever = *oral temperature >38.3 °C, or two readings >38.0 °C over 2 h*, with low neutrophils. ⚠️ Read from a third-party copy only.
- **UKONS 24-hour triage tool v3** (UK Oncology Nursing Society, used by acute oncology lines in the UK): [ukons.org](https://ukons.org/resources/publicly-available-resources). ✅ Read. It's copyrighted ("cannot be reproduced"), so we follow its symptoms and grades and don't copy its text.

| # | Question (SL) | Answers | Alert | Source | |
|---|---|---|---|---|---|
| 1 | Koliko je vaša temperatura? | Pod 36,0 · 36,0–37,4 · 37,5–37,9 · 38,0 ali več | **see open question** → "Takoj pokličite oddelek: {telefonOddelka}" | UKONS "Fever on SACT": *"IF TEMPERATURE 37.5˚C OR ABOVE OR BELOW 36.0˚C OR GENERALLY UNWELL - URGENT ASSESSMENT"* ✅. ESMO 2016: >38.0 °C twice / >38.3 °C ⚠️ | ✅ / ⚠️ |
| 2 | Kolikokrat ste bruhali v zadnjih 24 urah? | Nič · 1–2 · 3–5 · 6 ali več | 3+ → alert | UKONS "Vomiting" grades 1–2 / 3–5 / 6–10 / >10 episodes in 24 h | ✅ |
| 3 | Kolikokrat ste imeli blato več kot običajno? | Nič · Do 3 · 4–6 · 7 ali več | 4+ → alert | UKONS "Diarrhoea": increase up to 3 / 4–6 / 7–9 / >10 a day | ✅ |
| 4 | Ali lahko jeste in pijete? | Normalno · Manj kot običajno · Skoraj nič | "Skoraj nič" → alert | UKONS "Nausea", "Mucositis", "Anorexia" | ✅ |
| 5 | Ali vas zelo duši, vas boli v prsih ali krvavite in krvavitev ne preneha? | Ne · Da | Da → **Pokličite 112** | UKONS: shortness of breath at rest, chest pain and uncontrolled bleeding → *"Advise 999"* (112 in the EU) | ✅ |

- **UKONS triage logic, worth copying into T-04**: *"All Green = self care advice · 1 Amber = review within 24 hours · 2 or more amber = escalate to red · Red = … face to face assessment as soon as possible."* ✅
- ESMO reportedly suggests keeping questionnaires to about 10–20 items. We use 5 a day. ⚠️

### ⚠️ Open question: fever threshold for cancer
`AGENTS.md` §5a says **≥ 38 °C** → ward phone. UKONS, the triage tool actually used on oncology phone lines, already escalates at **37,5 °C or below 36,0 °C**. ESMO's definition of neutropenic fever is >38,0 °C twice or >38,3 °C once. Someone with oncology knowledge needs to choose, and then update `AGENTS.md`. Until then, the buttons above can follow either rule.

---

## Still to confirm before the pitch
- [ ] **Over the 5-question limit:** with blood pressure added, Srčno popuščanje has 6 questions, and Po infarktu after surgery has 6. Either the bolničar unticks one at discharge (never the 112 question), or `AGENTS.md` §5a allows 6. Needs a team decision.
- [ ] "Nimam ga" turns part of every day red for a patient without a monitor, and red never turns green. Is that the intended nudge to get one, or should the bolničar untick the question when the patient has no monitor?
- [ ] HF: heartfailurematters "Chest pain" page as the 112 source.
- [ ] After MI: the ESC ACS 2023 wording on chest pain and when to call emergency services, and on DAPT adherence.
- [ ] Hip/knee: ESA VTE guideline citations and clot warning signs; any European source for "pain rising over days".
- [ ] COPD: GOLD 2023/2025 report text (definition, severe signs, "can't finish a sentence"), and the ERS/ATS 2017 exacerbation guideline.
- [ ] Stroke: an ESO page that names FAST and 112; whether swallowing questions make sense at home.
- [ ] Cancer: ESMO PROM guideline full text (recommended symptoms, grades), ESMO 2016 fever definition from the journal, and the fever threshold decision above.
