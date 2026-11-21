# zDoma

ADAHack 2026, izziv 1 (ekipa Ixtlan): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

## Na kratko

Pacient po odpustu iz bolnišnice doma vsak dan opravi kratek pregled stanja, jemlje zdravila in dela vaje po navodilih. Sistem opazi zgodnje opozorilne znake in o njih obvesti osebje, preden zaplet pripelje do ponovnega sprejema v bolnišnico. Osebje vidi samo bolnike, ki potrebujejo pozornost.

## Problem

Po odpustu gre pacient domov skoraj brez zdravniškega nadzora. Zapleti, kot so poslabšanje srčnega popuščanja, okužbe ali napake pri jemanju zdravil, pogosto ostanejo neopaženi, dokler se pacient ne vrne na urgenco. Medicinske sestre ne morejo vsak dan poklicati vseh pacientov, zato potrebujejo pregled, kdo potrebuje pozornost.

- Skoraj polovica bolnikov, sprejetih zaradi akutnega srčnega popuščanja, je v Evropi v enem letu ponovno sprejetih.
- 19 % bolnikov ima v nekaj tednih po odpustu neželen dogodek, 66 % teh je povezanih z zdravili.

Viri in podrobnosti: [docs/research.md](docs/research.md).

## Osnovna zanka

**Pacient poroča → sistem označi → osebje ukrepa**

Vsaka funkcija mora podpirati to zanko. Če funkcija ne prinaša podatkov za razvrščanje pacientov ali ne pomaga osebju ukrepati, je dodatek.

## Skupine bolnikov

Aplikacija je splošna, a jo gradimo za šest skupin s hudimi boleznimi, pri katerih se zapleti po odpustu pogosto spregledajo in za katere raziskave kažejo, da spremljanje doma pomaga. Glavna skupina, na kateri temelji demo, je **srčno popuščanje**.

| Skupina | Kaj pacient poroča | Opozorilni znaki | Ključna raziskava |
|---|---|---|---|
| **Srčno popuščanje** (glavna) | teža, otekline, težko dihanje | teža +2 kg v 3 dneh, težje dihanje, izpuščen diuretik | Cochrane 2015: spremljanje doma, −20 % smrti, −29 % sprejemov zaradi srčnega popuščanja |
| **Po infarktu ali operaciji srca** | bolečina v prsih, dihanje, rana, zdravila | bolečina v prsih → 112, izpuščena zdravila za redčenje krvi, rana, vročina | Cochrane 2023: rehabilitacija doma je enako učinkovita kot v centru |
| **Nov kolk ali koleno** | bolečina, temperatura, fotografija rane, otekel meč | vročina nad 38 °C, rdeča ali izcejajoča rana, en otekel meč (možen strdek) | Okužbe in zapleti s protezo povzročijo 59 % stroškov ponovnih sprejemov |
| **KOPB** | dihanje, kašelj in barva izmečka, vročina | precej težje dihanje, zelen ali rumen izmeček, vročina | Evropska revizija KOPB: 35 % ponovno sprejetih v 90 dneh; spremljanje doma −26 % sprejemov zaradi poslabšanja |
| **Možganska kap** | krvni tlak, nova šibkost ali težave z govorom, padci | znaki GROM → 112, visok tlak, padec | Cochrane 2017: nadaljevanje oskrbe doma zmanjša smrt ali odvisnost (OR 0,80) |
| **Rak na sistemskem zdravljenju** | temperatura, slabost, driska, bolečina, počutje | vročina ≥ 38 °C → takoj klic na onkološki oddelek | Basch (JAMA 2017): poročanje simptomov od doma, preživetje 31,2 proti 26,0 meseca |

Za vse skupine velja: opomniki za zdravila, ker so težave z zdravili najpogostejša škoda po odpustu.

### Predloge

Vsaka skupina je ena **predloga**: podatkovna datoteka z vprašanji, pravili za opozorila, privzetimi zdravili, vajami in privzeto dolžino rehabilitacije. Koda je splošna: en zaslon za pregled stanja prikaže vprašanja iz predloge, ena funkcija preveri odgovore po pravilih predloge in vrne status in razlog. Nova skupina pomeni samo novo datoteko, brez novih zaslonov. Predloge napišemo sami po smernicah. Kasneje jih bodo urejali zdravniki. Brez AI.

## Tipi uporabnikov

