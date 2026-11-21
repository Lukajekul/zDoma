# Demo accounts

Seed data from `npm run seed` (T-10) on the shared zDoma project. **All people and davčne številke are made up** (reserved range `99xxxxxx`); none belong to a real person.

## How to log in

- **Bolničarji and zadolženci:** `/prijava` with the davčna številka below and the demo password **`zdoma-eupRh0qTB1SQ`** (same for every seeded staff and family account; it is `SEED_PASSWORD` in `.env.local`).
- This repo is public, so anyone can use this password on the live site. Data is synthetic. To change it: set a new `SEED_PASSWORD` in `.env.local`, run `npm run seed`, and update this line.
- **Patients (odpuščenci):** no password, only the QR on the prijavni listek. Log in as a bolničar, open `/prijava/listek/<patientId>` (or the patient detail once T-09 has "Pokaži QR za prijavo") and scan the QR with a phone.
- Re-running `npm run seed` recreates everything with the same names and numbers. If the seed itself changes (e.g. more patients), numbers can shift: update this file from the list the seed prints at the end.

## Demo story

| Davčna | Who | What to show |
|---|---|---|
| 99000075 | **Janez Novak** (patient, Šentjur) | Srčno popuščanje, day 7. Dry weight 72 kg → 74,5 kg today, swollen ankles, diuretic missed yesterday → **Rdeče** with 4 reasons ("Teža +2,5 kg v 3 dneh" …). |
| 99000580 | **Ana Novak** (zadolženec) | Janez's daughter, approved. Marks his evening pills ("Označila: Ana (hčerka)"). |
| 99000016 | **Mojca Kovač** (bolničar) | Patronažna sestra for Šentjur and Celje: Janez is her patient. Also covers Petra's patients (nadomeščanje). |
| 99000091 | Stanko Zupančič (patient, Žalec) | New Furosemid **not picked up** at the pharmacy → open alert "Furosemid ni prevzet 4 dni po odpustu" (T-31). |
| 99000083 | Marija Kos (patient, Celje) | Two rehabilitacije: kolk/koleno (zaključena) + po infarktu (aktivna). |

## Bolničarji

| Davčna | Name | Role |
|---|---|---|
| 99000016 | Mojca Kovač | Patronažna sestra, teren: Šentjur, Celje |
| 99000024 | Petra Golob | Patronažna sestra, teren: Laško, Žalec · **na nadomeščanju**, njene paciente ima Mojca Kovač (4 dni od seeda) |
| 99000032 | Nina Kralj | Patronažna sestra, teren: Vojnik, Slovenske Konjice |
| 99000059 | Tina Bizjak | Bolnišnica (odpira rehabilitacije) |
| 99000067 | Marko Horvat | Bolnišnica (odpira rehabilitacije) |

## Zadolženci (family)

| Davčna | Name | Follows | Relation | Access |
|---|---|---|---|---|
| 99000580 | Ana Novak | Janez Novak (99000075) | hčerka | odobren |
| 99000598 | Jožica Kovačič | Terezija Kovačič (99000105) | žena | odobren |
| 99000601 | Vera Kolar | Olga Kolar (99000113) | snaha | odobren |
| 99000610 | Ivana Kolar | Marko Kolar (99000121) | vnukinja | odobren |
| 99000628 | Frančiška Golob | Terezija Golob (99000130) | hčerka | odobren |
| 99000636 | Kristina Kralj | Ivana Kralj (99000148) | snaha | odobren |
| 99000644 | Peter Kralj | Olga Kralj (99000164) | sin | čaka na odobritev |

## Patients

Status = the latest check-in on the day the seed ran. "Nedodeljeni" = no patronažna sestra covers Šmarje pri Jelšah.

