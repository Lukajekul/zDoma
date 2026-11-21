# Demo accounts

Seed data from `npm run seed` (T-10) on the shared zDoma project. **All people and davčne številke are made up** (reserved range `99xxxxxx`); none belong to a real person.

## How to log in

- **Every seeded account** (bolničarji, zadolženci and patients) uses the davčna številka below and the demo password **`zdoma-eupRh0qTB1SQ`** (it is `SEED_PASSWORD` in `.env.local`).
- **Bolničarji and zadolženci** log in at `/prijava`. **Patients (odpuščenci)** log in at `/prijava/pacient` ("Sem pacient" on the home page).
- This repo is public, so anyone can use this password on the live site. Data is synthetic. To change it: set a new `SEED_PASSWORD` in `.env.local`, run `npm run seed`, and update this line.
- **To show the QR login:** as a bolničar open a patient and press "Nova koda QR". The printed QR logs the patient in once, then asks them to set their own password (T-54); after that the demo password above no longer works for that patient until the seed is re-run.
- Re-running `npm run seed` recreates everything with the same names and numbers. If the seed itself changes (e.g. more patients), numbers can shift: update this file from the list the seed prints at the end.

## Demo story

| Davčna | Geslo | Who | What to show |
|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | **Janez Novak** (patient, Šentjur) | Srčno popuščanje, day 7. Dry weight 72 kg → 74,5 kg today, swollen ankles, diuretic missed yesterday → **Rdeče** with 4 reasons ("Teža +2,5 kg v 3 dneh" …). |
| 99000580 | `zdoma-eupRh0qTB1SQ` | **Ana Novak** (zadolženec) | Janez's daughter, approved. Marks his evening pills ("Označila: Ana (hčerka)"). |
| 99000016 | `zdoma-eupRh0qTB1SQ` | **Mojca Kovač** (bolničar) | Patronažna sestra for Šentjur and Celje: Janez is her patient. Also covers Petra's patients (nadomeščanje). |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič (patient, Žalec) | New Furosemid **not picked up** at the pharmacy → open alert "Furosemid ni prevzet 4 dni po odpustu" (T-31). |
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
| 99000598 | `zdoma-eupRh0qTB1SQ` | Jožica Kovačič | Terezija Kovačič (99000105) | žena | odobren |
| 99000601 | `zdoma-eupRh0qTB1SQ` | Vera Kolar | Olga Kolar (99000113) | snaha | odobren |
| 99000610 | `zdoma-eupRh0qTB1SQ` | Ivana Kolar | Marko Kolar (99000121) | vnukinja | odobren |
| 99000628 | `zdoma-eupRh0qTB1SQ` | Frančiška Golob | Terezija Golob (99000130) | hčerka | odobren |
| 99000636 | `zdoma-eupRh0qTB1SQ` | Kristina Kralj | Ivana Kralj (99000148) | snaha | odobren |
| 99000644 | `zdoma-eupRh0qTB1SQ` | Peter Kralj | Olga Kralj (99000164) | sin | čaka na odobritev |

## Patients

Status = the latest check-in on the day the seed ran. "Nedodeljeni" = no patronažna sestra covers Šmarje pri Jelšah.

