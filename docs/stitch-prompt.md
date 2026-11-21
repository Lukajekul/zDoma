# Google Stitch prompts: zDoma screens

Stitch gives the best results one screen (or a small group of screens) per prompt, all in the same project so the style carries over. How to use this file:

1. Create one Stitch project. Paste the **Design brief** as the first prompt, together with screen 1.
2. Then paste each screen prompt below on its own. Start every later prompt with "Same zDoma design system as before." if Stitch drifts.
3. Patient and family screens: **Mobile** mode. Staff screens: run each one in **both Web and Mobile** mode (the bolničar works at a PC, the patronažna sestra on her phone).
4. Export the screens the team agrees on and attach them to the UI tasks in `TASKS.md`. Stitch output is a visual reference only; the real app is built in this repo.

---

## Design brief (paste first)

```
Design "zDoma", a Slovenian app that follows patients at home after hospital discharge. Three kinds of users: the discharged patient (often around 80, poor eyesight, rarely uses a smartphone), a family member who helps them, and hospital / community nurses.

ALL TEXT IN SLOVENIAN, exactly as written in the prompts. Slovenian formats: dates "21. 11. 2026", times "8:00", decimal comma "74,5 kg".

Look and feel:
- Calm, trustworthy public-healthcare look. White or very light warm-grey background, dark near-black text, ONE deep blue-teal accent (#0F5F6E or similar) for primary buttons. No gradients, no glassmorphism, no emoji, no stock-photo hero images, no decorative illustrations.
- Very large and readable: body text at least 18 px, headings 28–32 px, primary buttons full width and at least 56 px high with 20 px text, generous spacing, high contrast (WCAG AAA where possible).
- One main action per screen. Short sentences. No hamburger menus, no hidden actions, no swipe-only gestures.
- Every screen except the home screen has a clear "‹ Nazaj" button at top left.
- Every icon has a visible text label.
- Status is never colour alone, always colour + word in a pill badge: green "Zeleno – vse v redu", yellow "Rumeno – spremljamo", red "Rdeče – potrebna pozornost".
- Confirmations are big and obvious: "Shranjeno ✓".
- Mobile first at 390 px wide. On desktop, patient screens sit in a centred column (max ~480 px). Staff screens are designed twice, for desktop (1440 px, full width) and for mobile (390 px), with the same content.
- Rounded corners 12–16 px, subtle 1 px borders instead of heavy shadows. Font: a highly legible sans-serif such as Atkinson Hyperlegible or Inter.

Recurring people (made-up): patient Janez Novak (78, srčno popuščanje / heart failure, target weight 72 kg), his daughter Ana Novak (family member), community nurse "Sestra Mojca Kovač" (patronažna sestra, area Šentjur), hospital nurse "Maja Kos" (bolničar).

Recurring component, the PROGRESS RING: a thick circle that starts at 12 o'clock and fills counter-clockwise, divided into one slice per day of the 30-day recovery, each day split into small segments for that day's questions. Answered = green, past days left unanswered = red, future days = light grey. Big percentage in the middle ("75 %"), and under the ring always in words: "Opravljeno 18 dni · Izpuščeno 2 dni · Še 10 dni". No points, badges or trophies.
```

---

## Login (Mobile)

**1. Prijava**
```
Login screen. Large title "zDoma", subtitle "Spremljanje okrevanja doma". Field "Davčna številka" (8 digits, numeric keypad hint) and field "Geslo ali PIN" with a "Pokaži" toggle. Full-width primary button "Prijava". Below, a secondary link "Ste svojec? Ustvarite račun". Small footer text: "zDoma ni služba za nujno pomoč. V nuji pokličite 112."
```

**2. Prijava s kodo QR**
```
Login after scanning the personal QR code. Card at the top: "Prijava za" + "Davčna številka 1234 5679" (already filled, read-only) with small link "To nisem jaz". Big heading "Vpišite svoj PIN". Six large PIN boxes and a big on-screen numeric keypad (digits 0–9, "Briši"). Primary button "Prijava". Also show the error state variant below as a separate frame: red-bordered message with icon and text "Napačen PIN. Še 2 poskusa." and a locked variant: "Prijava je zaklenjena za 15 minut. Pokličite svojo patronažno sestro."
```