| Tip | Kdo je | Glavni namen |
|-----|--------|--------------|
| Odpuščenec | Pacient, odpuščen iz bolnišnice | Izvaja svoj načrt okrevanja in poroča o stanju |
| Zadolženec | Svojec ali skrbnik, ki ga je pacient odobril | Spremlja, ali se pacient drži načrta (samo branje) |
| Bolničar | Zdravnik ali medicinska sestra | Odpre rehabilitacijo in ukrepa, ko je treba |

Odpuščenec in zadolženec nista vrsti računa, ampak odnos do pacienta. Ista oseba je lahko odpuščenec v svoji rehabilitaciji in zadolženec za svojo mamo.

### Odpuščenec

Ima dostop do vseh svojih podatkov:

- podatki o odpustu (diagnoza, poseg, navodila v preprostem jeziku),
- seznam zdravil z odmerki in časom jemanja,
- vaje za rehabilitacijo, po možnosti s sliko ali videom,
- kaj naj počne in česa naj se izogiba,
- opozorilni znaki, ob katerih naj poišče pomoč.

Ob vsakem zdravilu in vaji označi, da je opravljeno. Sam odobri ali zavrne prošnje svojcev za dostop in jim dostop kadar koli odvzame.

### Po čem se zDoma razlikuje

*Aplikacija pokaže samo, kaj se je danes spremenilo: pri teži in pri zdravilih. Za ostalo poskrbita patronažna sestra in družina.*

1. **»Danes« namesto menijev:** aplikacija se odpre na naslednjem današnjem opravilu in konča s »Končano za danes ✓«. Običajen dan so 3–4 dotiki.
2. **»Enako kot včeraj«:** če se ni nič spremenilo, en dotik. Več vpraša le, ko je kaj drugače.
3. **Vsak dan nekaj nazaj:** lastne številke (»72,4 kg – blizu vaše ciljne teže ✓«, »Dan 6 od 30«) in ime sestre, ko ukrepa (»Sestra Mojca vas bo poklicala danes do 12:00«).
4. **Zdravila od začetka do konca:** kaj se je ob odpustu spremenilo (Novo / Spremenjeno / Ukinjeno, s fotografijo škatlice), ali so prevzeta (eRecept) in opomnik, preden zmanjka.
5. **Namestitev ob prvem patronažnem obisku:** patronažna sestra aplikacijo namesti na pacientov telefon in z njim opravi prvi pregled stanja.

### Pregled stanja in zdravila

- **Pregled stanja je kratek in ves z enim dotikom:** največ 5 vprašanj, eno na zaslon, odgovori so veliki gumbi (brez tipkanja). Teža je vrsta gumbov okoli zadnje teže. Če je bil včeraj zelen, gumb »Enako kot včeraj« z enim dotikom odgovori na vse razen ključnih vprašanj (npr. teža).
- **Vprašanja so prilagojena pacientu:** bolničar ob odpustu izbere, katera vprašanja iz predloge dobi, in vpiše njegove vrednosti. Pacient ne vidi splošnega obrazca, ampak npr. »Ali tehtate več kot 72 kg?«.
- **Prevzem zdravil (eRecept):** pri vsakem zdravilu je vidno, ali ga je pacient prevzel v lekarni. Če ga ne prevzame, aplikacija najprej opomni pacienta, nato obvesti zadolženca in šele nato bolničarja (»Furosemid ni prevzet 3 dni po odpustu«). Na hackathonu podatke simuliramo, v praksi bi prišli iz eRecepta prek CEZIH.
- **Opomnik, preden zdravila zmanjka:** iz velikosti prevzetega pakiranja in dnevnega odmerka aplikacija izračuna, koliko dni še zadošča, in pacientu pravočasno napiše: »Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept.« Odmerkov nikoli ne spreminja.

### Zadolženec

- **Prijava:** se registrira sam, s svojo davčno številko in geslom, v svoj račun (nikoli v pacientovega).
- **Dostop:** pod »Zaprosi za dostop« vpiše davčno številko pacienta. Aplikacija vedno odgovori »Prošnja poslana«, da nihče ne more ugotoviti, kdo uporablja zDoma. Dostop začne veljati, ko ga pacient odobri.
- **Zavihek »Skrbim za«:** samo za branje. Na vrhu vidi opozorilo, če pacient zdravil še ni prevzel v lekarni. Vidi, katera zdravila so bila vzeta ali izpuščena, katere vaje opravljene ali izpuščene, ali je bil opravljen pregled stanja in kakšen je trenutni status.
- **Obvestila (kasneje):** za vsakega pacienta lahko vklopi »Prejemaj obvestila« (privzeto izklopljeno) in izbere e-pošto, SMS ali oboje. Prejema iste opomnike kot pacient ter sporočilo, ko pacient kaj izpusti ali njegov status postane rumen ali rdeč. Sporočila ne vsebujejo diagnoze ali imen zdravil.

