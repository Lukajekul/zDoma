# Lovable prompt: zDoma clickable prototype

Paste everything inside the block below into Lovable as the first prompt. It asks for a front-end-only prototype with mock data, so the team can agree on the screens before building the real app.

```
Build a clickable front-end prototype of "zDoma", a Slovenian web app for monitoring patients at home after hospital discharge. Front end only: no backend, no Supabase, no real login. Use hard-coded mock data and React state. Use React, TypeScript, Tailwind and shadcn/ui.

ALL UI TEXT MUST BE IN SLOVENIAN, using the exact strings below. Use Slovenian formats: dates "21. 11. 2026", times "8:00", decimal comma "74,5 kg".

USERS ARE OFTEN ELDERLY (around 80, poor eyesight, rarely use smartphones). Design rules:
- Mobile first (design at 390 px wide), but it must also look tidy on a desktop: centred column with a max width. The staff dashboard may use the full desktop width.
- Very simple: one main action per screen, short sentences, few large buttons. A clear "Nazaj" (back) button on every screen except home.
- Body text at least 18 px, buttons at least 48 px high, high contrast, generous spacing.
- Never use colour alone: every status shows colour + word, e.g. a green badge "Zeleno – vse v redu", yellow "Rumeno – spremljamo", red "Rdeče – potrebna pozornost".
- Icons always have a text label. No hidden menus, no swipe-only actions.
- After any action show a big, clear confirmation, e.g. "Shranjeno ✓".
- Calm, trustworthy healthcare look: white/very light background, one deep blue-teal accent, no gradients, no emoji.

PROTOTYPE NAVIGATION: add a small floating "Prototip" switcher (bottom corner) to jump between three roles: Pacient, Svojec, Bolničar. Start on the login screen.

SCREENS

1. Prijava (login)
- Title "zDoma". Fields: "Davčna številka" (8 digits) and "Geslo". Big button "Prijava".
- Small link "Svojec? Ustvarite račun" (family registration: davčna številka, ime in priimek, geslo).

2. Novo geslo (first login)
- Text: "Prvič ste se prijavili z začasnim geslom. Nastavite svoje geslo."
- Fields "Novo geslo" and "Ponovite geslo", hint "Lahko je tudi 6-mestna številka (PIN)". Button "Shrani geslo".

PATIENT (Pacient: Janez Novak, 78, heart failure)

3. Danes (home = today's next action, not a menu)
- Greeting "Dober dan, Janez". Status badge. Small line "Srčno popuščanje · Dan 6 od 30".
- If a nurse acted: card with her photo "Sestra Mojca vas bo poklicala danes do 12:00".
- ONE big card with the next action, e.g. "Stopite na tehtnico" (button "Začni"). After it, the next one appears: tablets at 8:00, then "Vaja: hoja 10 minut".
- When all is done: "Končano za danes ✓ Jutri ob 8:00."
- Small links below: "Vsa zdravila", "Vaje", "Svojci z dostopom".

4. Pregled stanja (daily check-in), one question per screen, every answer ONE tap:
- First screen: huge button "Enako kot včeraj" (only weight is still asked) and smaller "Nekaj je drugače".
- "Koliko tehtate danes zjutraj?" as a row of big buttons 72,0 / 72,5 / 73,0 / 73,5 / 74,0 kg around yesterday's weight, plus "Drugo".
- "Ali imate otekle gležnje?" big "Da" / "Ne".
- "Ali težje dihate kot včeraj?" big "Da" / "Ne".
- "Ali imate bolečino v prsih?" big "Da" / "Ne". If "Da", go to screen 5.
- End: "Shranjeno ✓", "72,4 kg – blizu vaše ciljne teže 72 kg ✓", a small 7-day weight line with the 72 kg target, "Jutri ob 8:00 spet".

5. Nujno (emergency, full screen, red)
- Huge text "Pokličite 112", subtext "Bolečina v prsih je lahko nujno stanje. Ne čakajte." Huge button "Pokliči 112" (tel:112) and a smaller "Nazaj".

6. Zdravila (pills)
- On the first open after discharge: "Kaj se je spremenilo" with three groups: "Novo" (Spironolakton 25 mg), "Spremenjeno" (Furosemid 20 mg → 40 mg), "Ukinjeno – tega ne jemljite več" (Ibuprofen). Each with a photo of the box. Button "Razumem".
- Then times of day with box photo, name, dose, what it's for in plain words ("Furosemid 40 mg – odvaja odvečno vodo"), and "Prevzeto v lekarni ✓" or "Še ni prevzeto". Big button "Vzeto" per dose; taken doses show "Vzeto ob 8:05 ✓".
- Warning card when close to running out: "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept."

7. Vaje (rehab)
- Exercise cards with a placeholder image, title, 3 short steps, repetitions, button "Opravljeno". After it: "Bolečina 0–10?" as 11 large number buttons.

8. Svojci z dostopom
- Pending request card: "Ana Novak želi spremljati vaše okrevanje" with "Dovoli" / "Zavrni".
- List of approved family members with "Odstrani".

FAMILY (Svojec: Ana Novak, the daughter)

9. Skrbim za (read-only)
- Card for "Janez Novak" with status badge and today: which pills were taken or missed, check-in done or not, exercises done or skipped. Clearly marked "Samo za ogled".
- Button "Zaprosi za dostop" opens a field "Davčna številka bolnika" and always replies "Prošnja poslana".
- Switch "Prejemaj obvestila" (off by default) with options "E-pošta" / "SMS" (prototype only).

STAFF (Bolničar: med. sestra Maja Kos). Desktop-first but still works on mobile.

10. Nadzorna plošča (dashboard)
- Headline "3 bolniki potrebujejo pozornost". Only red and yellow patients are shown; toggle "Pokaži vse (24)".
- Each row: name, age, template, status badge, and the reason in one sentence, e.g. "Teža +2,5 kg v 3 dneh, otekli gležnji, izpuščen diuretik".
- Button "Odpri novo rehabilitacijo".

11. Bolnik (patient detail)
- Alert reasons, 7-day trends (weight, breathlessness), pills taken/missed, rehab done, a short summary paragraph.
- One-tap actions: "Poklicano – vse v redu", "Naročen pregled", "Obveščen osebni zdravnik".
- Rehabilitation box: "Aktivna do 21. 12. 2026" with button "Podaljšaj" (choose +14 / +30 / +60 dni).
- Small "Dnevnik sprememb" list (who, when, what).

12. Nova rehabilitacija (open at discharge), short form in steps:
- Choose a template (6 big cards): "Srčno popuščanje", "Po infarktu ali operaciji srca", "Nov kolk ali koleno", "KOPB", "Možganska kap", "Rak na sistemskem zdravljenju".
- "Davčna številka bolnika", "Ime in priimek" (only if new), editable list of medicines pre-filled from the template, end date pre-filled (e.g. +30 dni).
- Button "Odpri rehabilitacijo", then show the printable "Prijavni listek": davčna številka, "Začasno geslo: KM7P-4XQ2", "Velja do: 28. 11. 2026", a QR placeholder, and the note "Hranite ločeno od odpustnice." Buttons "Natisni" and "Novo začasno geslo".

MOCK DATA: Janez Novak (78, srčno popuščanje, dry weight 72 kg, weights over 5 days 72,0 → 72,4 → 73,1 → 74,0 → 74,5, status red), plus about 20 other patients across the six templates, mostly green, a few yellow. Use made-up names only.

Keep components small and reusable: StatusBadge, BigButton, TaskCard, QuestionStep, EmergencyScreen.
```

## After Lovable generates it

- Click through all three roles on a phone-sized window and note what feels too complex for an 80-year-old.
- Screenshot the screens the team agrees on and attach them to the UI tasks (T-01, T-05 to T-09, T-20, T-21). Agents build the real app in this repo; the Lovable code is only a reference.