**3. Novo geslo (first login)**
```
First-login screen. Heading "Nastavite svoje geslo". Text: "Prvič ste se prijavili z začasnim geslom. Zdaj si izberite svoje." Fields "Novo geslo" and "Ponovite geslo", hint under them "Lahko je tudi 6-mestna številka (PIN), ki si jo boste zapomnili." Primary button "Shrani geslo".
```

**4. Registracija svojca**
```
Family member registration, a 2-step form with a step indicator "Korak 1 od 2". Step 1: "Vaša davčna številka", "Ime in priimek". Step 2: "Geslo", "Ponovite geslo". Primary button "Naprej" / "Ustvari račun". Info box: "Po registraciji boste zaprosili za dostop. Bolnik mora prošnjo potrditi."
```

---

## Patient: odpuščenec (Mobile)

**5. Moje rehabilitacije**
```
Shown only when the patient has more than one active recovery. Heading "Vaše okrevanje". Two big tappable cards: "Srčno popuščanje · Dan 6 od 30 · Zeleno – vse v redu" and "Nov kolk ali koleno · Dan 12 od 60 · Rumeno – spremljamo". Below, a section "Pretekle rehabilitacije" with a muted card "Po infarktu · 3. 3. 2025 – 2. 4. 2025 · Zaključena" (read only).
```

**6. Danes (patient home)**
```
The patient's home screen is NOT a menu: it shows today's next action, one at a time. Top: "Dober dan, Janez", small line "Srčno popuščanje · Dan 6 od 30", status badge "Zeleno – vse v redu". Then the PROGRESS RING, large, centred, about 30 % filled counter-clockwise from 12 o'clock with mostly green and one red slice, "20 %" in the middle, under it "Opravljeno 5 dni · Izpuščeno 1 dan · Še 24 dni".
Then a card with the nurse's round photo: "Sestra Mojca vas bo poklicala danes do 12:00."
Then ONE big action card with a large icon + label: "Stopite na tehtnico", text "Nato odgovorite na 4 kratka vprašanja. Traja 30 sekund.", full-width primary button "Začni".
Under it a muted line "Pozneje danes: tablete ob 20:00, vaja hoja 10 minut".
Bottom: three large labelled secondary buttons in a column: "Vsa zdravila", "Vaje", "Svojci z dostopom", and small text "Vaša patronažna sestra: Mojca Kovač · 03 123 45 67".
Also make a second frame of the same screen in its finished state: big green check, "Končano za danes ✓", "Jutri ob 8:00 spet.", ring now slightly fuller.
```

**7. Pregled stanja – začetek**
```
Start of the daily check-in. Heading "Današnji pregled". Text "Včeraj je bilo vse v redu." One HUGE primary button (about 120 px high) "Enako kot včeraj" with subtext "Vprašali vas bomo samo za težo". Below it a large secondary outline button "Danes je nekaj drugače". Step dots at the top.
```

**8. Pregled stanja – teža**
```
One question per screen, every answer one tap. Progress text "Vprašanje 1 od 4". Large question "Koliko tehtate danes zjutraj?" Small hint "Včeraj: 72,5 kg". A vertical stack of five big full-width answer buttons: "72,0 kg", "72,5 kg", "73,0 kg", "73,5 kg", "74,0 kg", plus a sixth outline button "Drugo". No sliders, no text fields.
```

**9. Pregled stanja – da/ne vprašanje**
```
One question per screen. Progress "Vprašanje 3 od 4". Large question "Ali težje dihate kot včeraj?" Two huge side-by-side answer buttons, each at least 120 px tall, with words and icons: "Da" and "Ne". Neutral colours, the buttons themselves are not red or green.
```

**10. Pregled stanja – konec**
```
Check-in end screen that gives something back. Big "Shranjeno ✓" at the top. The PROGRESS RING with today's slice just turned green. Card: "72,4 kg – blizu vaše ciljne teže 72 kg ✓". A small, simple 7-day weight line chart with a dashed target line at 72 kg and Slovenian day labels (pon, tor, sre...). Text "Dan 6 od 30". Primary button "Nazaj na Danes". Muted line "Jutri ob 8:00 spet."
Second frame variant for a worrying answer: same layout but instead of the weight praise a calm yellow-bordered card "Sestra bo pogledala vaše podatke danes." (no diagnosis, no alarm).
```

