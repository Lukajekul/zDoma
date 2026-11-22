# zDoma – pregled za ocenjevalce

zDoma spremlja bolnika doma po odpustu iz bolnišnice. Bolnik vsak dan pol minute odgovarja na kratka vprašanja in označi zdravila. Aplikacija najprej opomni bolnika in svojce, šele nato osebje. Sestra vidi samo bolnike, ki jo potrebujejo, in vedno ve, zakaj.

- **Aplikacija:** [zdoma.tian-istenic34.workers.dev](https://zdoma.tian-istenic34.workers.dev/)
- **Hiter preizkus brez gesla:** [/demo](https://zdoma.tian-istenic34.workers.dev/demo) → »Začni kot pacient«
- **Predstavitev (3 minute):** [DEMO.md](../DEMO.md)

Vsi ljudje, davčne številke in podatki so izmišljeni.

## 1. Prijava

**Geslo za vse račune: `zdoma2026`**

| Kdo | Kje se prijavi | Uporabniško ime |
|---|---|---|
| Pacient | Domača stran → »Sem pacient« ([/prijava/pacient](https://zdoma.tian-istenic34.workers.dev/prijava/pacient)) | davčna številka |
| Svojec | [/prijava](https://zdoma.tian-istenic34.workers.dev/prijava) → »Svojci« | davčna številka |
| Sestra, zdravnik, študent | [/prijava](https://zdoma.tian-istenic34.workers.dev/prijava) → »Osebje« | e-pošta |

### Računi, ki jih priporočamo

| Uporabniško ime | Kdo | Kaj boste videli |
|---|---|---|
| `mojca.kovac@zdoma.demo` | **Mojca Kovač**, patronažna sestra | Samo bolniki, ki potrebujejo pozornost, z razlogom (»Teža +2,5 kg v 3 dneh«). Zavihek »Študenti« z zemljevidom, gumb »Obisk« pri bolniku. |
| `tina.bizjak@zdoma.demo` | **Tina Bizjak**, bolnišnica | Vsi bolniki, »Nova rehabilitacija« (odpust v nekaj korakih), urejanje predlog. |
| `99000075` | **Janez Novak**, pacient, srčno popuščanje | Dnevni pregled se odpre sam. Teža se mu dviga, stanje je **Rdeče**. Domov se vrnete z »Nazaj«. |
| `99000580` | **Ana Novak**, Janezova hči | Zavihek »Skrbim za«: ali Janez jemlje zdravila in dela preglede. Lahko označi zdravila skupaj z njim. |
| `99000091` | **Stanko Zupančič**, pacient | Zdravila Lasix ni prevzel v lekarni. Vprašanja mu sestavi modularni pogon (§7). Na domačem zaslonu čaka prošnja študenta Luke (»Poglejte«). |
| `99000652` | **Vesna Zupančič**, Stankova hči | Opozorilo »Zdravila niso prevzeta v lekarni«. |
| `luka.kranjc@zdoma.demo` | **Luka Kranjc**, študent medicine | »Danes po vrsti«: obiski po urah, naslov, gumb »Pot« in zemljevid. |
| `99000083` | **Marija Kos**, pacientka | Dve rehabilitaciji: končana (kolk) in aktivna (po infarktu). |

Vse račune (15) in podrobnosti najdete v [demo-accounts.md](demo-accounts.md).

**Dobro je vedeti**
- Pri pacientih se ob prijavi najprej odpre današnji pregled. Vsi pregledi so odprti, ker podatki segajo do včeraj.
- Prijava s kodo QR: kot sestra odprite bolnika in pritisnite »Nova koda QR«. Ko bolnik kodo skenira, si mora nastaviti novo geslo, zato `zdoma2026` za tega bolnika potem ne deluje več.

## 2. Kako pregledati (okoli 15 minut)

Potek je enak kot v naši predstavitvi: od odpusta v bolnišnici do študenta na terenu. Potrebujete **računalnik** in **dva telefona** (namesto drugega telefona zadošča zasebno okno brskalnika). Geslo je povsod `zdoma2026`.

Za novega pacienta in svojca uporabite izmišljeni davčni številki **`99123401`** (pacient) in **`99123410`** (svojec). Če ju je nekdo že porabil, vzemite naslednji par: `99123428` in `99123436`, ali `99123444` in `99123452`.

### Korak 1 – Računalnik: bolnišnica odpusti pacienta
1. Prijavite se kot **Tina Bizjak** (`tina.bizjak@zdoma.demo`) in odprite **»Nova rehabilitacija«**.
2. Vpišite davčno številko `99123401`, nato ime, priimek in občino **Šentjur** (naselje in naslov po želji).
3. Izberite **Srčno popuščanje**. Vprašanja so že izbrana; vpišite suho težo, npr. `78`.
4. Pri zdravilih odkljukajte npr. Lasix in tapnite odmerek.
5. Pri »Načrt vprašanj« pritisnite **»Odobri načrt in naprej«**, pri vajah **»Naprej«**.
6. Aplikacija po občini sama predlaga patronažno sestro Mojco: **»Potrdi predlog«**, nato **»Odpri rehabilitacijo«**.
7. Pritisnite **»Natisni prijavni listek«**. Koda QR ostane odprta na zaslonu.

### Korak 2 – Telefon 1: pacient
1. S kamero telefona skenirajte kodo QR na zaslonu računalnika in odprite povezavo.
2. Nastavite svoje geslo (npr. `zdoma2026`). Listek od zdaj ne deluje več.
3. Odpre se dnevni pregled. Pri prvem vprašanju lahko tapnete **»Da«** in vidite zaslon **»Pokličite 112«**. Nič se še ne pošlje: tapnite »Nazaj – popravi odgovor« in opravite pregled do konca.
4. Z »Nazaj« pridete na zaslon »Danes«: krog napredka, zdravila (Novo / Spremenjeno) in vaje.

### Korak 3 – Telefon 2: svojec
1. Odprite [/prijava](https://zdoma.tian-istenic34.workers.dev/prijava) → **»Ustvarite račun«**. Vpišite ime, davčno številko `99123410` in geslo.
2. Pritisnite **»Zaprosi za dostop«**, vpišite pacientovo davčno številko `99123401` in izberite npr. »Hčerka«.
3. **Telefon 1:** na domačem zaslonu pacienta se pokaže prošnja. Tapnite **»Poglejte«** → **»Dovoli«**.
4. **Telefon 2:** pod »Skrbim za« je zdaj pacient. Odprite ga in označite tableto kot vzeto; pacient vidi, kdo jo je označil.

### Korak 4 – Računalnik: patronažna sestra
1. Pri Tini pritisnite »Odjava« in se prijavite kot **Mojca Kovač** (`mojca.kovac@zdoma.demo`).
2. Na seznamu so samo bolniki, ki potrebujejo pozornost, vsak z razlogom, npr. Janez Novak: »Teža +2,5 kg v 3 dneh«. Pritisnite »Odpri« in pri opozorilu tapnite **»Poklicano – vse v redu«**.
3. Vaš novi pacient je zelen, zato je skrit. Tapnite **»Zeleno«** in ga vidite med Mojčinimi pacienti, ker živi v Šentjurju.
4. Odprite **»Študenti«**, tapnite svojega pacienta in pri študentu Luki pritisnite **»Dodeli«**.
5. **Telefon 1:** pacient tapne **»Poglejte«** → **»Dovoli«**.

### Korak 5 – Računalnik: študent
1. Odjavite se in se prijavite kot **Luka Kranjc** (`luka.kranjc@zdoma.demo`).
2. **»Danes po vrsti«** pokaže današnje obiske po urah, z naslovom, gumbom **»Pot«** in zemljevidom. Vaš pacient je na seznamu.

Ta potek smo 22. 11. 2026 preizkusili na spletni strani od začetka do konca, nato smo podatke ponastavili.

> **Opomba o podatkih.** Po vsakem pregledu v bazi ostaneta testni pacient in svojec, ki ju je ustvaril ocenjevalec. Zato ima vsak naslednji ocenjevalec svoj par davčnih številk (zgoraj). Če želi ekipa bazo vrniti v začetno stanje, zažene `npm run seed`. Seed pobriše samo račune, označene kot seed ali demo, ne pa računov, ustvarjenih v čarovniku za odpust ali z registracijo svojca. Te mora najprej označiti kot seed (v Supabase pod *Authentication → Users* dodati `"seed": true` v `user_metadata`) in nato zagnati `npm run seed`.

## 3. Skupine uporabnikov

| V aplikaciji | Kdo je | Kaj dela |
|---|---|---|
| **Odpuščenec** | bolnik po odpustu | Vsak dan odgovori na vprašanja, označi zdravila in vaje. |
| **Zadolženec** (svojec) | družinski član, ki ga bolnik odobri | Spremlja bolnika, naloge lahko označi skupaj z njim. Načrta ne more spreminjati. |
| **Bolničar** | zdravnik ali sestra v bolnišnici, ali patronažna sestra | Odpre rehabilitacijo ob odpustu, odziva se na opozorila. |
| **Študent pomočnik** | študent medicine na praksi | Pomaga kot svojec (zdravila, tlak, teža, vaje), nikoli s sestrskim delom. Dostop se konča z zadnjim dnem prakse. |

- Svojec in pacient nista vrsti računa, ampak odnos. Ista oseba je lahko pacient in svojec nekoga drugega.
- **Bolničar** v bolnišnici in **patronažna sestra** imata različen vmesnik. Kdo je patronažna sestra, določi podatek (pokriva teren), ne posebna vloga.
- Vsak ima en stalen račun in ostane prijavljen na svojem telefonu.

**Prva prijava pacienta.** Ob odpustu dobi listek z veliko kodo QR. Skenira jo s kamero, je prijavljen in si takoj nastavi svoje geslo. Takrat listek preneha delovati. Koda je naključna (128 bitov) in je v delu povezave, ki ne pride do strežnika.

**Svojec** se registrira sam in pod »Zaprosi za dostop« vpiše bolnikovo davčno številko. Odgovor je vedno »Prošnja poslana«, tudi če številka ne obstaja, da nihče ne more ugotoviti, kdo uporablja zDoma. Dostop začne veljati, ko ga bolnik dovoli.

## 4. Kaj rešujemo

Po odpustu je bolnik doma skoraj brez nadzora. Zaplet, kot je poslabšanje srčnega popuščanja ali zdravilo, ki ga ni prevzel v lekarni, se pogosto opazi šele na urgenci.

- V Sloveniji se v 30 dneh zaradi srčnega popuščanja vrne v bolnišnico **vsak deseti** bolnik, v enem letu **vsak peti** (nacionalni podatki NIJZ 2008–2012).
- En tak sprejem stane ZZZS **od 2.849 do 4.666 €**.
- Spremljanje doma pri srčnem popuščanju zmanjša sprejeme zaradi srčnega popuščanja za **29 %** in smrtnost za 20 % (pregled Cochrane, 41 raziskav).

Viri: [pitch.md](pitch.md).

## 5. Cilji

1. **Za 80-letnika.** Velike črke, veliki gumbi, eno vprašanje na zaslon, brez tipkanja.
2. **Čim manj dela za vse.** Kar lahko naredi aplikacija, naredi sama.
3. **Bolnik vsak dan opravi pregled in vzame zdravila.** Zato pomagajo svojci, študenti in patronažne sestre.
4. **Varnost.** Pri nujnih znakih najprej »Pokličite 112«. Aplikacija ne postavlja diagnoz in ne spreminja odmerkov, pove samo, koga poklicati.

## 6. Dnevni pregled

- **En dotik na odgovor.** Samo veliki gumbi, brez tipkanja in drsnikov.
- **Največ 6 vprašanj na dan, eno na zaslon.** Traja okoli 30 sekund.
- **Bolnikove številke.** »Ali tehtate več kot 72 kg?« namesto »Kakšna je vaša teža?«. Teža so gumbi okoli zadnje teže, po 0,5 kg.
- **Beseda ob barvi.** Pri vsakem odgovoru puščica in beseda »boljše«, »enako« ali »slabše«. Nikoli samo barva.
- **Vsako vprašanje vsak dan.** Gumba »Enako kot včeraj« ni, ker bi en dotik odgovoril na vse. Preskočeno vprašanje sestra vidi kot opozorilo, ne kot »vse v redu«.
- **Nujni znaki.** Bolečina v prsih, nenadno hudo težko dihanje, omedlevica ali znaki kapi takoj odprejo celozaslonski »Pokličite 112«, še preden se karkoli shrani. Pri raku vročina 38 °C ali več pokaže telefon oddelka.
- Besedilo vsaj 18 px, gumbi vsaj 48 px, visok kontrast, slovenski zapis (`74,5 kg`, `21. 11. 2026`).

## 7. Zakaj so vprašanja točna

**Vprašanja ne izmišljujemo in jih ne piše umetna inteligenca.** Vsako vprašanje in vsaka meja izhaja iz smernice evropskega strokovnega združenja za to bolezen. Ob vsakem vprašanju je zapisan vir in stavek iz smernice.

Enotnega evropskega standarda za vprašanja, ki jih bolnik rešuje doma, ni (ne v zakonodaji EU, ne pri CEN ali EMA). Zato uporabimo tisto, po čemer delajo evropski zdravniki: smernice strokovnih združenj.

| Predloga | Smernica | Primer pravila |
|---|---|---|
| Srčno popuščanje | ESC in njeno združenje za srčno popuščanje (HFA), 2021 | Teža več kot +2 kg v 3 dneh → opozorilo |
| Po infarktu ali operaciji srca | ESC 2023 (akutni koronarni sindrom), EAPC 2021 (srčna rehabilitacija), ECDC (okužba rane) | Bolečina v prsih → 112. Izpuščeno zdravilo proti strjevanju krvi → opozorilo |
| Nov kolk ali koleno | ECDC in WHO (okužba rane), ESA (krvni strdki) | Rdeča, topla rana ali rana, ki se cedi, vročina, otekel en meč → opozorilo |
| KOPB | GOLD 2023, objavljeno pri ERS | Poslabšanje = več težke sape, kašlja ali izmečka v manj kot 14 dneh |
| Možganska kap | ESO 2022, Akcijski načrt za kap v Evropi (SAP-E) | Nov povešen obraz, šibka roka ali težave z govorom → 112 |
| Rak na sistemskem zdravljenju | ESMO 2022 (simptomi, ki jih poroča bolnik), ESMO 2016 (vročina) | Vročina 38 °C ali več → takoj pokličite oddelek |

- **ECDC** je agencija EU in enako opredeli okužbo rane za vse evropske bolnišnice. **GOLD** je svetovno poročilo, ki ga evropski pulmologi uporabljajo prek ERS.
- **Kar še ni preverjeno, je označeno.** V virih z ⚠️, v kodi s `potrjeno: false`. Pred resno uporabo te vrednosti potrdi zdravnik.
- **Brez umetne inteligence.** Zato je vsako opozorilo razložljivo: sestra vidi pravilo in vir.

Vsa vprašanja z viri: [checkin-questions.md](checkin-questions.md).

### Kako se vprašanja sestavijo

Imamo **banko vprašanj**, ki jih je enkrat napisal ali odobril klinik, razdeljeno v **module**. Moduli se vklopijo sami iz podatkov ob odpustu, po mednarodnih šifrah:

| Modul | Vklopi ga |
|---|---|
| nujni znaki | vsak bolnik |
| srčno popuščanje | diagnoza ICD-10 `I50` |
| pljučnica | ICD-10 `J12`–`J18` |
| endoproteza kolena | poseg |
| zdravilo proti strjevanju krvi, za vodo, antibiotik | šifra zdravila ATC |

1. Moduli se združijo. Če dva sprašujeta isto, ostane eno vprašanje s strožjim pravilom.
2. Zdravnik načrt pregleda, po potrebi odstrani vprašanja in ga odobri. Odobren načrt se ne spreminja več.
3. Vsak dan pogon izbere vprašanja: nujni znaki vedno prvi, ostala do 6 zaslonov. Vprašanje, ki je sprožilo opozorilo, se 3 dni sprašuje vsak dan. Stabilno vprašanje se po 5 dneh sprašuje vsak drugi dan.
4. Dodatno vprašanje se pokaže takoj za odgovorom, ki ga sproži (kot `enableWhen` v standardu FHIR).

Podrobno: [modular-questionnaire.md](modular-questionnaire.md). Za bolezni brez modula je **šest predlog** (tabela zgoraj). Predloga je samo podatkovna datoteka, zato nova bolezen ne potrebuje nove kode ali zaslona.

## 8. Zdravila

**Za zdravnika: izbira namesto vnosa.**
- Predloga našteje zdravila, ki jih smernica običajno priporoča, vsako z 2–4 običajnimi odmerki. Odmerki so iz uradnih navodil (SmPC) pri EMA in CBZ: [medicines.md](medicines.md).
- Zdravila, ki jih bolnik že jemlje, so že izpolnjena (eRecept, na hekatonu simuliran).
- Zdravnik odkljuka zdravilo in tapne odmerek, npr. »Furosemid 40 mg, zjutraj«. »Dodaj zdravilo« išče med 2836 zdravili iz seznama EMA.
- Bolnik možnih odmerkov nikoli ne vidi.

**Za bolnika.**
- Ob prvi prijavi vidi spremembe: **Novo**, **Spremenjeno**, **Ukinjeno – tega ne jemljite več**, s sliko škatlice in razlago, čemu zdravilo služi.
- Urnik po delih dneva z gumbom »Vzeto« in možnostjo razveljavitve.
- **Prevzem v lekarni.** Neprevzeto zdravilo najprej opomni bolnika, nato svojca, nato sestro z razlogom (»Lasix ni prevzet 4 dni po odpustu«).
- **Zaloga.** Pakiranje deljeno z dnevnim odmerkom pove, koliko dni je še ostalo. Nekaj dni prej: »Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept.«

## 9. Da bolnik vztraja

Raziskave kažejo, da je spremljanje doma propadlo, ko so bolniki nehali sodelovati, in da korist izgine, ko spremljanje preneha. Zato:

- **Zaslon »Danes« namesto menija.** Samo naslednje opravilo: tehtnica → pregled → tablete → vaja → »Končano za danes ✓«.
- **Dnevni opomnik, ki ga ni mogoče izklopiti** (privzeto ob 8:00). Bolnik lahko spremeni samo uro. Brez diagnoze in imen zdravil v besedilu.
- **Aplikacija lovi bolnika, ne sestre.** 1 dan brez pregleda → bolnik, 2 dni → svojec, 3 dni → osebje.
- **Krog napredka** za celo rehabilitacijo. Zeleno opravljeno, rdeče zamujeno, sivo prihodnje, pod njim z besedami: »Opravljeno 18 dni · Izpuščeno 2 dni · Še 10 dni«. Brez točk in značk.
- **Vsak dan nekaj nazaj:** »72,4 kg – blizu vaše ciljne teže ✓«, »Dan 6 od 30«.
- **Za vsem je človek:** »Sestra Mojca vas bo poklicala danes do 12:00«.

Več: [research.md](research.md), razdelek *What failed before*.

## 10. Svojci (»Skrbim za«)

- Vidijo, ali bolnik sledi načrtu: tablete, vaje, pregledi, stanje, neprevzeta zdravila.
- Ko nalogo opravijo skupaj z bolnikom, jo označijo. Vsak vnos pove, kdo ga je vpisal: »Označila: Ana (hčerka)«.
- Lahko sporočijo, kaj so opazili (»Bolj zmeden«, »Padel je«). Resna opažanja ustvarijo opozorilo za sestro.
- Bolnik dostop kadarkoli odvzame.

## 11. Študent pomočnik

- Študenta bolniku dodeli sestra, bolnik ga mora odobriti.
- Sestra v zavihku »Študenti« vidi bolnike brez pomoči na zemljevidu, razvrščene po potrebi po pomoči. En dotik predlaga študenta z istega območja (največ 3 bolniki na študenta).
- Študent vidi današnje obiske po vrsti, z naslovom, gumbom »Pot« in zemljevidom. Pri rumenem ali rdečem stanju ga aplikacija napoti k sestri.
- Vnosi so označeni z »(študent)«.

## 12. Osebje

**Odpust v nekaj korakih.** Bolnik (davčna številka), predloga, bolnikove vrednosti (npr. suha teža), potrditev. Vprašanja, zdravila, vaje, datum konca in patronažna sestra so že izpolnjeni. Na koncu se natisne listek s kodo QR. Kasneje: »Podaljšaj«, »Nova koda QR«, kontrolni pregled.

**Nadzorna plošča.**
- Samo bolniki, ki potrebujejo ukrepanje. Zeleni so skriti.
- Posodablja se sproti.
- Vsako opozorilo ima razlog: »Teža +2,5 kg v 3 dneh«, »Izpuščen diuretik«.
- Ukrepi so en dotik (»Poklicano – vse v redu«, »Naročen pregled«) in se sami zapišejo v revizijsko sled.

**Patronažne sestre** (vmesnik za telefon).
- Bolnike dobijo samodejno po naslovu (občina). Brez ujemanja gre bolnik med »Nedodeljene«, kjer ga kdorkoli »Prevzame«.
- »Moji pacienti« z velikimi filtri, »Danes obiščite«, »Nadomeščanje« med odsotnostjo.
- »Obisk«: ko bolnik ne zmore sam, sestra opravi pregled z njim na istih zaslonih.

## 13. Varnost in zasebnost

- Vrstična varnost na vsaki tabeli: bolnik vidi svoje podatke, svojec in študent samo odobrene bolnike, osebje vse.
- Davčna številka sama nikoli ne prijavi nikogar. Preveri se tudi kontrolna števka.
- Obvestila zunaj aplikacije nimajo diagnoze ali imen zdravil.
- Pomembna dejanja se zapišejo v revizijsko sled.
- zDoma je podpora odločanju, ne diagnoza in ne nujna služba.

## 14. Raziskave in viri

| Dokument | Kaj vsebuje |
|---|---|
| [research.md](research.md) | Katere skupine bolnikov in zakaj: pogostost ponovnih sprejemov, dokazi, da spremljanje pomaga (Cochrane, TIM-HF2, Basch), kaj je v preteklosti spodletelo. |
| [checkin-questions.md](checkin-questions.md) | Vsa vprašanja za šest predlog, z evropsko smernico in citatom. |
| [modular-questionnaire.md](modular-questionnaire.md) | Banka vprašanj, moduli in dnevna izbira. |
| [medicines.md](medicines.md) | Zdravila po predlogah, običajni odmerki in vir (EMA, CBZ). |
| [rehab-content.md](rehab-content.md) | Vaje za okrevanje doma z viri in slikami. |
| [pitch.md](pitch.md) | Preverjene številke za Slovenijo in stroški ZZZS. |

## 15. Tehnologija

Next.js 16 in TypeScript, Tailwind CSS, Supabase (prijava, Postgres z vrstično varnostjo, sprotne posodobitve, shramba slik), Cloudflare Workers. Opomniki so spletna potisna obvestila, ki jih vsakih 15 minut sproži cron. Aplikacijo se da namestiti na začetni zaslon telefona.

Triaža (`src/lib/triage/`) in pogon vprašanj (`src/lib/moduli/`) sta čisti funkciji brez dostopa do baze, pokriti s testi, prav tako kontrolna števka davčne številke in zaloga zdravil.

## 16. Kaj še ni narejeno

- Vrednosti s `potrjeno: false` mora pred resno uporabo potrditi zdravnik.
- eRecept je simuliran. V praksi bi podatki prišli prek CEZIH.
- Opomniki po e-pošti in SMS ter obvestila za svojce so načrtovani.
- Validirani vprašalniki (npr. EQ-5D-5L) so pripravljeni, a se ne sprašujejo, dokler licenca ni urejena.
