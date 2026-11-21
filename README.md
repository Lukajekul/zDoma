# zDoma

ADAHack 2026, izziv 1 (ekipa Ixtlan): *Spremljanje pacientov na domu po odpustu iz bolnišnice*

## Na kratko

zDoma opazi težave, ki jih pacient po odpustu sam ne sporoči: zdravila, ki jih ni prevzel v lekarni, izpuščene tablete, težo, ki počasi narašča. Najprej jih skuša rešiti s pacientom in svojci, patronažna sestra pa vidi samo tisto, kar ostane, vedno z razlogom. Dnevni pregled stanja traja 30 sekund in je le eden od virov podatkov, ne bistvo aplikacije.

## Problem

Po odpustu gre pacient domov skoraj brez zdravniškega nadzora. Zapleti, kot so poslabšanje srčnega popuščanja, okužbe ali napake pri jemanju zdravil, pogosto ostanejo neopaženi, dokler se pacient ne vrne na urgenco. Medicinske sestre ne morejo vsak dan poklicati vseh pacientov, zato potrebujejo pregled, kdo potrebuje pozornost.

- Skoraj polovica bolnikov, sprejetih zaradi akutnega srčnega popuščanja, je v Evropi v enem letu ponovno sprejetih.
- 19 % bolnikov ima v nekaj tednih po odpustu neželen dogodek, 66 % teh je povezanih z zdravili.

Viri in podrobnosti: [docs/research.md](docs/research.md).

## Osnovna zanka

**Pacient in lekarna (eRecept) dajo podatke → sistem označi → najprej opomni pacienta in svojce → šele nato ukrepa osebje**

Vsaka funkcija mora podpirati to zanko. Če funkcija ne prinaša podatkov za razvrščanje pacientov ali ne pomaga osebju ukrepati, je dodatek.

## Skupine bolnikov

Aplikacija je splošna, a jo gradimo za šest skupin s hudimi boleznimi, pri katerih se zapleti po odpustu pogosto spregledajo in za katere raziskave kažejo, da spremljanje doma pomaga. Glavna skupina, na kateri temelji predstavitev, je **srčno popuščanje**.

| Skupina | Kaj pacient poroča | Opozorilni znaki | Ključna raziskava |
|---|---|---|---|
| **Srčno popuščanje** (glavna) | teža, otekline, težko dihanje | teža +2 kg v 3 dneh, težje dihanje, izpuščen diuretik | Cochrane 2015: spremljanje doma, −20 % smrti, −29 % sprejemov zaradi srčnega popuščanja |
| **Po infarktu ali operaciji srca** | bolečina v prsih, dihanje, rana, zdravila | bolečina v prsih → 112, izpuščena zdravila za redčenje krvi, rana, vročina | Cochrane 2023: rehabilitacija doma je enako učinkovita kot v centru |
| **Nov kolk ali koleno** | bolečina, temperatura, fotografija rane, otekel meč | vročina nad 38 °C, rdeča ali izcejajoča rana, en otekel meč (možen strdek) | Okužbe in zapleti s protezo povzročijo 59 % stroškov ponovnih sprejemov |
| **KOPB** | dihanje, kašelj in barva izmečka, vročina | precej težje dihanje, zelen ali rumen izmeček, vročina | Evropska revizija KOPB: 35 % ponovno sprejetih v 90 dneh; spremljanje doma −26 % sprejemov zaradi poslabšanja |
| **Možganska kap** | krvni tlak, nova šibkost ali težave z govorom, padci | znaki GROM → 112, visok tlak, padec | Cochrane 2017: nadaljevanje oskrbe doma zmanjša smrt ali odvisnost (razmerje obetov 0,80) |
| **Rak na sistemskem zdravljenju** | temperatura, slabost, driska, bolečina, počutje | vročina ≥ 38 °C → takoj klic na onkološki oddelek | Basch (JAMA 2017): poročanje simptomov od doma, preživetje 31,2 proti 26,0 meseca |

Za vse skupine velja: opomniki za zdravila, ker so težave z zdravili najpogostejša škoda po odpustu.

### Predloge

