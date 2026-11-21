# Demo accounts

Seed data from `npm run seed` (T-10) on the shared zDoma project. **All people and davčne številke are made up** (reserved range `99xxxxxx`); none belong to a real person.

## How to log in

- **Bolničarji and zadolženci:** `/prijava` with the davčna številka below and the demo password **`zdoma-eupRh0qTB1SQ`** (same for every seeded staff and family account; it is `SEED_PASSWORD` in `.env.local`).
- This repo is public, so anyone can use this password on the live site. Data is synthetic. To change it: set a new `SEED_PASSWORD` in `.env.local`, run `npm run seed`, and update this line.
- **Patients (odpuščenci):** no password, they log in with the QR on their prijavni listek. Each patient below has their **QR** (scan it with a phone camera) and the same login as a **prijava** link (open it on the phone). Staff can also show it at `/prijava/listek/<patientId>`.
- QR codes and links stop working when the seed is re-run or someone presses "Nova koda QR": then regenerate this file and `docs/demo-qr/`.
- Re-running `npm run seed` recreates everything with the same names and numbers. If the seed itself changes (e.g. more patients), numbers can shift: update this file from the list the seed prints at the end.

## Demo story

| Davčna | Geslo | Who | What to show |
|---|---|---|---|
| 99000075 | [QR](demo-qr/99000075.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000075.Txo44UJNsyNxJvQH7x8aSwQpRNdKYXVEGy2rPlc5L34) | **Janez Novak** (patient, Šentjur) | Srčno popuščanje, day 7. Dry weight 72 kg → 74,5 kg today, swollen ankles, diuretic missed yesterday → **Rdeče** with 4 reasons ("Teža +2,5 kg v 3 dneh" …). |
| 99000580 | `zdoma-eupRh0qTB1SQ` | **Ana Novak** (zadolženec) | Janez's daughter, approved. Marks his evening pills ("Označila: Ana (hčerka)"). |
| 99000016 | `zdoma-eupRh0qTB1SQ` | **Mojca Kovač** (bolničar) | Patronažna sestra for Šentjur and Celje: Janez is her patient. Also covers Petra's patients (nadomeščanje). |
| 99000091 | [QR](demo-qr/99000091.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000091.UBbg4BNr2SrO5RBbN61D-wbX5p_GYzn8vIXc1ZL2SnE) | Stanko Zupančič (patient, Žalec) | New Furosemid **not picked up** at the pharmacy → open alert "Furosemid ni prevzet 4 dni po odpustu" (T-31). |
| 99000083 | [QR](demo-qr/99000083.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000083.ovbWRMJo2x7Hyy0sHtUeYi2632eHLbUAqMqR3g0MoOI) | Marija Kos (patient, Celje) | Two rehabilitacije: kolk/koleno (zaključena) + po infarktu (aktivna). |

Janez Novak, the demo patient (scan to log in as him):