**11. Pokličite 112 (emergency)**
```
Full-screen emergency screen, solid deep red background, white text. Huge heading "Pokličite 112". Text "Bolečina v prsih je lahko nujno stanje. Ne čakajte." A huge white button with a phone icon "Pokliči 112". Below, a small outlined white button "Nazaj". Nothing else on the screen.
Second frame for cancer patients with fever: same structure but dark orange, heading "Pokličite oddelek", text "Vročina 38 °C ali več med zdravljenjem raka je lahko nevarna.", button "Pokliči oddelek: 01 522 00 00".
```

**12. Kaj se je spremenilo (medicine changes)**
```
Shown on the first open after discharge. Heading "Kaj se je spremenilo pri zdravilih". Three clearly labelled sections, each with a word label AND colour:
"Novo" – card with a photo of the medicine box, "Spironolakton 25 mg", "Zjutraj · pomaga srcu in odvaja vodo".
"Spremenjeno" – card "Furosemid", showing "Prej 20 mg → zdaj 40 mg", "Zjutraj".
"Ukinjeno – tega ne jemljite več" – card with the box photo crossed out, "Ibuprofen 400 mg".
Primary button "Razumem".
```

**13. Zdravila (today's pills)**
```
Today's medicines grouped by time of day: "Zjutraj · 8:00", "Zvečer · 20:00". Each medicine card: box photo, name and dose "Furosemid 40 mg", plain words what it's for "Odvaja odvečno vodo", pharmacy status chip "Prevzeto v lekarni ✓" or a yellow chip "Še ni prevzeto v lekarni", and a big button "Vzeto". Taken doses show a green row "Vzeto ob 8:05 ✓" with a small "Razveljavi" link. One entry shows "Označila: Ana (hčerka)".
At the top a yellow warning card: "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept."
```

**14. Vaje (exercises)**
```
Exercise screen. Card with a large simple line illustration placeholder, title "Hoja 10 minut", three numbered short steps ("Obujte udobne čevlje.", "Hodite počasi po stanovanju ali pred hišo.", "Če se zadihate, se ustavite in počijte."), and "1-krat na dan". Primary button "Opravljeno". Second frame after tapping it: question "Koliko vas je bolelo?" with 11 large number buttons 0–10 in a 4-column grid, labels "0 = nič" and "10 = najhuje".
```

**15. Svojci z dostopom**
```
Family access management. A highlighted request card: "Ana Novak želi spremljati vaše okrevanje." with two big buttons "Dovoli" and "Zavrni". Below, "Kdo ima dostop": list row "Ana Novak (hčerka) · prejema obvestila" with an outline button "Odstrani". Info text: "Svojci vidijo vaša zdravila, vaje in preglede. Načrta ne morejo spreminjati."
```

**16. Nastavitve**
```
Simple settings. "Ura opomnika": big time chips "7:00", "8:00" (selected), "9:00", "10:00", "Drugo"; note "Opomnik prejmete vsak dan, dokler traja okrevanje." Row "Nova koda QR za prijavo" with explanation "Stara koda takoj preneha delovati." Row "Spremeni PIN". Big outline button "Odjava".
```

---

## Family: zadolženec (Mobile)

**17. Skrbim za**
```
Family member's "Skrbim za" tab. Header card "Janez Novak" with status badge "Rumeno – spremljamo" and a small PROGRESS RING (64 %) with "Opravljeno 4 dni · Izpuščeno 2 dni · Še 24 dni".
At the very top a yellow warning: "Furosemid še ni prevzet v lekarni (3 dni po odpustu)."
Section "Danes": rows with word statuses – "Pregled stanja: ni še opravljen", "Tablete 8:00: vzete ✓", "Tablete 20:00: še ne", "Vaja: izpuščena". Buttons "Vzeto", "Opravljeno" and a big primary "Pregled skupaj z Janezom".
Switch "Prejemaj obvestila" (off) with options "E-pošta" / "SMS".
Secondary button "QR za prijavo" (to show Janez his login QR). Muted note "Načrta ne morete spreminjati."
Bottom tab bar with labelled icons: "Moje okrevanje", "Skrbim za".
```

**18. Zaprosi za dostop**
```
Heading "Zaprosi za dostop". Field "Davčna številka bolnika", primary button "Pošlji prošnjo". Second frame: big check "Prošnja poslana", text "Ko bo bolnik prošnjo potrdil, ga boste videli pod Skrbim za."
```

---

## Staff: bolničar and patronažna sestra (Web + Mobile)

Every staff screen is needed on **both** a PC and a phone: the hospital bolničar mostly works at a desktop, the patronažna sestra mostly on her phone. Run each prompt below **twice in the same project: once in Web mode, once in Mobile mode.** Each prompt says how the layout changes between the two.

Shared staff layout (add to the first staff prompt):
```
Staff app layout, same zDoma design system. Desktop (1440 px): left sidebar with logo "zDoma" and labelled nav items "Bolniki", "Danes obiščite", "Nova rehabilitacija", "Nadomeščanje", and the signed-in user "Maja Kos · bolničar" at the bottom; content uses the full width with multi-column grids. Mobile (390 px): no sidebar and no hamburger menu; a bottom tab bar with the same four items as labelled icons; content in a single column; tables become stacked cards; side panels move below the main content; primary action buttons are full width and sticky at the bottom. Same text, same data, same components on both.
```

**19. Bolniki – seznam (Web + Mobile)**
```
Patient list for nurses. Header "3 bolniki potrebujejo pozornost", search field "Išči po imenu ali davčni številki", primary button "Odpri novo rehabilitacijo".
Big filter chips with counts: "Moji pacienti (24)" (active), "Rdeče (3)", "Rumeno (5)", "Zeleno – skrito", "Občina", "Skupina", "Brez pregleda danes (2)", "Zdravila niso prevzeta (1)", "Nedodeljeni (2)", and a text button "Počisti filtre". Toggle "Pokaži tudi zelene (16)".
Patients: "Janez Novak · Šentjur · Srčno popuščanje · Rdeče – potrebna pozornost · Teža +2,5 kg v 3 dneh, otekli gležnji · odprto 2 h"; "Marija Zupan · Slovenske Konjice · KOPB · Rumeno – spremljamo · Ni opravila pregleda 2 dni"; "Franc Horvat · Šentjur · Nov kolk ali koleno · Rumeno – spremljamo · Furosemid ni prevzet 3 dni po odpustu"; one "Nedodeljeni" patient with a "Prevzemi" button; one patient tagged "Ni nameščeno" (first home visit still to do).
Desktop: chips in one wrapping row, a clean table with columns Ime, Kraj, Skupina, Stanje, Razlog, Odprto.
Mobile: search on top, chips wrapping over several lines, each patient as a full-width card (name, kraj, status badge with word, one-line reason, "Odprto 2 h"); "Odpri novo rehabilitacijo" as a sticky bottom button.
```

**20. Danes obiščite (Web + Mobile)**
```
Community nurse's day plan. Heading "Danes obiščite · 6 bolnikov". Grouped under občina headers ("Šentjur", "Dobrna"), inside each ordered by status. Each patient: name, address, status badge with word, reason, buttons "Pokliči" and "Prvi obisk" (the latter only on new patients).
Desktop: občine as side-by-side columns of cards.
Mobile: one column, občina headers sticky while scrolling, big full-width buttons.
```

**21. Bolnik – podrobnosti (Web + Mobile)**
```
Patient detail. Header: "Janez Novak, 78 · Srčno popuščanje · Šentjur", badge "Rdeče – potrebna pozornost", "Patronažna sestra: Mojca Kovač".
Red-bordered "Razlogi" card: "Teža +2,5 kg v 3 dneh", "Otekli gležnji 2 dni zapored", "Izpuščen Furosemid včeraj".
Three big one-tap actions: "Poklicano – vse v redu", "Naročen pregled", "Obveščen osebni zdravnik".
Cards: 7-day weight line chart with dry-weight 72 kg reference line; breathlessness yes/no strip; "Zdravila" taken/missed per day with pharmacy pick-up status; "Vaje" done/skipped; "Sodelovanje 85 %" with a small progress ring; short plain-text summary paragraph.
Box "Rehabilitacija: aktivna do 21. 12. 2026" with "Podaljšaj" (chips "+14 dni", "+30 dni", "+60 dni"), "Pokaži QR za prijavo", "Novo začasno geslo".
"Dnevnik sprememb" (who, when, what), e.g. "Maja Kos · 18. 11. 2026 10:12 · Odprla rehabilitacijo".
Desktop: reasons and actions across the top, a 2–3 column grid of cards, the rehabilitacija box in a right side column, log at the bottom.
Mobile: order is header → Razlogi → action buttons stacked full width → charts one per card (full width, simplified axes) → rehabilitacija box → log collapsed under "Pokaži dnevnik sprememb". Medicine table becomes a list per medicine.
```

**22. Nova rehabilitacija – čarovnik (Web + Mobile)**
```
Discharge wizard with a step indicator "1 Skupina · 2 Bolnik · 3 Zdravila · 4 Vprašanja in sestra · 5 Potrdi". One frame per step:
Step 1: six big template cards with labelled icons: "Srčno popuščanje", "Po infarktu ali operaciji srca", "Nov kolk ali koleno", "KOPB", "Možganska kap", "Rak na sistemskem zdravljenju".
Step 2: "Davčna številka bolnika", "Ime in priimek" (marked "samo za novega bolnika"), "Suha teža (kg)" = 72.
Step 3: medicines as cards, each with a tick box, name, plain-language purpose and big dose chips: "Furosemid" [20 mg][40 mg][80 mg] + [zjutraj][zvečer]; "Bisoprolol" [1,25 mg][2,5 mg][5 mg]; "Ramipril"; "Spironolakton"; "Dapagliflozin". Tag "Že jemlje (eRecept)" on pre-filled ones, small "Uredi" and "Odstrani" links per card, "+ Dodaj zdravilo" with a search field.
Step 4: ticked check-in questions using the patient's values ("Ali tehtate več kot 72 kg?", "Ali imate otekle gležnje?"...), suggested nurse "Patronažna sestra: Mojca Kovač (Šentjur)" with "Potrdi" / "Zamenjaj", end date pre-filled "Konec: 21. 12. 2026 (30 dni)".
Step 5: summary and primary button "Odpri rehabilitacijo".
Desktop: template cards in a 3×2 grid, medicine cards in 2 columns, a summary panel on the right that fills in as steps are completed, "Nazaj" / "Naprej" at the bottom right.
Mobile: step indicator as "Korak 3 od 5" with a thin bar, everything in one column, template cards stacked, dose chips wrapping, sticky full-width "Naprej" at the bottom and "‹ Nazaj" at top left.
```

**23. Prijavni listek (Web + Mobile)**
```
A printable A5 sheet, black on white. Title "zDoma – prijavni listek". "Janez Novak", "Davčna številka: 1234 5679", a large QR code, "Začasno geslo: KM7P-4XQ2" in a big monospace font, "Velja do: 28. 11. 2026". Three numbered steps: "Skenirajte kodo QR s telefonom.", "Vpišite začasno geslo.", "Nastavite svoj PIN." Boxed note: "Hranite ločeno od odpustnice." Patronažna sestra name and phone at the bottom.
Desktop: the sheet as a print preview in the centre, buttons "Natisni" and "Novo začasno geslo" beside it.
Mobile: the sheet scaled to the screen width, the QR large enough to scan from the phone, buttons stacked below.
```

**24. Prvi obisk (Web + Mobile)**
```
Checklist for the first home visit. Heading "Prvi obisk · Janez Novak". Big checklist rows with tick boxes and short helper text: "Prijava na bolnikovem telefonu", "Nastavljen PIN", "zDoma dodan na začetni zaslon", "Dovoljena obvestila", "Prvi pregled stanja opravljen skupaj". Secondary button "Pokaži QR za prijavo". Primary button "Nameščeno ✓".
Mobile (main use, at the patient's home): single column, sticky "Nameščeno ✓" at the bottom.
Desktop: checklist on the left, the patient's login QR shown large on the right.
```

**25. Nadomeščanje (Web + Mobile)**
```
Hand over a nurse's patients while she is away. Heading "Nadomeščanje". "Sestra: Mojca Kovač (24 bolnikov)", "Nadomešča" picker with "Ana Kralj", "Do: 5. 12. 2026" date field. Note "Bolniki se po tem datumu samodejno vrnejo." Primary button "Potrdi nadomeščanje". List of current handovers with "Prekliči".
Desktop: form on the left, current handovers as a table on the right.
Mobile: form on top, handovers as cards below, full-width buttons.
```

---

## Optional

**26. Pregled po SMS (Mobile)**
```
Mock of an SMS conversation on a basic phone screen for patients without a smartphone. Incoming: "zDoma: Dobro jutro, Janez. Koliko tehtate danes? Odgovorite s številko, npr. 72,5". Reply "72,4". Incoming: "Ali imate otekle gležnje? Odgovorite DA ali NE." Reply "NE". Incoming: "Hvala. Shranjeno. Jutri ob 8:00 spet."
```