Vsaka skupina je ena **predloga**: podatkovna datoteka z vprašanji, pravili za opozorila, priporočenimi zdravili z običajnimi odmerki, vajami in privzeto dolžino rehabilitacije. Koda je splošna: en zaslon za pregled stanja prikaže vprašanja iz predloge, ena funkcija preveri odgovore po pravilih predloge in vrne status in razlog. Nova skupina pomeni samo novo datoteko, brez novih zaslonov. Predloge napišemo sami po smernicah. Kasneje jih bodo urejali zdravniki. Brez umetne inteligence.

## Tipi uporabnikov

| Tip | Kdo je | Glavni namen |
|-----|--------|--------------|
| Odpuščenec | Pacient, odpuščen iz bolnišnice | Izvaja svoj načrt okrevanja in poroča o stanju |
| Zadolženec | Svojec ali skrbnik, ki ga je pacient odobril | Spremlja, ali se pacient drži načrta, in označi opravljene naloge, ko jih dela skupaj s pacientom |
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

*Vprašalniki sprašujejo, kako se pacient počuti. zDoma ve tudi, ali je zdravila prevzel in vzel, in sestri pokaže samo tisto, česar pacient in družina nista rešila.*

1. **Zdravila od lekarne do tablete:** 66 % škode po odpustu je povezane z zdravili. zDoma ve, ali je pacient zdravilo prevzel v lekarni (eRecept), ali ga jemlje in kdaj mu bo zmanjkalo, ne da bi pacient karkoli vpisal. Ob odpustu vidi, kaj se je spremenilo (Novo / Spremenjeno / Ukinjeno, s fotografijo škatlice). Na hekatonu podatke eRecepta simuliramo.
2. **Vgrajena v patronažo, ne nov postopek:** pacienta po naslovu dobi patronažna sestra, ki ga že obiskuje. Aplikacijo namesti ob prvem obisku in z njim opravi prvi pregled stanja. Na telefonu vidi svoje paciente, urejene po tem, kdo jo potrebuje.
3. **Aplikacija opominja pacienta, ne sestre:** izpuščen pregled stanja ali neprevzeto zdravilo → najprej opomnik pacientu, nato svojcu, šele nato osebju. Sestra vidi le, česar pacient in družina nista rešila.

### Zakaj pacient vztraja

Zgodnje raziskave so propadle, ker so pacienti nehali sodelovati. Zato:

1. **»Danes« namesto menijev:** aplikacija se odpre na naslednjem današnjem opravilu in konča s »Končano za danes ✓«. Običajen dan so 3–4 dotiki.
2. **»Enako kot včeraj«:** če se ni nič spremenilo, en dotik. Več vpraša le, ko je kaj drugače.
3. **Krog napredka za celo okrevanje:** debel krog, ki se polni v nasprotni smeri urinega kazalca od vrha, en del za vsak dan rehabilitacije. **Zeleno**, ko je pacient odgovoril na vprašanja, **rdeče**, ko je dan izpustil, sivo za dneve, ki še pridejo. V sredini je odstotek (»75 %«), pod krogom pa vedno z besedami: »Opravljeno 18 dni · Izpuščeno 2 dni · Še 10 dni«. Če bolničar rehabilitacijo podaljša, krog dobi nove dele in pacient vidi nov datum konca. Isti krog vidi tudi zadolženec.
4. **Vsak dan nekaj nazaj:** lastne številke (»72,4 kg – blizu vaše ciljne teže ✓«, »Dan 6 od 30«) in ime sestre, ko ukrepa (»Sestra Mojca vas bo poklicala danes do 12:00«).

### Pregled stanja in zdravila

- **Pregled stanja je kratek in ves z enim dotikom:** največ 6 vprašanj, eno na zaslon, odgovori so veliki gumbi (brez tipkanja). Teža je vrsta gumbov okoli zadnje teže. Če je bil včeraj zelen, gumb »Enako kot včeraj« z enim dotikom odgovori na vse razen ključnih vprašanj (npr. teža).
- **Vprašanja so prilagojena pacientu:** vprašanja iz predloge so že obkljukana (bolničar lahko katero odstrani), bolničar vpiše le pacientove vrednosti. Pacient ne vidi splošnega obrazca, ampak npr. »Ali tehtate več kot 72 kg?«.
- **Prevzem zdravil (eRecept):** pri vsakem zdravilu je vidno, ali ga je pacient prevzel v lekarni. Če ga ne prevzame, aplikacija najprej opomni pacienta, nato obvesti zadolženca in šele nato bolničarja (»Furosemid ni prevzet 3 dni po odpustu«). Na hekatonu podatke simuliramo, v praksi bi prišli iz eRecepta prek CEZIH.
- **Opomnik, preden zdravila zmanjka:** iz velikosti prevzetega pakiranja in dnevnega odmerka aplikacija izračuna, koliko dni še zadošča, in pacientu pravočasno napiše: »Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept.« Odmerkov nikoli ne spreminja.

