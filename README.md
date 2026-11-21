# zDoma

ADAHack 2026, izziv 1 (ekipa Ixtlan): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

## Na kratko

Pacient po odpustu iz bolnišnice doma vsak dan opravi kratek pregled stanja, jemlje zdravila in dela vaje po navodilih. Sistem opazi zgodnje opozorilne znake in o njih obvesti osebje, preden zaplet pripelje do ponovnega sprejema v bolnišnico.

## Osnovni podatki o aplikaciji

### Problem

Po odpustu gre pacient domov skoraj brez zdravniškega nadzora. Zapleti, kot so okužbe, poslabšanje srčnega popuščanja ali napake pri jemanju zdravil, pogosto ostanejo neopaženi, dokler se pacient ne vrne na urgenco. Medicinske sestre ne morejo vsak dan poklicati vseh pacientov, zato potrebujejo pregled, kdo potrebuje pozornost.

### Osnovna zanka

**Pacient poroča → sistem označi → osebje ukrepa**

Vsaka funkcija mora podpirati to zanko. Če funkcija ne prinaša podatkov za razvrščanje pacientov ali ne pomaga osebju ukrepati, je dodatek.

## Tipi uporabnikov

Uporabniki se delijo na tri tipe: **odpuščenec**, **zadolženec** in **bolničar**.

| Tip | Kdo je | Glavni namen |
|-----|--------|--------------|
| Odpuščenec | Pacient, odpuščen iz bolnišnice | Vidi in izvaja svoj načrt okrevanja |
| Zadolženec | Svojec ali skrbnik, ki doma skrbi za pacienta | Spremlja, ali se pacient drži načrta |
| Bolničar | Zdravnik ali medicinska sestra | Pripravi in ureja načrt okrevanja |

### Odpuščenec

Odpuščenec je oseba, ki je bila odpuščena iz bolnišnice po operaciji, zdravljenju ali pregledu in doma potrebuje pomoč pri okrevanju.

Ima dostop do vseh svojih podatkov:

- osebni podatki in podatki o odpustu (diagnoza, poseg, navodila),
- seznam zdravil z odmerki ter časom jemanja (kolikokrat na dan in kdaj),
- vaje za rehabilitacijo, po možnosti z videom,
- navodila, kaj naj počne in česa naj se izogiba,
- opozorilni znaki, ob katerih naj poišče pomoč.

Ob vsakem zdravilu in vaji lahko označi, da je opravljeno, kar je osnova za spremljanje, ali se drži načrta.

### Zadolženec

Zadolženec je oseba, ki doma skrbi za odpuščenca, na primer svojec ali skrbnik.

- **Prijava:** z e-poštnim naslovom ali s številko zdravstvenega zavarovanja (ZZZS).
- **Pregled:** vidi, kaj odpuščenec potrebuje (zdravila, odmerke, vaje, navodila).
- **Spremljanje:** vidi, ali se odpuščenec drži načrta, na primer katera zdravila so bila vzeta in katere vaje opravljene ali izpuščene.
- **Opomniki:** aplikacija zadolžencu (in odpuščencu) pošilja e-pošto ali SMS z opomniki za naloge, kot so jemanje zdravil in izvajanje vaj.

### Bolničar

Bolničar je zdravnik ali medicinska sestra.

- **Kartoteka ob odpustu:** ko je pacient odpuščen, bolničar izpolni njegovo kartoteko.
- **Načrt okrevanja:** doda vaje, zdravila, odmerke in urnik (kolikokrat na dan, ob kateri uri).
- **Predloge navodil:** za posamezne posege ali operacije obstajajo osnovne predloge navodil (na primer zamenjava kolka). Bolničar začne s predlogo in jo prilagodi pacientu.
- **Urejanje predlog:** predloge lahko spreminjajo vsi zdravniki.
- **Dnevnik sprememb (audit log):** vsaka sprememba kartoteke, načrta ali predloge se shrani v dnevnik: kdo je spremembo naredil, kdaj in kaj se je spremenilo.

### Pravice dostopa (osnutek)

| Dejanje | Odpuščenec | Zadolženec | Bolničar |
|---------|:----------:|:----------:|:--------:|
| Ogled lastnega načrta in podatkov | ✓ | ✓ (za svojega pacienta) | ✓ |
| Označevanje opravljenih nalog | ✓ | ✓ | |
| Spremljanje upoštevanja načrta | ✓ | ✓ | ✓ |
| Prejemanje opomnikov (e-pošta/SMS) | ✓ | ✓ | |
| Urejanje kartoteke in načrta | | | ✓ |
| Urejanje predlog navodil | | | ✓ (zdravniki) |
| Ogled dnevnika sprememb | | | ✓ |

## Funkcionalnosti

### Za pacienta

