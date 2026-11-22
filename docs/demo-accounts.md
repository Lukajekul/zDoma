# Demo accounts

Seed data from `npm run seed` (T-10) on the shared zDoma project. **All people and davčne številke are made up** (reserved range `99xxxxxx`); none belong to a real person.

## How to log in

- **Every seeded account** uses the demo password **`zdoma-eupRh0qTB1SQ`** (it is `SEED_PASSWORD` in `.env.local`).
- **Bolničarji** and **študenti** log in at `/prijava` → "Osebje" with the **e-pošta** below (T-67, T-86). **Zadolženci** log in at `/prijava` → "Svojci" with their davčna številka. **Patients (odpuščenci)** log in at `/prijava/pacient` ("Sem pacient" on the home page).
- This repo is public, so anyone can use this password on the live site. Data is synthetic. To change it: set a new `SEED_PASSWORD` in `.env.local`, run `npm run seed`, and update this line.
- **To show the QR login:** as a bolničar open a patient and press "Nova koda QR". The printed QR logs the patient in once, then asks them to set their own password (T-54); after that the demo password above no longer works for that patient until the seed is re-run.
- The seed is kept small for the 3-minute demo (T-87): 8 patients, 2 bolničarji, 2 zadolženci, 1 študent. `npm run seed` also gives Stanko Zupančič his approved plan (T-80). Re-running it keeps every davčna številka below; only dates and addresses move with today (last run: 22. 11. 2026).

## Demo story

| Davčna / e-pošta | Geslo | Who | What to show |
|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | **Janez Novak** (patient, Šentjur) | Srčno popuščanje, day 7. Dry weight 72 kg → 74,5 kg today, swollen ankles, diuretic missed yesterday → **Rdeče** with 4 reasons ("Teža +2,5 kg v 3 dneh" …). |
| 99000580 | `zdoma-eupRh0qTB1SQ` | **Ana Novak** (zadolženec) | Janez's daughter, approved. Marks his evening pills ("Označila: Ana (hčerka)"). |
| mojca.kovac@zdoma.demo | `zdoma-eupRh0qTB1SQ` | **Mojca Kovač** (bolničar) | The only patronažna sestra: covers every občina except Šmarje pri Jelšah, so Janez and every other patient (except "Nedodeljeni") is hers. |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič (patient, Žalec) | New Furosemid **not picked up** at the pharmacy → open alert "Furosemid ni prevzet 4 dni po odpustu" (T-31). Has an approved plan (T-80), so his check-in runs from the modular questionnaire. |
| 99000652 | `zdoma-eupRh0qTB1SQ` | **Vesna Zupančič** (zadolženec) | Stanko's daughter, approved. "Skrbim za" shows "Zdravila niso prevzeta v lekarni" on his card and the red warning with Furosemid on his page (T-48, T-62). |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos (patient, Celje) | Two rehabilitacije: kolk/koleno (zaključena) + po infarktu (aktivna). |

## Študent pomočnik (T-86)

| E-pošta (login) | Davčna | Geslo | Name | What to show |
|---|---|---|---|---|
| luka.kranjc@zdoma.demo | 99000679 | `zdoma-eupRh0qTB1SQ` | **Luka Kranjc** (študent medicine, praksa 60 dni od seeda) | Logs in at `/prijava` → "Osebje" with the e-pošta and lands on `/student`. Marija Kos approved him: open her card, mark pills or the check-in ("Označil: Luka (študent)"). Stanko Zupančič still has to approve him: log in as Stanko → "Svojci" → Dovoli / Zavrni. As Mojca Kovač, the detail page of Marija Kos shows the "Študent pomočnik" card. |

## Bolničarji

| E-pošta (login) | Davčna | Geslo | Name | Role |
|---|---|---|---|---|
| mojca.kovac@zdoma.demo | 99000016 | `zdoma-eupRh0qTB1SQ` | Mojca Kovač | Patronažna sestra, teren: Šentjur, Celje, Laško, Žalec, Vojnik, Slovenske Konjice |
| tina.bizjak@zdoma.demo | 99000059 | `zdoma-eupRh0qTB1SQ` | Tina Bizjak | Bolnišnica (odpira rehabilitacije) |

## Zadolženci (family)

| Davčna | Geslo | Name | Follows | Relation | Access |
|---|---|---|---|---|---|
| 99000580 | `zdoma-eupRh0qTB1SQ` | Ana Novak | Janez Novak (99000075) | hčerka | odobren |
| 99000652 | `zdoma-eupRh0qTB1SQ` | Vesna Zupančič | Stanko Zupančič (99000091) | hčerka | odobren |

## Patients

Status = the latest check-in on the day the seed ran. "Nedodeljeni" = no patronažna sestra covers Šmarje pri Jelšah.

| Davčna | Geslo | Name | Občina | Template | Status | Patronažna sestra |
|---|---|---|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | Janez Novak | Šentjur | Srčno popuščanje | Rdeče | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Nov kolk ali koleno (zaključena) | Zeleno | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Po infarktu ali operaciji srca | Zeleno | Mojca Kovač |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič | Žalec | Srčno popuščanje (načrt T-80) | Zeleno | Mojca Kovač |
| 99000024 | `zdoma-eupRh0qTB1SQ` | Franc Horvat | Šentjur | Srčno popuščanje | Rdeče | Mojca Kovač |
| 99000032 | `zdoma-eupRh0qTB1SQ` | Olga Vidmar | Slovenske Konjice | KOPB | Rumeno | Mojca Kovač |
| 99000067 | `zdoma-eupRh0qTB1SQ` | Ivana Krajnc | Šmarje pri Jelšah | Po infarktu ali operaciji srca | Rumeno | Nedodeljeni |
| 99000105 | `zdoma-eupRh0qTB1SQ` | Rudi Kolar | Vojnik | Nov kolk ali koleno | Zeleno | Mojca Kovač |
| 99000113 | `zdoma-eupRh0qTB1SQ` | Milena Rozman | Laško | Možganska kap | Zeleno | Mojca Kovač |
