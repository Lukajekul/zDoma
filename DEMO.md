# Predstavitev zDoma (3 minute, prosojnice)

Žive predstavitve ni: govorimo ob prosojnicah. Številke in viri: `docs/pitch.md`. Demo računi za žirijo, če želi aplikacijo preizkusiti sama: `docs/demo-accounts.md`.

## Priprava (pred nastopom)

- **8 prosojnic, ena misel na prosojnico.** Na prosojnici le naslov in ena slika ali številka. Vse ostalo povemo.
- **Zaslonske slike iz žive aplikacije** (seed podatki, širina telefona 390 px, v okvirju telefona). Seznam je pri vsaki prosojnici spodaj, pod »Slika«.
- **Na zadnji prosojnici koda QR** na [zdoma.tian-istenic34.workers.dev/demo](https://zdoma.tian-istenic34.workers.dev/demo), da žirija pregled preizkusi sama.
- **Govor ima okoli 310 besed**, to je dobri 2:30 v mirnem tempu, ostalo so premori ob menjavi prosojnic. Če zmanjka časa, glej spodaj.
- Rezerva: `docs/media/zdoma-v2.mp4` lahko brez zvoka teče na zadnji prosojnici.

## Potek

### 1. Problem (0:00–0:20)
- **Prosojnica:** velika številka **»1 od 5«**, pod njo »se v enem letu vrne v bolnišnico«. Spodaj drobno: »2.849–4.666 € na sprejem (ZZZS 2026)«, vir Omersa et al., NIJZ 2008–2012.
> »Vsak peti bolnik s srčnim popuščanjem se v enem letu vrne v slovensko bolnišnico zaradi srčnega popuščanja, vsak deseti že v 30 dneh. Vsak tak sprejem stane ZZZS do 4.666 evrov. Doma bolnik ostane sam: nihče ne opazi, da se mu teža dviga ali da zdravil ni prevzel.«

### 2. Rešitev v enem stavku (0:20–0:35)
- **Prosojnica:** logotip zDoma in stavek »Bolnik vsak dan 30 sekund odgovarja. Sestra vidi samo tiste, ki jo potrebujejo.« Pod njim štiri ikone z napisi: Bolnišnica · Pacient · Svojec · Patronažna sestra (+ Študent).
> »zDoma podaljša skrb bolnišnice do bolnikovega doma. Bolnik vsak dan pol minute odgovarja na vprašanja, sestra pa vidi samo tiste, ki jo res potrebujejo.«

### 3. Odpust v treh korakih (0:35–0:55)
- **Slika:** `/nurse/odpust` (korak s suho težo) in prijavni listek s kodo QR.
> »Ob odpustu bolničar izbere predlogo, na primer srčno popuščanje, vpiše davčno številko in suho težo. Vprašanja, zdravila iz eRecepta, datum konca in patronažna sestra po naslovu so že izpolnjeni. Bolnik dobi listek s kodo QR, ga skenira in si nastavi svoje geslo.«

### 4. Pacient: »Danes« (0:55–1:25)
- **Slika:** vprašanje o teži z gumbi okoli 72 kg, obroč napredka (»Dan 6 od 30«), majhen izrez zaslona »Pokličite 112«.
> »Domači zaslon ni meni, ampak naslednji korak za danes. Eno vprašanje na zaslon, veliki gumbi, vprašanja z njegovimi številkami: ›Ali tehtate več kot 72 kilogramov?‹ Obroč pokaže, koliko okrevanja je za njim. Ob bolečini v prsih aplikacija najprej reče: pokličite 112. Diagnoz ne postavlja in odmerkov ne spreminja.«

### 5. Aplikacija preganja pacienta, ne sestre (1:25–1:50)
- **Slika:** veriga s puščicami Pacient → Svojec → Sestra, ob njej »Skrbim za« z opozorilom »Zdravila niso prevzeta v lekarni«.
> »Če bolnik pregled zamudi ali zdravil ne prevzame v lekarni, opomnik najprej dobi on, nato svojec in šele nato sestra. Svojec vidi isti načrt kot bolnik in lahko zdravila označi skupaj z njim.«

### 6. Patronažna sestra (1:50–2:15)
- **Slika:** seznam sestre Mojce z rdečim Janezom Novakom, razlog »Teža +2,5 kg v 3 dneh«, gumb »Poklicano – vse v redu«.
> »Sestra vidi samo tiste, ki potrebujejo pozornost, in zakaj, z besedami: teža plus dva kilograma in pol v treh dneh. En dotik zapiše klic, Janez pa vidi: sestra Mojca vas bo poklicala.«

### 7. Študenti (2:15–2:35)
- **Slika:** zemljevid »Študenti« in Lukov zaslon »Danes po vrsti« z gumbom »Pot«.
> »Bolnikom brez svojcev pomagajo študenti medicine na praksi. Bolnik jih odobri, sestra jih razporedi na zemljevidu, študent pa dobi pot za današnje obiske. Dostop se konča s prakso.«

### 8. Zakaj bo delovalo (2:35–3:00)
- **Prosojnica:** »29 % manj sprejemov zaradi srčnega popuščanja« (Cochrane, Inglis 2015), »6 skupin bolnikov«, koda QR na `/demo`. Spodaj drobno: Next.js · Supabase · Cloudflare.
> »Spremljanje doma pri srčnem popuščanju po pregledu Cochrane pomeni 29 odstotkov manj sprejemov zaradi srčnega popuščanja. zDoma deluje že danes, za šest skupin bolnikov, in nova skupina je le nova predloga, brez nove kode. Preizkusite jo s kodo QR. zDoma: aplikacija preganja pacienta, zato sestra vidi samo tiste, ki jo potrebujejo.«

## Povejte pošteno (če žirija vpraša)
- Številke o sprejemih so samo zaradi srčnega popuščanja, nacionalni podatki 2008–2012.
- Cochrane: manj sprejemov zaradi srčnega popuščanja in manj smrti, ne manj sprejemov nasploh.
- Prototip: vprašanja in meje, ki jih specialist še ni potrdil, mora pred resno uporabo pregledati zdravnik. Vsi podatki so izmišljeni.

## Če zmanjka časa
1. Prosojnico 2 povej v enem stavku in pojdi naprej.
2. Študente (7) skrajšaj na en stavek: »Bolnikom brez svojcev pomagajo študenti medicine.«
3. Pri pacientu (4) izpusti obroč.
4. Problema (1) in zadnjega stavka (8) ne krajšaj.

Vadi s štoparico.