### Zadolženec

- **Prijava:** se registrira sam, s svojo davčno številko in geslom, v svoj račun (nikoli v pacientovega).
- **Dostop:** pod »Zaprosi za dostop« vpiše davčno številko pacienta. Aplikacija vedno odgovori »Prošnja poslana«, da nihče ne more ugotoviti, kdo uporablja zDoma. Dostop začne veljati, ko ga pacient odobri.
- **Zavihek »Skrbim za«:** na vrhu vidi opozorilo, če pacient zdravil še ni prevzel v lekarni. Vidi, katera zdravila so bila vzeta ali izpuščena, katere vaje opravljene ali izpuščene, ali je bil opravljen pregled stanja in kakšen je trenutni status.
- **Označevanje skupaj s pacientom:** ko je zadolženec pri pacientu, lahko označi »Vzeto« pri zdravilih, »Opravljeno« pri vajah in z njim izpolni pregled stanja. Pri vsakem vnosu piše, kdo ga je vnesel (»Označila: Ana (hčerka)«). Načrta, zdravil in datuma konca ne more spreminjati.
- **Obvestila (kasneje):** za vsakega pacienta lahko vklopi »Prejemaj obvestila« (privzeto izklopljeno) in izbere e-pošto, SMS ali oboje. Prejema iste opomnike kot pacient ter sporočilo, ko pacient kaj izpusti ali njegov status postane rumen ali rdeč. Sporočila ne vsebujejo diagnoze ali imen zdravil.

### Bolničar

Cilj: **čim manj dela za osebje.**

- **Odpust v treh korakih:** izbere predlogo, vpiše davčno številko in pacientove vrednosti (npr. suho težo) ter potrdi. Vprašanja, zdravila (iz predloge in eRecepta), patronažna sestra in datum konca so že predizpolnjeni; spremeni jih le, če je treba.
- **Zdravila z nekaj dotiki:** predloga priporoči zdravila, ki se pri tej bolezni običajno predpišejo, skupaj z zdravili, ki jih pacient že jemlje (eRecept). Bolničar zdravilo obkljuka in tapne enega od običajnih odmerkov (npr. Furosemid 20 / 40 / 80 mg, zjutraj). Z »Uredi« nastavi drugačen odmerek, čas ali trajanje, z »Dodaj zdravilo« doda katero koli drugo zdravilo. Odmerki so iz smernic, ne izmišljeni, in jih vidi samo osebje.
- **Rehabilitacija traja do datuma, ki ga določi bolničar.** Lahko jo podaljša (»Podaljšaj«) ali na novo odpre kmalu po koncu.
- **Nadzorna plošča prikaže samo težave.** Zeleni bolniki so privzeto skriti. Vsako opozorilo pove, zakaj se je sprožilo.
- **Patronažna sestra se dodeli po naslovu:** vsaka pokriva svoj teren (občina, naselja). Ob odpustu aplikacija predlaga pravo sestro, bolničar potrdi z enim dotikom. Brez ujemanja gre pacient med »Nedodeljene«, kjer ga lahko katera koli sestra prevzame (»Prevzemi«). Med dopustom »Nadomeščanje« preda paciente sodelavki do določenega datuma.
- **Primerna za patronažno sestro z veliko pacienti:** tudi na telefonu lahko išče po imenu ali davčni številki in filtrira po »Moji pacienti« (privzeto vklopljeno), statusu, občini, predlogi, izpuščenem pregledu stanja in neprevzetih zdravilih.
- **Vsak dan opomnik, ne glede na vse.** Dokler je rehabilitacija aktivna, pacient vsak dan ob svoji uri (privzeto ob 8:00) dobi obvestilo na telefon: »Dobro jutro, Janez. Čas je za današnji pregled. Traja 30 sekund.« Tudi ko je več dni vse v redu. Uro lahko spremeni, izklopiti ga ne more. Če je pregled že opravil, opomnika tisti dan ni.
- **Aplikacija opominja pacienta, ne sestre.** Izpuščen pregled stanja → opomnik pacientu, nato svojcu, šele nato osebju.
- **Hitra dejanja z enim dotikom:** »Poklicano – vse v redu«, »Naročen pregled«, »Obveščen osebni zdravnik«.
- **Dnevnik sprememb:** vsaka sprememba načrta, podaljšanje ali dejanje se zapiše samodejno.

