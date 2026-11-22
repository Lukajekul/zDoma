# zDoma – pregled za ocenjevalce

Ta dokument na enem mestu povzame, kaj zDoma zna in zakaj smo ga naredili tako. Namenjen je ocenjevalcem, ki bodo projekt podrobneje pregledali. Vsi podatki v aplikaciji so izmišljeni.

- **Aplikacija v živo:** [zdoma.tian-istenic34.workers.dev](https://zdoma.tian-istenic34.workers.dev/) (hiter preizkus kot pacient: [/demo](https://zdoma.tian-istenic34.workers.dev/demo))
- **Demo računi** za sestro, svojca in študenta: [demo-accounts.md](demo-accounts.md)
- **Potek 3-minutne predstavitve:** [DEMO.md](../DEMO.md)

## 1. Kaj rešujemo

Ko gre bolnik iz bolnišnice domov, ga v prvih tednih skoraj nihče ne spremlja. Zapleti, kot je poslabšanje srčnega popuščanja ali zdravilo, ki ga ni prevzel v lekarni, se pogosto opazijo šele, ko je spet na urgenci. Pri srčnem popuščanju se v Sloveniji v 30 dneh vrne 9,4 % bolnikov, ena hospitalizacija pa stane ZZZS od 2.849 do 4.666 € (viri v [pitch.md](pitch.md)).

zDoma bolnika spremlja doma: vsak dan odgovori na nekaj kratkih vprašanj in označi zdravila. Aplikacija najprej opomni bolnika in svojce, šele nato osebje. Sestra vidi samo tiste bolnike, ki res potrebujejo pozornost, in vedno ve, zakaj.

## 2. Naši glavni cilji

1. **Prijazno starejšim.** Vse mora znati uporabljati 80-letnik, ki slabo vidi in redko uporablja pametni telefon.
2. **Čim manj dela za vse.** Za osebje, za bolnika in za svojce. Kar lahko naredi aplikacija sama, naredi sama.
3. **Bolnik mora vsak dan narediti pregled in vzeti zdravila.** To je bistvo, zato smo dodali svojce, študente in patronažne sestre, ki pomagajo, kadar bolnik sam ne zmore.
4. **Varnost.** Pri nujnih znakih vedno najprej »Pokličite 112«. Aplikacija ne postavlja diagnoz in ne spreminja odmerkov, samo pove, koga poklicati.

## 3. Kdo uporablja zDoma

| Uporabnik | Kdo je | Kako se prijavi |
|---|---|---|
| **Odpuščenec** | bolnik po odpustu | prvič s kodo QR na prijavnem listku, nato z davčno številko in svojim geslom |
| **Zadolženec (svojec)** | družinski član, ki ga bolnik odobri | davčna številka + geslo, registrira se sam |
| **Bolničar** | zdravnik ali sestra v bolnišnici, ali patronažna sestra | službena e-pošta + geslo |
| **Študent pomočnik** | študent medicine na praksi | e-pošta + geslo, dostop poteče z zadnjim dnem prakse |

Ena oseba je lahko hkrati bolnik in svojec nekoga drugega. Vsak ima en stalen račun in ostane prijavljen na svojem telefonu, tako da se večina ljudi prijavi samo enkrat.

**Prijava bolnika s kodo QR.** Ob odpustu bolničar natisne prijavni listek z imenom in veliko kodo QR. Bolnik (ali patronažna sestra ob prvem obisku) jo skenira s kamero in je takoj prijavljen, nato si nastavi svoje geslo. Takrat listek preneha delovati. Žeton v kodi QR je naključen (128 bitov) in je v delu URL-ja, ki ne pride do strežnika. Izgubljen listek ali pozabljeno geslo: »Nova koda QR«, ki odjavi vse naprave.

## 4. Dnevni pregled (vprašalnik)

To je bil naš glavni fokus. Vprašalnik smo naredili čim bolj preprost za starejše in hkrati prilagojen vsakemu bolniku posebej.

### Prijazno starejšim
- **En dotik na odgovor.** Samo veliki gumbi, brez tipkanja in drsnikov.
- **Največ 6 vprašanj na dan, eno na zaslon.** Pregled traja okoli 30 sekund.
- **Teža** je vrsta gumbov okoli bolnikove zadnje teže (po 0,5 kg), »Drugo« odpre polje za število.
- **Puščica in beseda pri vsakem odgovoru:** modro »boljše«, rdeče »slabše« ali »enako« glede na včeraj. Nikoli samo barva.
- **Gumbi za izhod na vsakem vprašanju:** »Nujna pomoč« (vedno vidno, odpre 112), »Sporoči drugo težavo« in »Preskoči«, kjer je to varno. Preskočeno vprašanje osebje vidi kot opozorilo, nikoli kot »vse v redu«.
- **Odstranili smo »Enako kot včeraj«.** Prej je en dotik odgovoril na vsa vprašanja, kar je bilo prehitro in nevarno. Zdaj je vsako vprašanje vsak dan odgovorjeno ali izrecno preskočeno.
- Velike črke (vsaj 18 px), gumbi vsaj 48 px, visok kontrast, pisava Atkinson Hyperlegible, slovenski formati (`74,5 kg`, `21. 11. 2026`).

### Prilagojeno bolniku
Vprašanja uporabljajo bolnikove lastne vrednosti in imena njegovih zdravil, npr. »Ali tehtate več kot 72 kg?« namesto »Kakšna je vaša teža?«. Če seznam zdravil že pove, ali je bolnik vzel zdravilo, ga o tem ne sprašujemo še enkrat.

### Od kod vprašanja
Enotnega EU-standarda za vprašanja, ki jih bolnik rešuje doma, ni. Zato vsako vprašanje in mejna vrednost izhaja iz smernic evropskega strokovnega društva za to bolezen: ESC in HFA (srce), EAPC (srčna rehabilitacija), ESO (možganska kap), ESMO (rak), ECDC (okužba rane) in GOLD (KOPB). Primer: »teža več kot +2 kg v 3 dneh« je pravilo iz smernic HFA/ESC. Vsako vprašanje ima zapisan vir v [checkin-questions.md](checkin-questions.md). Vrednosti, ki jih mora še potrditi zdravnik, so v kodi označene s `potrjeno: false`.

### Pogon vprašanj (modularni vprašalnik)
Vprašanj ne pišemo na roko za vsakega bolnika in jih tudi ne generira umetna inteligenca. Imamo **banko vprašanj**, ki jih je enkrat napisal ali odobril klinik, razdeljeno v **module**. Moduli se vklopijo sami glede na podatke ob odpustu:

| Modul | Vklopi ga |
|---|---|
| jedro (nujni znaki) | vsak bolnik |
| srčno popuščanje | diagnoza ICD-10 `I50` |
| pljučnica | ICD-10 `J12`–`J18` |
| endoproteza kolena | poseg |
| antikoagulant, diuretik, antibiotik | koda zdravila ATC |

Pogon nato:
1. **Združi module** in odstrani podvojena vprašanja (če dva modula sprašujeta isto, ostane strožje pravilo).
2. Zdravnik načrt **pregleda, po potrebi odstrani vprašanja in ga odobri**. Odobreni načrt se zamrzne, kasnejše spremembe banke ga ne spremenijo.
3. **Vsak dan izbere današnja vprašanja**: nujni znaki vedno prvi in se nikoli ne izpustijo, ostala se razvrstijo v proračun 6 zaslonov. Vprašanje, ki je sprožilo opozorilo, se 3 dni sprašuje vsak dan; stabilno vprašanje se po 5 dneh sprašuje vsak drugi dan.
4. **Dodatno vprašanje** se pokaže takoj za odgovorom, ki ga zahteva (kot `enableWhen` v FHIR).

Za bolezni, ki še nimajo modula, uporabljamo **šest predlog**: srčno popuščanje (glavna), po infarktu ali operaciji srca, nov kolk ali koleno, KOPB, možganska kap in rak na sistemskem zdravljenju. Predloga je samo podatkovna datoteka (vprašanja, pravila, zdravila, vaje), zato nova bolezen ne potrebuje nove kode ali zaslona. Zdravniki lahko dodajo tudi svoja vprašanja in vaje, za vse bolnike neke predloge ali samo za enega.

### Nujni primeri
Bolečina v prsih, nenadno hudo težko dihanje, omedlevica ali znaki kapi takoj pokažejo celozaslonski »Pokličite 112«, še preden se karkoli shrani. Pri raku vročina 38 °C ali več pokaže telefon oddelka.

## 5. Zdravila

### Za zdravnika: priporočila namesto ročnega vnosa
Da zdravniku ni treba vsega vnašati ročno, so zdravila ob odpustu **predlog**:
- Predloga našteje zdravila, ki jih smernice običajno priporočajo (npr. pri srčnem popuščanju diuretik, zaviralec ACE, beta blokator …), vsako z 2–4 običajnimi odmerki iz virov v [medicines.md](medicines.md).
- Seznam je že dopolnjen z zdravili, ki jih bolnik jemlje (eRecept, na hekatonu simuliran).
- Zdravnik odkljuka zdravilo in tapne odmerek, npr. »Furosemid 40 mg, zjutraj«. »Uredi« spremeni odmerek ali čas, »Dodaj zdravilo« išče po seznamu 2836 zdravil iz EMA (s tipkovnico).
- Bolnik možnih odmerkov nikoli ne vidi, to so predlogi samo za osebje.

### Za bolnika
- **Spremembe najprej:** ob prvi prijavi bolnik vidi zdravila razdeljena na **Novo**, **Spremenjeno** in **Ukinjeno – tega ne jemljite več**, s sliko škatlice in preprosto razlago, čemu zdravilo služi.
- **Urnik po delih dneva** z velikim gumbom »Vzeto« in možnostjo razveljavitve.
- **Prevzem v lekarni:** če zdravilo ni prevzeto, aplikacija najprej opomni bolnika, nato svojca, šele nato osebje z razlogom (»Furosemid ni prevzet 4 dni po odpustu«).
- **Zaloga:** iz velikosti pakiranja in dnevnega odmerka izračunamo, koliko dni je še ostalo. Nekaj dni prej: »Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept.«
- Izpuščene odmerke vsak dan samodejno zabeleži strežnik, tudi če bolnik aplikacije sploh ne odpre.

## 6. Da bolnik res vsak dan opravi pregled in vzame zdravila

To je bil drugi najpomembnejši cilj. Rešili smo ga z več plastmi:

- **Zaslon »Danes« namesto menija.** Bolnik vidi samo naslednje opravilo: tehtnica → pregled → tablete → vaja → »Končano za danes ✓«. Ob odprtju aplikacije se nedokončan pregled odpre sam.
- **Dnevni opomnik**, ki ga ni mogoče izklopiti (spletno potisno obvestilo, privzeto ob 8:00). Bolnik lahko spremeni samo uro. Besedilo nima diagnoze ali imen zdravil.
- **Stopnjevanje, ko pregled manjka:** 1 dan → ponoven opomnik bolniku, 2 dni → svojec, 3 dni ali več → osebje. Aplikacija lovi bolnika, ne sestre.
- **Krog napredka** za celo rehabilitacijo: zeleni deli so odgovorjena vprašanja, rdeči zamujeni dnevi (ki ne postanejo zeleni), sivi prihodnji. Pod njim vedno z besedami: »Opravljeno 18 dni · Izpuščeno 2 dni · Še 10 dni«. Brez točk in značk.
- **Nekaj nazaj vsak dan:** po pregledu bolnik vidi svoje številke (»72,4 kg – blizu vaše ciljne teže ✓«, »Dan 6 od 30«).
- **Za vsem je človek:** ko sestra ukrepa, bolnik vidi njeno ime (»Sestra Mojca vas bo poklicala danes do 12:00«).
- **Svojci, študenti in patronažne sestre** pomagajo, kadar bolnik sam ne zmore (spodaj).

## 7. Svojci (»Skrbim za«)

- Svojec vpiše bolnikovo davčno številko pod »Zaprosi za dostop«. Odgovor je vedno »Prošnja poslana«, tudi če številka ne obstaja, da nihče ne more ugotoviti, kdo uporablja zDoma.
- Bolnik prošnjo **dovoli ali zavrne** in lahko dostop kadarkoli odvzame.
- Na zavihku »Skrbim za« svojec vidi, ali bolnik sledi načrtu: tablete, vaje, pregledi, stanje in opozorilo, če zdravila niso prevzeta v lekarni.
- Ko naloge opravi **skupaj z bolnikom**, jih lahko označi (»Vzeto«, »Opravljeno«, pregled). Vsak vnos pokaže, kdo ga je vpisal: »Označila: Ana (hčerka)«.
- **Opažanja svojcev:** svojec lahko sporoči, kaj je opazil (npr. »Bolj zmeden/a«, »Padel/a je«). Resna opažanja ustvarijo opozorilo za sestro.
- Načrta, zdravil ali datuma konca ne more spreminjati.

## 8. Študent pomočnik

Študenti medicine na praksi pomagajo bolnikom z enakimi nalogami kot svojci: opomnijo na tablete, izmerijo tlak in težo, pogledajo vaje. Nikoli ne opravljajo sestrskega dela.
- Študenta bolniku dodeli osebje, bolnik pa ga mora odobriti.
- Študent ima svoj seznam bolnikov; vnosi so označeni z »(študent)«.
- Pri rumenem ali rdečem stanju študent vidi opozorilo, naj pokliče sestro.
- 30 minut pred obiskom dobi opomnik; če zamudi, sta obveščena on in sestra.
- **»Danes po vrsti«:** na začetni strani vidi vse današnje obiske po uri, z naslovom, oznako »zamuja« in gumbom **»Pot«**, ki odpre navigacijo v telefonu. Ob seznamu je zemljevid z oštevilčenimi oznakami v vrstnem redu obiskov.
- Dostop se samodejno konča z zadnjim dnem prakse.

## 9. Osebje: čim manj dela

### Bolnišnica: odpust v nekaj korakih
Odpiranje rehabilitacije je čarovnik: bolnik (davčna številka), predloga, bolnikove vrednosti in vprašanja, zdravila, vaje in datum konca, patronažna sestra, potrditev. Skoraj vse je že izpolnjeno, spremembe so izbirne. Aplikacija vpraša samo za vrednosti, ki jih izbrana vprašanja res uporabljajo (npr. suho težo samo, če se teža sprašuje). Na koncu se natisne prijavni listek.

Kasneje: »Podaljšaj« ali »Skrajšaj« za N dni, »Nova koda QR«, kontrolni pregled (datum, ura, kraj), urejevalnik predlog z zgodovino sprememb.

### Nadzorna plošča
- Prikaže **samo bolnike, ki potrebujejo ukrepanje**. Zeleni so privzeto skriti.
- Posodablja se sproti (Supabase Realtime).
- **Vsako opozorilo ima razlog**, ki ga sestra prebere v trenutku: »Teža +2,5 kg v 3 dneh«, »Izpuščen diuretik«, »Brez merilnika tlaka«. Pri načrtih iz modularnega vprašalnika še »Zakaj opozorilo?« z modulom in virom pravila.
- Ukrepi so en dotik (»Poklicano – vse v redu«, »Naročen pregled«, »Obveščen osebni zdravnik«) in se sami zapišejo v revizijsko sled.
- Podrobnosti bolnika: grafi trendov, fotografije rane drugo ob drugi, tedenski povzetek, sodelovanje v %.

### Patronažne sestre
Ali je nekdo patronažna sestra, določijo podatki (ima teren), ne posebna vloga. Patronažna sestra dobi drugačen vmesnik, prilagojen telefonu:
- **Bolniki se dodelijo sami po naslovu.** Ob odpustu aplikacija predlaga sestro, ki pokriva bolnikovo občino; če je ni, gre bolnik med »Nedodeljene«, kjer ga lahko kdorkoli »Prevzame«.
- **»Moji pacienti«** z velikimi filtri: iskanje, stanje, občina, predloga, brez pregleda danes, zdravila niso prevzeta. Filtri ostanejo v URL-ju.
- **»Danes obiščite«**: bolniki po stanju in občini.
- **»Prvi obisk«**: seznam za prvi obisk doma (skeniranje listka, dodajanje na začetni zaslon, dovoljenje za obvestila, prvi pregled skupaj).
- **»Obisk«**: kadar bolnik ne zmore sam, sestra opravi pregled, tablete in vaje z njim na istih zaslonih; vnosi so označeni z njenim imenom.
- **»Nadomeščanje«**: med odsotnostjo preda bolnike kolegici do določenega datuma, potem se vrnejo sami.
- **»Študenti«**: bolniki brez študenta, razvrščeni po potrebi po pomoči (brez pregleda, zdravila niso prevzeta, nima svojcev v aplikaciji), ne po resnosti bolezni. Rdeči gredo najprej k sestri. Ob tapu trije predlagani študenti (isto območje, največ 3 bolniki na študenta), en dotik »Dodeli«, bolnik potrdi. »Predlagaj razporeditev« predlaga vse pare naenkrat. Na tablici in računalniku je ob seznamu zemljevid, na telefonu preklop »Seznam / Zemljevid«. Oznake imajo obliko in besedo, ne le barve; zaenkrat stojijo v središču občine.

## 10. Varnost in zasebnost

- Vrstična varnost (RLS) na vsaki tabeli: bolnik vidi samo svoje podatke, svojec in študent samo odobrene bolnike, osebje vse.
- Davčna številka sama nikoli ne prijavi nikogar; preveri se tudi kontrolna števka.
- Pomembna dejanja (podaljšanje, nova koda QR, prevzem bolnika, ukrepi) se zapišejo v revizijsko sled.
- Obvestila, ki zapustijo aplikacijo, nimajo diagnoze ali imen zdravil.
- **Brez umetne inteligence.** Vprašanja, pravila in povzetki so iz predlog in podatkov, zato je vsako opozorilo razložljivo.
- Aplikacija je podpora odločanju, ne diagnoza in ne nujna služba.

## 11. Tehnologija

Next.js 16 (App Router) in TypeScript, Tailwind CSS in shadcn/ui, Supabase (Auth, Postgres z RLS, Realtime, Storage), Cloudflare Workers. Opomniki: cron vsakih 15 minut pošlje spletna potisna obvestila. Aplikacijo se da namestiti na začetni zaslon (PWA) in ima stran »Ni povezave«.

Triaža (`src/lib/triage/`) in pogon vprašanj (`src/lib/moduli/`) sta čisti funkciji brez I/O, pokriti s testi Vitest, prav tako kontrolna števka davčne številke in izračun zaloge zdravil.

## 12. Kaj še ni narejeno

- Vrednosti z oznako `potrjeno: false` mora pred resno uporabo potrditi zdravnik.
- eRecept je simuliran; v produkciji bi podatki prišli prek CEZIH.
- Opomniki po e-pošti in SMS ter obvestila za svojce so načrtovani, a še niso narejeni.
- Validirani vprašalniki (npr. EQ-5D-5L) so pripravljeni, a se ne sprašujejo, dokler licenca ni urejena.
