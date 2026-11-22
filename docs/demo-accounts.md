# Demo accounts

Seed data from `npm run seed` (T-10) on the shared zDoma project. **All people and davčne številke are made up** (reserved range `99xxxxxx`); none belong to a real person.

## How to log in

- **Every seeded account** (bolničarji, zadolženci and patients) uses the davčna številka below and the demo password **`zdoma-eupRh0qTB1SQ`** (it is `SEED_PASSWORD` in `.env.local`).
- **Bolničarji and zadolženci** log in at `/prijava`. **Patients (odpuščenci)** log in at `/prijava/pacient` ("Sem pacient" on the home page).
- This repo is public, so anyone can use this password on the live site. Data is synthetic. To change it: set a new `SEED_PASSWORD` in `.env.local`, run `npm run seed`, and update this line.
- **To show the QR login:** as a bolničar open a patient and press "Nova koda QR". The printed QR logs the patient in once, then asks them to set their own password (T-54); after that the demo password above no longer works for that patient until the seed is re-run.
- Re-running `npm run seed` keeps the davčne številke of the demo story, staff and zadolženci, but the other patients' names, občine and dates can change between runs: update the tables below after every re-run (last: 22. 11. 2026).

## Demo story

| Davčna | Geslo | Who | What to show |
|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | **Janez Novak** (patient, Šentjur) | Srčno popuščanje, day 7. Dry weight 72 kg → 74,5 kg today, swollen ankles, diuretic missed yesterday → **Rdeče** with 4 reasons ("Teža +2,5 kg v 3 dneh" …). |
| 99000580 | `zdoma-eupRh0qTB1SQ` | **Ana Novak** (zadolženec) | Janez's daughter, approved. Marks his evening pills ("Označila: Ana (hčerka)"). |
| 99000016 | `zdoma-eupRh0qTB1SQ` | **Mojca Kovač** (bolničar) | Patronažna sestra for Šentjur and Celje: Janez is her patient. Also covers Petra's patients (nadomeščanje). |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič (patient, Žalec) | New Furosemid **not picked up** at the pharmacy → open alert "Furosemid ni prevzet 4 dni po odpustu" (T-31). |
| 99000652 | `zdoma-eupRh0qTB1SQ` | **Vesna Zupančič** (zadolženec) | Stanko's daughter, approved. "Skrbim za" shows "Zdravila niso prevzeta v lekarni" on his card and the red warning with Furosemid on his page (T-48, T-62). |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos (patient, Celje) | Two rehabilitacije: kolk/koleno (zaključena) + po infarktu (aktivna). |

## Bolničarji

| Davčna | Geslo | Name | Role |
|---|---|---|---|
| 99000016 | `zdoma-eupRh0qTB1SQ` | Mojca Kovač | Patronažna sestra, teren: Šentjur, Celje |
| 99000024 | `zdoma-eupRh0qTB1SQ` | Petra Golob | Patronažna sestra, teren: Laško, Žalec · **na nadomeščanju**, njene paciente ima Mojca Kovač (4 dni od seeda) |
| 99000032 | `zdoma-eupRh0qTB1SQ` | Nina Kralj | Patronažna sestra, teren: Vojnik, Slovenske Konjice |
| 99000059 | `zdoma-eupRh0qTB1SQ` | Tina Bizjak | Bolnišnica (odpira rehabilitacije) |
| 99000067 | `zdoma-eupRh0qTB1SQ` | Marko Horvat | Bolnišnica (odpira rehabilitacije) |

## Zadolženci (family)

| Davčna | Geslo | Name | Follows | Relation | Access |
|---|---|---|---|---|---|
| 99000580 | `zdoma-eupRh0qTB1SQ` | Ana Novak | Janez Novak (99000075) | hčerka | odobren |
| 99000598 | `zdoma-eupRh0qTB1SQ` | Kristina Zupančič | Zdravko Zupančič (99000105) | snaha | odobren |
| 99000601 | `zdoma-eupRh0qTB1SQ` | Marija Žagar | Peter Žagar (99000113) | snaha | odobren |
| 99000610 | `zdoma-eupRh0qTB1SQ` | Ivana Potočnik | Jože Potočnik (99000121) | vnukinja | odobren |
| 99000628 | `zdoma-eupRh0qTB1SQ` | Frančiška Kovačič | Frančiška Kovačič (99000130) | snaha | odobren |
| 99000636 | `zdoma-eupRh0qTB1SQ` | Marija Zupan | Ivana Zupan (99000148) | snaha | odobren |
| 99000644 | `zdoma-eupRh0qTB1SQ` | Stanko Mlakar | Jožica Mlakar (99000164) | sin | čaka na odobritev |
| 99000652 | `zdoma-eupRh0qTB1SQ` | Vesna Zupančič | Stanko Zupančič (99000091) | hčerka | odobren |