Računi bolničarjev se ne registrirajo sami. Ustvari jih skrbnik.

### Pravice dostopa

| Dejanje | Odpuščenec | Zadolženec | Bolničar |
|---------|:----------:|:----------:|:--------:|
| Ogled načrta in podatkov | ✓ | ✓ (za odobrenega pacienta) | ✓ |
| Pregled stanja, označevanje opravljenih nalog | ✓ | ✓ (skupaj s pacientom, z oznako, kdo je vnesel) | |
| Spremljanje upoštevanja načrta | ✓ | ✓ | ✓ |
| Odobritev dostopa svojcem | ✓ | | |
| Prejemanje opomnikov (e-pošta/SMS, kasneje) | ✓ | ✓ (če vklopi) | |
| Odpiranje, urejanje in podaljšanje rehabilitacije | | | ✓ |
| Ogled dnevnika sprememb | | | ✓ |

## Prijava in rehabilitacija

1. **Ob prvem odpustu** bolničar ustvari pacientov račun (davčna številka in ime) in natisne **prijavni listek** s kodo QR, nikoli na odpustnico.
2. **Prijava:** pacient (ali patronažna sestra ob prvem obisku) skenira kodo QR s kamero telefona in je prijavljen. Brez gesla, brez PIN-a. Telefon si prijavo zapomni.
3. **Rehabilitacija** je eno obdobje okrevanja. Odpre jo bolničar po predlogi in določi datum konca. Dokler je **aktivna**, tečejo pregledi stanja, opomniki in opozorila. Ko poteče, je **zaključena**: vse ostane na voljo za branje.
4. Pacient, ki že ima račun, uporablja isti listek. Nova rehabilitacija se mu samo prikaže.
5. Po prijavi: če je aktivna ena rehabilitacija, se odpre takoj. Če jih je več, so prikazane kot velike kartice.

Davčna številka ni skrivnost, zato sama nikoli ne prijavi. Bolničarji in svojci se prijavijo z davčno številko in geslom.

**Prijavni listek je kot ključ:** kdor ima kodo QR, lahko odpre račun. Isto kodo lahko pokaže tudi telefon patronažne sestre ali zadolženca (»QR za prijavo«). Če se listek izgubi, bolničar ali pacient izda novo kodo (»Nova koda QR«): stara takoj preneha delovati, vse naprave se odjavijo.

## Varnost

- **zDoma ni služba za nujno pomoč.** Pri bolečini v prsih, nenadnem hudem težkem dihanju, omedlevici ali znakih kapi aplikacija najprej prikaže celozaslonsko »Pokličite 112«, šele nato obvesti osebje.
- **Podpora odločanju, ne diagnoza.** Sistem razvršča paciente, odločitve sprejema osebje. Brez diagnoz in analize ran z umetno inteligenco.
- **Samo izmišljeni podatki** pri razvoju in predstavitvi. Izmišljene davčne številke, ki prestanejo preverjanje kontrolne števke.

## Uporabniški vmesnik

Uporabljajo ga tudi starejši, zato:

- najprej slovenščina, preproste besede, brez strokovnih izrazov,
- najprej za telefon, deluje tudi na računalniku,
- en korak na zaslon, velika pisava (vsaj 18 px), veliki gumbi (vsaj 48 px),
- barva statusa vedno z besedo, na primer »Rdeče – potrebna pozornost«,
- jasna potrditev »Shranjeno ✓« in gumb »Nazaj« na vsakem zaslonu.

## Tehnične podrobnosti

- **Tehnologije:** Next.js in TypeScript, Tailwind CSS in shadcn/ui za videz, Supabase (podatkovna baza Postgres, sprotne posodobitve, shramba fotografij in prijava), gostovanje na Cloudflare Workers. Brez velikih jezikovnih modelov.
- **Ocena tveganja:** LACE indeks ob odpustu in pravila iz predloge. Tedenski povzetek je sestavljen po predlogi iz podatkov (brez umetne inteligence).
- **Izmišljeni pacienti** (na primer iz orodja Synthea, v zapisu FHIR, ki ga uporabljajo bolnišnice).
- **Obvestila:** dnevni opomnik kot obvestilo na telefonu (spletna potisna obvestila) že v prvi različici; e-pošta in SMS kasneje.