### Bolničar

Cilj: **čim manj dela za osebje.**

- **Odpust v približno 1 minuti:** izbere predlogo, vpiše davčno številko pacienta, prilagodi zdravila in datum konca. Vse drugo pride iz predloge.
- **Rehabilitacija traja do datuma, ki ga določi bolničar.** Lahko jo podaljša (»Podaljšaj«) ali na novo odpre kmalu po koncu.
- **Nadzorna plošča prikaže samo težave.** Zeleni bolniki so privzeto skriti. Vsako opozorilo pove, zakaj se je sprožilo.
- **Patronažna sestra se dodeli po naslovu:** vsaka pokriva svoj teren (občina, naselja). Ob odpustu aplikacija predlaga pravo sestro, bolničar potrdi z enim dotikom. Brez ujemanja gre pacient med »Nedodeljene«, kjer ga lahko katera koli sestra prevzame (»Prevzemi«). Med dopustom »Nadomeščanje« preda paciente sodelavki do določenega datuma.
- **Primerna za patronažno sestro z veliko pacienti:** tudi na telefonu lahko išče po imenu ali davčni številki in filtrira po »Moji pacienti« (privzeto vklopljeno), statusu, občini, predlogi, izpuščenem pregledu stanja in neprevzetih zdravilih.
- **Aplikacija opominja pacienta, ne sestre.** Izpuščen pregled stanja → opomnik pacientu, nato svojcu, šele nato osebju.
- **Hitra dejanja z enim dotikom:** »Poklicano – vse v redu«, »Naročen pregled«, »Obveščen osebni zdravnik«.
- **Dnevnik sprememb:** vsaka sprememba načrta, podaljšanje ali dejanje se zapiše samodejno.

Računi bolničarjev se ne registrirajo sami. Ustvari jih skrbnik.

### Pravice dostopa

| Dejanje | Odpuščenec | Zadolženec | Bolničar |
|---------|:----------:|:----------:|:--------:|
| Ogled načrta in podatkov | ✓ | ✓ (za odobrenega pacienta) | ✓ |
| Pregled stanja, označevanje opravljenih nalog | ✓ | | |
| Spremljanje upoštevanja načrta | ✓ | ✓ | ✓ |
| Odobritev dostopa svojcem | ✓ | | |
| Prejemanje opomnikov (e-pošta/SMS, kasneje) | ✓ | ✓ (če vklopi) | |
| Odpiranje, urejanje in podaljšanje rehabilitacije | | | ✓ |
| Ogled dnevnika sprememb | | | ✓ |

## Prijava in rehabilitacija

1. **Ob prvem odpustu** bolničar ustvari pacientov račun (davčna številka in ime). Sistem ustvari **začasno geslo**, ki se natisne na ločen **prijavni listek**, nikoli na odpustnico.
2. **Ob prvi prijavi** pacient z začasnim geslom vstopi in si mora takoj nastaviti svoje geslo (dovoljen je 6-mestni PIN). Začasno geslo nato ne deluje več. Neuporabljeno poteče po 7 dneh; bolničar lahko izda novo.
3. **Rehabilitacija** je eno obdobje okrevanja. Odpre jo bolničar po predlogi in določi datum konca. Dokler je **aktivna**, tečejo pregledi stanja, opomniki in opozorila. Ko poteče, je **zaključena**: vse ostane na voljo za branje.
4. Pacient, ki že ima račun, ne dobi novega gesla. Nova rehabilitacija se mu samo prikaže.
5. Po prijavi: če je aktivna ena rehabilitacija, se odpre takoj. Če jih je več, so prikazane kot velike kartice.

Davčna številka ni skrivnost, zato se brez gesla nikoli ni mogoče prijaviti.

## Varnost

- **zDoma ni služba za nujno pomoč.** Pri bolečini v prsih, nenadnem hudem težkem dihanju, omedlevici ali znakih kapi aplikacija najprej prikaže celozaslonsko »Pokličite 112«, šele nato obvesti osebje.
- **Podpora odločanju, ne diagnoza.** Sistem razvršča paciente, odločitve sprejema osebje. Brez AI diagnoz in brez AI analize ran.
- **Samo izmišljeni podatki** v razvoju in demu. Izmišljene davčne številke, ki prestanejo preverjanje kontrolne števke.