- **Dnevni pregled stanja (približno 60 s).** Vprašanja so prilagojena diagnozi:
  - operacija kolka ali kolena: bolečina, temperatura, fotografija rane, gibljivost,
  - srčno popuščanje: teža, otekline, težko dihanje.
- **Opomniki za zdravila.** Prikaže, katero zdravilo vzeti in kdaj, z gumbom »Vzeto«. Izpuščeni odmerki vplivajo na oceno tveganja.
- **Načrt rehabilitacije.** Vaje z videi, prilagojene diagnozi, ki se iz tedna v teden stopnjujejo. Po vsaki vadbi pacient odgovori »Opravljeno?« in »Bolečina 0–10?«.
- **Moje okrevanje.** Odpustno pismo v preprostem jeziku, lastni trendi (bolečina, temperatura, teža, upoštevanje načrta) in isti status (zeleno/rumeno/rdeče), kot ga vidi osebje.
- **Eskalacija namesto odprtega klepeta.** Ko status postane rdeč, pacienta pokliče medicinska sestra.

### Za osebje (nadzorna plošča)

- Seznam pacientov, razvrščen po semaforju (zeleno/rumeno/rdeče).
- **Vsako opozorilo pove, zakaj se je sprožilo**, na primer: »Označen, ker se je bolečina v 3 dneh dvignila s 3 na 7 in sta bili izpuščeni 2 vadbi.«
- Opozorila na trende, na primer »teža +2 kg v 3 dneh«.
- Fotografije rane, prikazane ena ob drugi skozi čas.
- Tedenski povzetek za vsakega pacienta, ki ga napiše AI.
- Hitra dejanja: pokliči pacienta, prilagodi načrt, naroči obisk.

## Klinična podlaga

- **LACE indeks ob odpustu** (dolžina hospitalizacije, akutnost, pridružene bolezni, obiski urgence). Določa, kako pogosto pacient poroča: dnevno pri visokem tveganju, vsake 3 dni pri nizkem.
- **Pravila za opozorila iz smernic:**
  - srčno popuščanje: porast teže za več kot 2 kg v 3 dneh,
  - po operaciji: temperatura nad 38 °C; rana, ki je rdeča, topla ali se izceja.
- **Sintetični pacienti iz orodja Synthea** v formatu FHIR, ki ga uporabljajo bolnišnice.
- **Podpora odločanju, ne diagnoza.** Sistem razvršča paciente, odločitve sprejema osebje. Brez AI diagnoz in brez AI analize ran.

## Tehnične podrobnosti

*Za dopolniti.*

- Tehnološki sklad: *še ni izbran*
- Obvestila: e-pošta in SMS
- Podatkovni model: *za dopolniti*
- Prijava in avtentikacija: *za dopolniti*

## Obseg za 24 ur

**Mora delovati v demu**
- dnevni pregled stanja (splet, najprej za mobilne naprave),
- nadzorna plošča s semaforjem in pojasnjenimi opozorili,
- LACE ocena in pravila za opozorila,
- vaje za rehabilitacijo z beleženjem opravljenega in bolečine,
- opomniki za zdravila,
- demo v živo s kodo QR.

**Samo klikljivi prototipi**
- celoten pogled »Moje okrevanje«,
- poročanje prek telefona/SMS in prek svojcev,
- podatki o korakih iz Google Fit / Apple Health,
- zaslon za čustveno podporo.

**Izpuščeno**
- naročanje na preglede (to že pokrivata zVEM in eNaročanje),
- odprt klepet z zdravnikom (ni skalabilno),
- snemanje lastnih videov vaj (namesto tega vgradimo 3–5 obstoječih videov fizioterapevtov).

## Demo

1. Član žirije skenira kodo QR in na svojem telefonu opravi pregled stanja.
2. Poroča visoko bolečino in izpuščeno vadbo.
3. Na nadzorni plošči (na projektorju) njegova kartica postane rdeča, skupaj z razlogom.

**Zgodba pacienta:** pacient po zamenjavi kolka ima LACE oceno 11 (visoko tveganje), zato poroča dnevno. Od 3. do 5. dne se mu bolečina stopnjuje in izpusti dve vadbi. Status postane rumen z navedenimi razlogi, medicinska sestra ga pokliče in okužba rane je odkrita zgodaj.

## Odprta vprašanja

- [ ] Najti pravi podatek o stopnji ali stroških ponovnih sprejemov v Sloveniji ali EU
- [ ] Preveriti mejne vrednosti opozoril z nekom z medicinskim znanjem
- [ ] Izbrati tehnološki sklad
- [ ] Izbrati 3–5 videov vaj po zamenjavi kolka iz zanesljivih virov
- [ ] Določiti, kako se zadolženec poveže z odpuščencem (povabilo, potrditev)