![QR za prijavo: Janez Novak](demo-qr/99000075.svg)

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
| 99000075 | [QR](demo-qr/99000075.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000075.Txo44UJNsyNxJvQH7x8aSwQpRNdKYXVEGy2rPlc5L34) | Janez Novak | Šentjur | Srčno popuščanje | 15. 11. 2026 | Rdeče | Mojca Kovač |
| 99000083 | [QR](demo-qr/99000083.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000083.ovbWRMJo2x7Hyy0sHtUeYi2632eHLbUAqMqR3g0MoOI) | Marija Kos | Celje | Nov kolk ali koleno (zaključena) | 24. 6. 2026 | Zeleno | Mojca Kovač |
| 99000083 | [QR](demo-qr/99000083.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000083.ovbWRMJo2x7Hyy0sHtUeYi2632eHLbUAqMqR3g0MoOI) | Marija Kos | Celje | Po infarktu ali operaciji srca | 12. 11. 2026 | Zeleno | Mojca Kovač |
| 99000091 | [QR](demo-qr/99000091.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000091.UBbg4BNr2SrO5RBbN61D-wbX5p_GYzn8vIXc1ZL2SnE) | Stanko Zupančič | Žalec | Srčno popuščanje | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000105 | [QR](demo-qr/99000105.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000105.bdfeE73eSKK0rsvuKOgCpHvfqVbssVW3yKdQjD3UYaI) | Terezija Kovačič | Slovenske Konjice | Srčno popuščanje | 19. 11. 2026 | Zeleno | Nina Kralj |
| 99000113 | [QR](demo-qr/99000113.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000113.S368ohWBCdh8tLXeG1uS0Dfxjlc1bWqvGCA2_-wgdSA) | Olga Kolar | Laško | Srčno popuščanje | 5. 11. 2026 | Zeleno | Petra Golob |
| 99000121 | [QR](demo-qr/99000121.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000121.cLoMxE-oHjjHRr6XR1ZhpbcbnEVQlYqbTvagWqp4bKw) | Marko Kolar | Šentjur | Srčno popuščanje | 14. 11. 2026 | Zeleno | Mojca Kovač |
| 99000130 | [QR](demo-qr/99000130.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000130.pSgn5Zko9uqVHeQu0HcqJ1RF8Fa1EMR2x46ftkMBYzE) | Terezija Golob | Slovenske Konjice | Srčno popuščanje | 14. 11. 2026 | Rumeno | Nina Kralj |
| 99000148 | [QR](demo-qr/99000148.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000148.HMP0zEVWbNKGjToiRCqxLMXTYb3G4cNZOtC9er5iZfs) | Ivana Kralj | Slovenske Konjice | Srčno popuščanje | 17. 11. 2026 | Zeleno | Nina Kralj |
| 99000156 | [QR](demo-qr/99000156.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000156.Hz0NBx6vRql5DVp9cp7es3KYgkSLQj4qhOo1QXt_aOc) | Anton Jelen | Šmarje pri Jelšah | Srčno popuščanje | 20. 11. 2026 | Zeleno | Nedodeljeni |
| 99000164 | [QR](demo-qr/99000164.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000164.i4jqse6tBguHY73Wqw-1skThlGMIf_2Zl_Olijrvgjo) | Olga Kralj | Žalec | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000172 | [QR](demo-qr/99000172.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000172.RvyZ5vyLT4mz8CbB413hfd10AX00PcL7hlhix0zRqOQ) | Rudi Kralj | Celje | Srčno popuščanje | 5. 11. 2026 | Rdeče | Mojca Kovač |
| 99000199 | [QR](demo-qr/99000199.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000199.DnW3frh_0VguJJPKbgltpR_6mD8zcxgAzRf_noSc3kw) | Ivan Vidmar | Žalec | Srčno popuščanje | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000202 | [QR](demo-qr/99000202.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000202.ve_UPp2tiE_7jft-S2dSyF6D56Tu9cCztEcgKV7ydl0) | Jože Zupan | Laško | Srčno popuščanje | 9. 11. 2026 | Zeleno | Petra Golob |
| 99000229 | [QR](demo-qr/99000229.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000229.yl5bxYmlxS5qn8dH9FPrJOc1yKDByu-h7TxA3xUQmFo) | Peter Golob | Žalec | Srčno popuščanje | 9. 11. 2026 | Rumeno | Petra Golob |
| 99000237 | [QR](demo-qr/99000237.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000237.Xs9hfHlfRAd9-LptfPYmQjrTyq0iWMvysrDKPiQeONM) | Olga Žagar | Žalec | Srčno popuščanje | 3. 11. 2026 | Zeleno | Petra Golob |
| 99000245 | [QR](demo-qr/99000245.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000245._h1_6Lan4rCgDvZJghoudQRKVPDR0Aa8Y5DNohhbKQ0) | Milena Rozman | Slovenske Konjice | Srčno popuščanje | 15. 11. 2026 | Zeleno | Nina Kralj |
| 99000253 | [QR](demo-qr/99000253.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000253.fZ49yDt-c67yH8kGX4K3EOGOs3OYwZ-U_CDGLW7rCkY) | Jože Krajnc | Šentjur | Srčno popuščanje | 9. 11. 2026 | Zeleno | Mojca Kovač |
| 99000261 | [QR](demo-qr/99000261.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000261.wE4EtsHTE_FYnaOR0VgIb8y1HJiHZOI8E81Z8yxobAU) | Terezija Rozman | Laško | Srčno popuščanje | 17. 11. 2026 | Rdeče | Petra Golob |
| 99000270 | [QR](demo-qr/99000270.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000270.3mUWoRiQcm4PFAeIcCe1GNSwr0dxWhzcCfBEB4tzbMI) | Ivan Petek | Celje | Srčno popuščanje | 28. 10. 2026 | Zeleno | Mojca Kovač |
| 99000288 | [QR](demo-qr/99000288.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000288.2wgyyIEYQyrFkMR1_tjCMThis-z-K8aKtQNV95WU7Ys) | Stanko Potočnik | Slovenske Konjice | Srčno popuščanje | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000296 | [QR](demo-qr/99000296.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000296.3xeVguO9509qlltBOdCvm4OdwYYz5hLBl5RCTM69yNQ) | Marko Potočnik | Šentjur | Srčno popuščanje | 16. 11. 2026 | Zeleno | Mojca Kovač |
| 99000300 | [QR](demo-qr/99000300.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000300.czuDmNRouVyXRUHCVBh6Eh00wy_-oiYE_5P3aWj2OGU) | Anton Golob | Šmarje pri Jelšah | Po infarktu ali operaciji srca | 30. 10. 2026 | Zeleno | Nedodeljeni |
| 99000318 | [QR](demo-qr/99000318.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000318.Q_ZmRqQG9J6WNy_HU75eQrdZIoGN0ZxQsluzu9bjdj8) | Ivan Rozman | Žalec | Po infarktu ali operaciji srca | 19. 11. 2026 | Zeleno | Petra Golob |
| 99000326 | [QR](demo-qr/99000326.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000326.1FKH_jKEADvCL7Cw74VjNtxFTzW8yJ0oaNV1rrvzmCM) | Marija Kovačič | Laško | Po infarktu ali operaciji srca | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000334 | [QR](demo-qr/99000334.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000334.L_5qCQLifMP0axiiwjGHkApFpG0ATfXbsG9Pf1nd0dA) | Zdravko Bizjak | Slovenske Konjice | Po infarktu ali operaciji srca | 7. 11. 2026 | Zeleno | Nina Kralj |
| 99000342 | [QR](demo-qr/99000342.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000342.hm7iNEOkLi37iXEPbwSIxaz7C9-1mmAgJZu4CiCGeu8) | Rudi Žagar | Laško | Po infarktu ali operaciji srca | 14. 11. 2026 | Rumeno | Petra Golob |
| 99000369 | [QR](demo-qr/99000369.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000369.PLMPNm5GwIyNylihgtW6YWCjOGPXUu2-GDisb4Tkajs) | Peter Zupančič | Vojnik | Po infarktu ali operaciji srca | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000377 | [QR](demo-qr/99000377.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000377.rxz3Tehsfrx_CW1rl4BM5EgHEKysxYh_5PXqateAztY) | Terezija Horvat | Slovenske Konjice | Nov kolk ali koleno | 10. 11. 2026 | Zeleno | Nina Kralj |
| 99000385 | [QR](demo-qr/99000385.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000385.e84CBLfnFI0BYri5_ek5LFqrqrJPWw8nC4HUJFRVIBE) | Ivan Jelen | Slovenske Konjice | Nov kolk ali koleno | 12. 11. 2026 | Rumeno | Nina Kralj |
| 99000393 | [QR](demo-qr/99000393.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000393.3VTbTsQITICw34l-8KBMdusCKFJcDFeNlc73kCJMbkg) | Marija Golob | Laško | Nov kolk ali koleno | 17. 11. 2026 | Zeleno | Petra Golob |
| 99000407 | [QR](demo-qr/99000407.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000407.m715sHFbODSi76tyg510yBfR99jzvauczs9OIyzQE4w) | Ana Zupan | Vojnik | Nov kolk ali koleno | 14. 11. 2026 | Zeleno | Nina Kralj |
| 99000415 | [QR](demo-qr/99000415.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000415.IAiRUruhXhxHxrOPv8IjsrBfVQtmmG2pi3BPZTDcC3E) | Ivana Horvat | Vojnik | Nov kolk ali koleno | 9. 11. 2026 | Rdeče | Nina Kralj |
| 99000423 | [QR](demo-qr/99000423.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000423.dYX__8pplM2ljummUdMTE7knP0GlR4g407HvjqaUVEg) | Alojz Hribar | Slovenske Konjice | Nov kolk ali koleno | 29. 10. 2026 | Zeleno | Nina Kralj |
| 99000431 | [QR](demo-qr/99000431.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000431.ZQwHXO2Few4BSBwYgGv2c5FELCSm0cyTDO8MSVkPIIQ) | Frančiška Potočnik | Žalec | KOPB | 20. 11. 2026 | Rumeno | Petra Golob |
| 99000440 | [QR](demo-qr/99000440.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000440.04WhCVl-_D1BkAk_LH43LyIvMLrdMCiixhTCV67x-lI) | Olga Krajnc | Šmarje pri Jelšah | KOPB | 28. 10. 2026 | Zeleno | Nedodeljeni |
| 99000458 | [QR](demo-qr/99000458.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000458.3uqWMYkNEFaxsGC-ImG62tFTEF2PL5Fo40jAnCTTGX8) | Silva Turk | Žalec | KOPB | 29. 10. 2026 | Rumeno | Petra Golob |
| 99000466 | [QR](demo-qr/99000466.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000466.0tv8QtmGHeiAcyq8RpIiiMjFVs4Dz4hARRQkVOG9u-g) | Ivana Kos | Vojnik | KOPB | 30. 10. 2026 | Zeleno | Nina Kralj |
| 99000474 | [QR](demo-qr/99000474.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000474.iv7E7mjyZRE83razNMxw1TXxvuneep3XAPFz1z0Kdvs) | Ivana Vidmar | Šentjur | KOPB | 1. 11. 2026 | Zeleno | Mojca Kovač |
| 99000482 | [QR](demo-qr/99000482.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000482.fldKLDpzgzOfH71F55-t75uq1eu8dQkYKf5sxmoDbC0) | Frančiška Petek | Laško | Možganska kap | 31. 10. 2026 | Zeleno | Petra Golob |
| 99000504 | [QR](demo-qr/99000504.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000504.mEsKa8wSvlenhDOzGur6LRBVKcP0H5JpeRU6BHPeVzI) | Franc Potočnik | Šentjur | Možganska kap | 2. 11. 2026 | Rdeče | Mojca Kovač |
| 99000512 | [QR](demo-qr/99000512.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000512.l_39uwF0l71vtxxpNeUjMZ1lxCWIuZ05MHUD7VgaZMg) | Stanko Petek | Šentjur | Možganska kap | 18. 11. 2026 | Zeleno | Mojca Kovač |
| 99000539 | [QR](demo-qr/99000539.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000539.Nw-h5rhBaXTf73CSvxyJ5r2BKAdCkTmPraqe3DXiDNA) | Rudi Rozman | Laško | Možganska kap | 14. 11. 2026 | Zeleno | Petra Golob |
| 99000547 | [QR](demo-qr/99000547.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000547.slqYFN4ep56i7rpCo9O-Z5rMScTgzvmw32PJAJv779Y) | Jožica Kos | Slovenske Konjice | Rak na sistemskem zdravljenju | 16. 11. 2026 | Zeleno | Nina Kralj |
| 99000555 | [QR](demo-qr/99000555.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000555.tsTlGUA-0ys4oMWwW-udGQ7NVVgRX2eFYNCdLRY_N3k) | Ana Petek | Žalec | Rak na sistemskem zdravljenju | 13. 11. 2026 | Rdeče | Petra Golob |
| 99000563 | [QR](demo-qr/99000563.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000563.F0QPAr-Mfeir5qhXkSUTLbCSth_NTjJrBcPLMUXUApM) | Olga Zupan | Celje | Rak na sistemskem zdravljenju | 19. 11. 2026 | Zeleno | Mojca Kovač |
| 99000571 | [QR](demo-qr/99000571.svg) · [prijava](https://zdoma.tian-istenic34.workers.dev/prijava/qr#99000571.5fpuXXAqTgLv_FxvSBhf3PqTePICGOwm5pqhr5h1vlE) | Terezija Ožbolt | Šentjur | Rak na sistemskem zdravljenju | 6. 11. 2026 | Zeleno | Mojca Kovač |