## Patients

Status = the latest check-in on the day the seed ran. "Nedodeljeni" = no patronažna sestra covers Šmarje pri Jelšah.

| Davčna | Geslo | Name | Občina | Template | Since | Status | Patronažna sestra |
|---|---|---|---|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | Janez Novak | Šentjur | Srčno popuščanje | 16. 11. 2026 | Rdeče | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Nov kolk ali koleno (zaključena) | 25. 6. 2026 | Zeleno | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Po infarktu ali operaciji srca | 13. 11. 2026 | Zeleno | Mojca Kovač |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič | Žalec | Srčno popuščanje | 18. 11. 2026 | Zeleno | Petra Golob |
| 99000105 | `zdoma-eupRh0qTB1SQ` | Zdravko Zupančič | Šentjur | Srčno popuščanje | 4. 11. 2026 | Rdeče | Mojca Kovač |
| 99000113 | `zdoma-eupRh0qTB1SQ` | Peter Žagar | Žalec | Srčno popuščanje | 7. 11. 2026 | Zeleno | Petra Golob |
| 99000121 | `zdoma-eupRh0qTB1SQ` | Jože Potočnik | Celje | Srčno popuščanje | 4. 11. 2026 | Zeleno | Mojca Kovač |
| 99000130 | `zdoma-eupRh0qTB1SQ` | Frančiška Kovačič | Laško | Srčno popuščanje | 31. 10. 2026 | Zeleno | Petra Golob |
| 99000148 | `zdoma-eupRh0qTB1SQ` | Ivana Zupan | Žalec | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000156 | `zdoma-eupRh0qTB1SQ` | Stanko Ožbolt | Šmarje pri Jelšah | Srčno popuščanje | 11. 11. 2026 | Rumeno | Nedodeljeni |
| 99000164 | `zdoma-eupRh0qTB1SQ` | Jožica Mlakar | Žalec | Srčno popuščanje | 1. 11. 2026 | Zeleno | Petra Golob |
| 99000172 | `zdoma-eupRh0qTB1SQ` | Zdravko Vidmar | Laško | Srčno popuščanje | 13. 11. 2026 | Zeleno | Petra Golob |
| 99000199 | `zdoma-eupRh0qTB1SQ` | Milena Rozman | Slovenske Konjice | Srčno popuščanje | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000202 | `zdoma-eupRh0qTB1SQ` | Ana Kolar | Vojnik | Srčno popuščanje | 17. 11. 2026 | Zeleno | Nina Kralj |
| 99000229 | `zdoma-eupRh0qTB1SQ` | Silva Turk | Vojnik | Srčno popuščanje | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000237 | `zdoma-eupRh0qTB1SQ` | Marija Ožbolt | Slovenske Konjice | Srčno popuščanje | 12. 11. 2026 | Zeleno | Nina Kralj |
| 99000245 | `zdoma-eupRh0qTB1SQ` | Olga Vidmar | Slovenske Konjice | Srčno popuščanje | 17. 11. 2026 | Rumeno | Nina Kralj |
| 99000253 | `zdoma-eupRh0qTB1SQ` | Milan Mlakar | Laško | Srčno popuščanje | 18. 11. 2026 | Rumeno | Petra Golob |
| 99000261 | `zdoma-eupRh0qTB1SQ` | Ivana Petek | Celje | Srčno popuščanje | 12. 11. 2026 | Zeleno | Mojca Kovač |
| 99000270 | `zdoma-eupRh0qTB1SQ` | Ivana Kralj | Žalec | Srčno popuščanje | 29. 10. 2026 | Rumeno | Petra Golob |
| 99000288 | `zdoma-eupRh0qTB1SQ` | Jožica Rozman | Žalec | Srčno popuščanje | 4. 11. 2026 | Zeleno | Petra Golob |
| 99000296 | `zdoma-eupRh0qTB1SQ` | Ivan Ožbolt | Šentjur | Srčno popuščanje | 13. 11. 2026 | Zeleno | Mojca Kovač |
| 99000300 | `zdoma-eupRh0qTB1SQ` | Ivana Potočnik | Šmarje pri Jelšah | Po infarktu ali operaciji srca | 4. 11. 2026 | Rumeno | Nedodeljeni |
| 99000318 | `zdoma-eupRh0qTB1SQ` | Marko Turk | Laško | Po infarktu ali operaciji srca | 1. 11. 2026 | Zeleno | Petra Golob |
| 99000326 | `zdoma-eupRh0qTB1SQ` | Kristina Jelen | Slovenske Konjice | Po infarktu ali operaciji srca | 5. 11. 2026 | Zeleno | Nina Kralj |
| 99000334 | `zdoma-eupRh0qTB1SQ` | Rudi Kralj | Laško | Po infarktu ali operaciji srca | 11. 11. 2026 | Zeleno | Petra Golob |
| 99000342 | `zdoma-eupRh0qTB1SQ` | Ivana Krajnc | Celje | Po infarktu ali operaciji srca | 30. 10. 2026 | Rumeno | Mojca Kovač |
| 99000369 | `zdoma-eupRh0qTB1SQ` | Alojz Zupan | Vojnik | Po infarktu ali operaciji srca | 14. 11. 2026 | Zeleno | Nina Kralj |
| 99000377 | `zdoma-eupRh0qTB1SQ` | Milena Bizjak | Laško | Nov kolk ali koleno | 16. 11. 2026 | Zeleno | Petra Golob |
| 99000385 | `zdoma-eupRh0qTB1SQ` | Rudi Horvat | Vojnik | Nov kolk ali koleno | 20. 11. 2026 | Zeleno | Nina Kralj |
| 99000393 | `zdoma-eupRh0qTB1SQ` | Ivan Kovačič | Vojnik | Nov kolk ali koleno | 16. 11. 2026 | Rdeče | Nina Kralj |
| 99000407 | `zdoma-eupRh0qTB1SQ` | Anton Hribar | Slovenske Konjice | Nov kolk ali koleno | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000415 | `zdoma-eupRh0qTB1SQ` | Zdenka Kolar | Šentjur | Nov kolk ali koleno | 31. 10. 2026 | Zeleno | Mojca Kovač |
| 99000423 | `zdoma-eupRh0qTB1SQ` | Rudi Rozman | Celje | Nov kolk ali koleno | 10. 11. 2026 | Zeleno | Mojca Kovač |
| 99000431 | `zdoma-eupRh0qTB1SQ` | Anton Žagar | Žalec | KOPB | 15. 11. 2026 | Zeleno | Petra Golob |
| 99000440 | `zdoma-eupRh0qTB1SQ` | Olga Turk | Šmarje pri Jelšah | KOPB | 15. 11. 2026 | Zeleno | Nedodeljeni |
| 99000458 | `zdoma-eupRh0qTB1SQ` | Frančiška Mlakar | Vojnik | KOPB | 11. 11. 2026 | Zeleno | Nina Kralj |
| 99000466 | `zdoma-eupRh0qTB1SQ` | Frančiška Bizjak | Vojnik | KOPB | 8. 11. 2026 | Zeleno | Nina Kralj |
| 99000474 | `zdoma-eupRh0qTB1SQ` | Terezija Horvat | Žalec | KOPB | 21. 11. 2026 | Zeleno | Petra Golob |
| 99000482 | `zdoma-eupRh0qTB1SQ` | Alojz Ožbolt | Celje | Možganska kap | 17. 11. 2026 | Zeleno | Mojca Kovač |
| 99000504 | `zdoma-eupRh0qTB1SQ` | Olga Kos | Šentjur | Možganska kap | 21. 11. 2026 | Rdeče | Mojca Kovač |
| 99000512 | `zdoma-eupRh0qTB1SQ` | Zdravko Bizjak | Slovenske Konjice | Možganska kap | 16. 11. 2026 | Rumeno | Nina Kralj |
| 99000539 | `zdoma-eupRh0qTB1SQ` | Rudi Jelen | Celje | Možganska kap | 30. 10. 2026 | Zeleno | Mojca Kovač |
| 99000547 | `zdoma-eupRh0qTB1SQ` | Ivan Zupan | Vojnik | Rak na sistemskem zdravljenju | 20. 11. 2026 | Rumeno | Nina Kralj |
| 99000555 | `zdoma-eupRh0qTB1SQ` | Marija Bizjak | Laško | Rak na sistemskem zdravljenju | 15. 11. 2026 | Rumeno | Petra Golob |
| 99000563 | `zdoma-eupRh0qTB1SQ` | Franc Kovačič | Vojnik | Rak na sistemskem zdravljenju | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000571 | `zdoma-eupRh0qTB1SQ` | Zdravko Kos | Laško | Rak na sistemskem zdravljenju | 19. 11. 2026 | Zeleno | Petra Golob |