Pravila za razvijalce in agente umetne inteligence: [AGENTS.md](AGENTS.md). Naloge: [TASKS.md](TASKS.md). Raziskave: [docs/research.md](docs/research.md).

## Obseg za 24 ur

**Mora delovati na predstavitvi**
- dnevni opomnik za pregled stanja na telefonu,
- prijava pacienta s kodo QR s prijavnega listka,
- bolničar odpre rehabilitacijo po predlogi,
- dnevni pregled stanja po predlogi, z zaslonom »Pokličite 112«,
- nadzorna plošča s semaforjem in pojasnjenimi opozorili,
- opomniki za zdravila in vaje z beleženjem,
- prevzem zdravil (simuliran eRecept) z opomniki: pacient → svojec → osebje,
- zavihek »Skrbim za« za svojce,
- predstavitev v živo s kodo QR.

Vseh šest predlog je podatkovnih datotek, do konca izdelamo in predstavimo srčno popuščanje.

**Samo klikljivi prototipi**
- poročanje prek telefona/SMS.

**Kasneje**
- opomniki po e-pošti in SMS, tudi za svojce,
- urejanje predlog za zdravnike,
- podatki o korakih iz aplikacij Google Fit in Apple Health.

**Izpuščeno**
- naročanje na preglede (to že pokrivata zVEM in eNaročanje),
- odprt klepet z zdravnikom (ni skalabilno),
- snemanje lastnih videov vaj (vgradimo obstoječe videe fizioterapevtov),
- ločen pogled »Moje okrevanje« in zaslon za čustveno podporo (preveč splošno; lasten trend je na koncu pregleda stanja).

## Predstavitev

1. Član žirije skenira kodo QR in na svojem telefonu opravi pregled stanja.
2. Vpiše večjo težo in otekle gležnje.
3. Na nadzorni plošči (na projektorju) njegova kartica postane rdeča, skupaj z razlogi: »Teža +2,5 kg v 3 dneh« in »Furosemid ni prevzet 3 dni po odpustu«.
4. Pokažemo pot opozorila za neprevzeto zdravilo: najprej opomnik pacientu, nato hčerki, šele nato sestri.

**Zgodba pacienta:** 78-letni gospod s srčnim popuščanjem, suha teža 72 kg. Od 3. do 5. dne po odpustu se mu teža dvigne na 74,5 kg, gležnji otečejo in enkrat izpusti diuretik. Hčerka, ki ima dostop kot zadolženka, vidi izpuščeno zdravilo. Ko ga obišče, z njim opravi pregled stanja in označi, da je vzel večerne tablete. Status postane rdeč z navedenimi razlogi, medicinska sestra ga pokliče in po telefonu prilagodi odmerek diuretika. Ponoven sprejem v bolnišnico je preprečen.

## Odprta vprašanja

- [ ] Najti slovenski podatek o ponovnih sprejemih ali stroških pri srčnem popuščanju (NIJZ, ZZZS)
- [ ] Preveriti mejne vrednosti opozoril z nekom z medicinskim znanjem (npr. 2 kg v 2 ali 3 dneh)
- [ ] Preveriti vse številke v izvirnih člankih, preden gredo na prosojnice
- [ ] Z Ixtlanom preveriti potek patronaže v praksi: ali in kdaj patronažna sestra pacienta po odpustu obišče (delovni nalog iz bolnišnice ali od osebnega zdravnika), ali se teren res dodeli po naslovu, ali bi aplikacijo namestila ob prvem obisku in ali bi ji seznam »kdo me potrebuje« prihranil delo (npr. namesto klicev vsem pacientom)
- [ ] Potrditi, po koliko dneh neprevzeto zdravilo sproži opozorilo (privzeto 2), z Ixtlanom ali nekom z medicinskim znanjem
- [ ] Izbrati vaje in videe za vseh šest skupin iz zanesljivih virov
- [x] Izbrati tehnološki sklad
- [x] Določiti, kako se zadolženec poveže z odpuščencem (prošnja z davčno številko, pacient potrdi)
- [x] Izbrati skupine bolnikov (šest, glavna je srčno popuščanje)