| Davčna | Geslo | Name | Občina | Template | Since | Status | Patronažna sestra |
|---|---|---|---|---|---|---|---|
| 99000075 | `zdoma-eupRh0qTB1SQ` | Janez Novak | Šentjur | Srčno popuščanje | 15. 11. 2026 | Rdeče | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Nov kolk ali koleno (zaključena) | 24. 6. 2026 | Zeleno | Mojca Kovač |
| 99000083 | `zdoma-eupRh0qTB1SQ` | Marija Kos | Celje | Po infarktu ali operaciji srca | 12. 11. 2026 | Zeleno | Mojca Kovač |
| 99000091 | `zdoma-eupRh0qTB1SQ` | Stanko Zupančič | Žalec | Srčno popuščanje | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000105 | `zdoma-eupRh0qTB1SQ` | Terezija Kovačič | Slovenske Konjice | Srčno popuščanje | 19. 11. 2026 | Zeleno | Nina Kralj |
| 99000113 | `zdoma-eupRh0qTB1SQ` | Olga Kolar | Laško | Srčno popuščanje | 5. 11. 2026 | Zeleno | Petra Golob |
| 99000121 | `zdoma-eupRh0qTB1SQ` | Marko Kolar | Šentjur | Srčno popuščanje | 14. 11. 2026 | Zeleno | Mojca Kovač |
| 99000130 | `zdoma-eupRh0qTB1SQ` | Terezija Golob | Slovenske Konjice | Srčno popuščanje | 14. 11. 2026 | Rumeno | Nina Kralj |
| 99000148 | `zdoma-eupRh0qTB1SQ` | Ivana Kralj | Slovenske Konjice | Srčno popuščanje | 17. 11. 2026 | Zeleno | Nina Kralj |
| 99000156 | `zdoma-eupRh0qTB1SQ` | Anton Jelen | Šmarje pri Jelšah | Srčno popuščanje | 20. 11. 2026 | Zeleno | Nedodeljeni |
| 99000164 | `zdoma-eupRh0qTB1SQ` | Olga Kralj | Žalec | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000172 | `zdoma-eupRh0qTB1SQ` | Rudi Kralj | Celje | Srčno popuščanje | 5. 11. 2026 | Rdeče | Mojca Kovač |
| 99000199 | `zdoma-eupRh0qTB1SQ` | Ivan Vidmar | Žalec | Srčno popuščanje | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000202 | `zdoma-eupRh0qTB1SQ` | Jože Zupan | Laško | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000229 | `zdoma-eupRh0qTB1SQ` | Peter Golob | Žalec | Srčno popuščanje | 9. 11. 2026 | Rumeno | Petra Golob |
| 99000237 | `zdoma-eupRh0qTB1SQ` | Olga Žagar | Žalec | Srčno popuščanje | 3. 11. 2026 | Zeleno | Petra Golob |
| 99000245 | `zdoma-eupRh0qTB1SQ` | Milena Rozman | Slovenske Konjice | Srčno popuščanje | 15. 11. 2026 | Zeleno | Nina Kralj |
| 99000253 | `zdoma-eupRh0qTB1SQ` | Jože Krajnc | Šentjur | Srčno popuščanje | 9. 11. 2026 | Zeleno | Mojca Kovač |
| 99000261 | `zdoma-eupRh0qTB1SQ` | Terezija Rozman | Laško | Srčno popuščanje | 17. 11. 2026 | Rdeče | Petra Golob |
| 99000270 | `zdoma-eupRh0qTB1SQ` | Ivan Petek | Celje | Srčno popuščanje | 28. 10. 2026 | Zeleno | Mojca Kovač |
| 99000288 | `zdoma-eupRh0qTB1SQ` | Stanko Potočnik | Slovenske Konjice | Srčno popuščanje | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000296 | `zdoma-eupRh0qTB1SQ` | Marko Potočnik | Šentjur | Srčno popuščanje | 16. 11. 2026 | Zeleno | Mojca Kovač |
| 99000300 | `zdoma-eupRh0qTB1SQ` | Anton Golob | Šmarje pri Jelšah | Po infarktu ali operaciji srca | 30. 10. 2026 | Zeleno | Nedodeljeni |
| 99000318 | `zdoma-eupRh0qTB1SQ` | Ivan Rozman | Žalec | Po infarktu ali operaciji srca | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000326 | `zdoma-eupRh0qTB1SQ` | Marija Kovačič | Laško | Po infarktu ali operaciji srca | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000334 | `zdoma-eupRh0qTB1SQ` | Zdravko Bizjak | Slovenske Konjice | Po infarktu ali operaciji srca | 7. 11. 2026 | Zeleno | Nina Kralj |
| 99000342 | `zdoma-eupRh0qTB1SQ` | Rudi Žagar | Laško | Po infarktu ali operaciji srca | 14. 11. 2026 | Rumeno | Petra Golob |
| 99000369 | `zdoma-eupRh0qTB1SQ` | Peter Zupančič | Vojnik | Po infarktu ali operaciji srca | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000377 | `zdoma-eupRh0qTB1SQ` | Terezija Horvat | Slovenske Konjice | Nov kolk ali koleno | 10. 11. 2026 | Zeleno | Nina Kralj |
| 99000385 | `zdoma-eupRh0qTB1SQ` | Ivan Jelen | Slovenske Konjice | Nov kolk ali koleno | 12. 11. 2026 | Rumeno | Nina Kralj |
| 99000393 | `zdoma-eupRh0qTB1SQ` | Marija Golob | Laško | Nov kolk ali koleno | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000407 | `zdoma-eupRh0qTB1SQ` | Ana Zupan | Vojnik | Nov kolk ali koleno | 14. 11. 2026 | Zeleno | Nina Kralj |
| 99000415 | `zdoma-eupRh0qTB1SQ` | Ivana Horvat | Vojnik | Nov kolk ali koleno | 9. 11. 2026 | Rdeče | Nina Kralj |
| 99000423 | `zdoma-eupRh0qTB1SQ` | Alojz Hribar | Slovenske Konjice | Nov kolk ali koleno | 29. 10. 2026 | Zeleno | Nina Kralj |
| 99000431 | `zdoma-eupRh0qTB1SQ` | Frančiška Potočnik | Žalec | KOPB | 20. 11. 2026 | Rumeno | Petra Golob |
| 99000440 | `zdoma-eupRh0qTB1SQ` | Olga Krajnc | Šmarje pri Jelšah | KOPB | 28. 10. 2026 | Zeleno | Nedodeljeni |
| 99000458 | `zdoma-eupRh0qTB1SQ` | Silva Turk | Žalec | KOPB | 29. 10. 2026 | Rumeno | Petra Golob |
| 99000466 | `zdoma-eupRh0qTB1SQ` | Ivana Kos | Vojnik | KOPB | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000474 | `zdoma-eupRh0qTB1SQ` | Ivana Vidmar | Šentjur | KOPB | 1. 11. 2026 | Zeleno | Mojca Kovač |
| 99000482 | `zdoma-eupRh0qTB1SQ` | Frančiška Petek | Laško | Možganska kap | 31. 10. 2026 | Zeleno | Petra Golob |
| 99000504 | `zdoma-eupRh0qTB1SQ` | Franc Potočnik | Šentjur | Možganska kap | 2. 11. 2026 | Rdeče | Mojca Kovač |
| 99000512 | `zdoma-eupRh0qTB1SQ` | Stanko Petek | Šentjur | Možganska kap | 18. 11. 2026 | Zeleno | Mojca Kovač |
| 99000539 | `zdoma-eupRh0qTB1SQ` | Rudi Rozman | Laško | Možganska kap | 14. 11. 2026 | Zeleno | Petra Golob |
| 99000547 | `zdoma-eupRh0qTB1SQ` | Jožica Kos | Slovenske Konjice | Rak na sistemskem zdravljenju | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000555 | `zdoma-eupRh0qTB1SQ` | Ana Petek | Žalec | Rak na sistemskem zdravljenju | 13. 11. 2026 | Rdeče | Petra Golob |
| 99000563 | `zdoma-eupRh0qTB1SQ` | Olga Zupan | Celje | Rak na sistemskem zdravljenju | 19. 11. 2026 | Zeleno | Mojca Kovač |
| 99000571 | `zdoma-eupRh0qTB1SQ` | Terezija Ožbolt | Šentjur | Rak na sistemskem zdravljenju | 6. 11. 2026 | Zeleno | Mojca Kovač |