## Uporabniški vmesnik

Uporabljajo ga tudi starejši, zato:

- najprej slovenščina, preproste besede, brez strokovnih izrazov,
- najprej za telefon, deluje tudi na računalniku,
- en korak na zaslon, velika pisava (vsaj 18 px), veliki gumbi (vsaj 48 px),
- barva statusa vedno z besedo, na primer »Rdeče – potrebna pozornost«,
- jasna potrditev »Shranjeno ✓« in gumb »Nazaj« na vsakem zaslonu.

## Tehnične podrobnosti

- **Tehnološki sklad:** Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, Supabase (Postgres, Realtime, Storage, Auth), gostovanje na Cloudflare Workers. Brez LLM.
- **Ocena tveganja:** LACE indeks ob odpustu in pravila iz predloge. Tedenski povzetek je sestavljen po predlogi iz podatkov (brez AI).
- **Sintetični pacienti** (na primer iz orodja Synthea, format FHIR, ki ga uporabljajo bolnišnice).
- **Obvestila:** e-pošta in SMS, kasneje.

Pravila za razvijalce in agente: [AGENTS.md](AGENTS.md). Naloge: [TASKS.md](TASKS.md). Raziskave: [docs/research.md](docs/research.md).

## Obseg za 24 ur

**Mora delovati v demu**
- prijava z začasnim geslom in nastavitev svojega gesla,
- bolničar odpre rehabilitacijo po predlogi,
- dnevni pregled stanja po predlogi, z zaslonom »Pokličite 112«,
- nadzorna plošča s semaforjem in pojasnjenimi opozorili,
- opomniki za zdravila in vaje z beleženjem,
- zavihek »Skrbim za« za svojce,
- demo v živo s kodo QR.

**Samo klikljivi prototipi**
- poročanje prek telefona/SMS.

**Kasneje**
- opomniki po e-pošti in SMS, tudi za svojce,
- urejanje predlog za zdravnike,
- podatki o korakih iz Google Fit / Apple Health.

**Izpuščeno**
- naročanje na preglede (to že pokrivata zVEM in eNaročanje),
- odprt klepet z zdravnikom (ni skalabilno),
- snemanje lastnih videov vaj (vgradimo obstoječe videe fizioterapevtov),
- ločen pogled »Moje okrevanje« in zaslon za čustveno podporo (preveč splošno; lasten trend je na koncu pregleda stanja).

## Demo

1. Član žirije skenira kodo QR in na svojem telefonu opravi pregled stanja.
2. Vpiše večjo težo in otekle gležnje.
3. Na nadzorni plošči (na projektorju) njegova kartica postane rdeča, skupaj z razlogom.

**Zgodba pacienta:** 78-letni gospod s srčnim popuščanjem, suha teža 72 kg. Od 3. do 5. dne po odpustu se mu teža dvigne na 74,5 kg, gležnji otečejo in enkrat izpusti diuretik. Hčerka, ki ima dostop kot zadolženka, vidi izpuščeno zdravilo. Status postane rdeč z navedenimi razlogi, medicinska sestra ga pokliče in po telefonu prilagodi odmerek diuretika. Ponoven sprejem v bolnišnico je preprečen.

## Odprta vprašanja

- [ ] Najti slovenski podatek o ponovnih sprejemih ali stroških pri srčnem popuščanju (NIJZ, ZZZS)
- [ ] Preveriti mejne vrednosti opozoril z nekom z medicinskim znanjem (npr. 2 kg v 2 ali 3 dneh)
- [ ] Preveriti vse številke v izvirnih člankih, preden gredo na prosojnice
- [ ] Z Ixtlanom potrditi, kako dodelitev patronaže poteka v praksi (teren po naslovu, delovni nalog iz bolnišnice/od osebnega zdravnika)
- [ ] Potrditi, po koliko dneh neprevzeto zdravilo sproži opozorilo (privzeto 2), z Ixtlanom ali nekom z medicinskim znanjem
- [ ] Izbrati vaje in videe za vseh šest skupin iz zanesljivih virov
- [x] Izbrati tehnološki sklad
- [x] Določiti, kako se zadolženec poveže z odpuščencem (prošnja z davčno številko, pacient potrdi)
- [x] Izbrati skupine bolnikov (šest, glavna je srčno popuščanje)