| Davčna | Name | Občina | Template | Since | Status | Patronažna sestra |
|---|---|---|---|---|---|---|
| 99000075 | Janez Novak | Šentjur | Srčno popuščanje | 15. 11. 2026 | Rdeče | Mojca Kovač |
| 99000083 | Marija Kos | Celje | Nov kolk ali koleno (zaključena) | 24. 6. 2026 | Zeleno | Mojca Kovač |
| 99000083 | Marija Kos | Celje | Po infarktu ali operaciji srca | 12. 11. 2026 | Zeleno | Mojca Kovač |
| 99000091 | Stanko Zupančič | Žalec | Srčno popuščanje | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000105 | Terezija Kovačič | Slovenske Konjice | Srčno popuščanje | 19. 11. 2026 | Zeleno | Nina Kralj |
| 99000113 | Olga Kolar | Laško | Srčno popuščanje | 5. 11. 2026 | Zeleno | Petra Golob |
| 99000121 | Marko Kolar | Šentjur | Srčno popuščanje | 14. 11. 2026 | Zeleno | Mojca Kovač |
| 99000130 | Terezija Golob | Slovenske Konjice | Srčno popuščanje | 14. 11. 2026 | Rumeno | Nina Kralj |
| 99000148 | Ivana Kralj | Slovenske Konjice | Srčno popuščanje | 17. 11. 2026 | Zeleno | Nina Kralj |
| 99000156 | Anton Jelen | Šmarje pri Jelšah | Srčno popuščanje | 20. 11. 2026 | Zeleno | Nedodeljeni |
| 99000164 | Olga Kralj | Žalec | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000172 | Rudi Kralj | Celje | Srčno popuščanje | 5. 11. 2026 | Rdeče | Mojca Kovač |
| 99000199 | Ivan Vidmar | Žalec | Srčno popuščanje | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000202 | Jože Zupan | Laško | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000229 | Peter Golob | Žalec | Srčno popuščanje | 9. 11. 2026 | Rumeno | Petra Golob |
| 99000237 | Olga Žagar | Žalec | Srčno popuščanje | 3. 11. 2026 | Zeleno | Petra Golob |
| 99000245 | Milena Rozman | Slovenske Konjice | Srčno popuščanje | 15. 11. 2026 | Zeleno | Nina Kralj |
| 99000253 | Jože Krajnc | Šentjur | Srčno popuščanje | 9. 11. 2026 | Zeleno | Mojca Kovač |
| 99000261 | Terezija Rozman | Laško | Srčno popuščanje | 17. 11. 2026 | Rdeče | Petra Golob |
| 99000270 | Ivan Petek | Celje | Srčno popuščanje | 28. 10. 2026 | Zeleno | Mojca Kovač |
| 99000288 | Stanko Potočnik | Slovenske Konjice | Srčno popuščanje | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000296 | Marko Potočnik | Šentjur | Srčno popuščanje | 16. 11. 2026 | Zeleno | Mojca Kovač |
| 99000300 | Anton Golob | Šmarje pri Jelšah | Po infarktu ali operaciji srca | 30. 10. 2026 | Zeleno | Nedodeljeni |
| 99000318 | Ivan Rozman | Žalec | Po infarktu ali operaciji srca | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000326 | Marija Kovačič | Laško | Po infarktu ali operaciji srca | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000334 | Zdravko Bizjak | Slovenske Konjice | Po infarktu ali operaciji srca | 7. 11. 2026 | Zeleno | Nina Kralj |
| 99000342 | Rudi Žagar | Laško | Po infarktu ali operaciji srca | 14. 11. 2026 | Rumeno | Petra Golob |
| 99000369 | Peter Zupančič | Vojnik | Po infarktu ali operaciji srca | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000377 | Terezija Horvat | Slovenske Konjice | Nov kolk ali koleno | 10. 11. 2026 | Zeleno | Nina Kralj |
| 99000385 | Ivan Jelen | Slovenske Konjice | Nov kolk ali koleno | 12. 11. 2026 | Rumeno | Nina Kralj |
| 99000393 | Marija Golob | Laško | Nov kolk ali koleno | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000407 | Ana Zupan | Vojnik | Nov kolk ali koleno | 14. 11. 2026 | Zeleno | Nina Kralj |
| 99000415 | Ivana Horvat | Vojnik | Nov kolk ali koleno | 9. 11. 2026 | Rdeče | Nina Kralj |
| 99000423 | Alojz Hribar | Slovenske Konjice | Nov kolk ali koleno | 29. 10. 2026 | Zeleno | Nina Kralj |
| 99000431 | Frančiška Potočnik | Žalec | KOPB | 20. 11. 2026 | Rumeno | Petra Golob |
| 99000440 | Olga Krajnc | Šmarje pri Jelšah | KOPB | 28. 10. 2026 | Zeleno | Nedodeljeni |
| 99000458 | Silva Turk | Žalec | KOPB | 29. 10. 2026 | Rumeno | Petra Golob |
| 99000466 | Ivana Kos | Vojnik | KOPB | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000474 | Ivana Vidmar | Šentjur | KOPB | 1. 11. 2026 | Zeleno | Mojca Kovač |
| 99000482 | Frančiška Petek | Laško | Možganska kap | 31. 10. 2026 | Zeleno | Petra Golob |
| 99000504 | Franc Potočnik | Šentjur | Možganska kap | 2. 11. 2026 | Rdeče | Mojca Kovač |
| 99000512 | Stanko Petek | Šentjur | Možganska kap | 18. 11. 2026 | Zeleno | Mojca Kovač |
| 99000539 | Rudi Rozman | Laško | Možganska kap | 14. 11. 2026 | Zeleno | Petra Golob |
| 99000547 | Jožica Kos | Slovenske Konjice | Rak na sistemskem zdravljenju | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000555 | Ana Petek | Žalec | Rak na sistemskem zdravljenju | 13. 11. 2026 | Rdeče | Petra Golob |
| 99000563 | Olga Zupan | Celje | Rak na sistemskem zdravljenju | 19. 11. 2026 | Zeleno | Mojca Kovač |
| 99000571 | Terezija Ožbolt | Šentjur | Rak na sistemskem zdravljenju | 6. 11. 2026 | Zeleno | Mojca Kovač |
