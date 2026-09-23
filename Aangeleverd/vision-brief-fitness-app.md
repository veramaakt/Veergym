# Vision brief: persoonlijke fitness-app

> Concept v0.2. Bedoeld als startdocument voor Claude Code. Open vragen staan onderaan en moeten voor of tijdens de eerste bouwsessie beantwoord worden.

## 1. Waarom deze app

Ik train 3x per week (full-body, Basic Fit) en log nu in Hevy. Hevy werkt goed voor het loggen zelf, maar de gratis versie beperkt me:

- Ik kan maar 4 schema's opslaan en moet steeds een oude verwijderen.
- Ik kan niet verder dan een beperkte periode terugkijken, dus mijn voortgang vanaf de start blijft buiten beeld.
- Het sociale deel gebruik ik niet en is ruis.
- Gewicht/afmetingen en eten zitten er niet (goed) bij, dus die staan nu in losse plekken (o.a. een Google Sheet).

**Visie:** één rustige, snelle app voor mij alleen, waarin training, lichaamsmetingen en voeding samenkomen, zonder limieten, zonder abonnement en zonder social.

## 2. Gebruiker

Eén persoon (ik). Vrouw, 28, body recomposition (spier opbouwen, vet omlaag). Ik train met machines en kabels bij Basic Fit, vaak met één hand op mijn telefoon tussen sets. Ik ben geen developer: de app moet eenvoudig te onderhouden en uit te breiden zijn, en mijn data moet altijd van mij blijven.

**Apparaten:** Android-telefoon (hoofdgebruik, tijdens het trainen), desktop (analyse, invullen en beheer) en een Samsung Galaxy Watch 7 (bron van slaap-, stappen- en trainingsdata).

## 3. Ontwerpprincipes

1. **Snel loggen boven alles.** Tussen twee sets wil ik in een paar taps klaar zijn. Vorige sessie (gewicht x reps) staat naast het invoerveld.
2. **Werkt zonder bereik.** Sportscholen hebben soms slecht bereik. Loggen moet offline werken.
3. **Mijn data, mijn bezit.** Alles is te exporteren (CSV/JSON) en te importeren. Geen lock-in.
4. **Geen limieten.** Onbeperkt schema's, onbeperkte historie.
5. **Overzicht zonder zoeken.** Voortgang zie ik op één plek, niet per workout-type.
6. **Rustig en minimaal.** Geen social, geen gamification-ruis, geen reclame.
7. **Mobiel eerst, desktop volwaardig.** Loggen doe ik op mijn telefoon. Op desktop kan ik alles bekijken en beheren, en mijn data staat op beide apparaten.

### Design richting (al bepaald)
- **Vormgeving:** vlakke, effen kleurvlakken (geen verlopen op kaarten of knoppen; een verloop onder de lijn in lijngrafieken is wel goed). Lichte, doorschijnende (frosted-glass) accenten spaarzaam, alleen op hero-gedeeltes. Lichte zwevende pill-navigatie onderaan.
- **Lettertype:** Plus Jakarta Sans.
- **Iconen:** eigen eenvoudige lijn-iconen, geen emoji.
- **Kleurenpalet (moodboard):** French Lavender #C7B0FF, Citrus Green #E0E446, Soft Peach #FFE8D2, Sunset Orange #FF7144, Glacier Blue #D8E6FF, Electric Blue #334ED8, Deep Green #33473B, Petunia Pink #FFA9FF, Vibrant Mint #C0F0AA.
- **Sfeer:** minimaal en rustig, maar speels met persoonlijkheid. Niet saai, niet druk of blokkerig. Geen kaart-in-kaart-indelingen en geen zware, zwaar opgevulde vakken.
- **Workout-logscherm:** qua opbouw dicht bij Hevy (compacte tabel met SET / PREVIOUS / KG / REPS, vinkje per set, kebab-menu om van oefening te wisselen), maar in mijn eigen stijl.

## 4. Kernfuncties (MVP)

### 4.1 Workouts loggen
- Schema's/templates aanmaken en bewerken, onbeperkt aantal (bijv. Ma/Do/Za).
- Sessie starten vanuit een template; per oefening sets, reps, gewicht, optioneel RPE (1-10) en notitie.
- Vorige sessie zichtbaar per oefening; rusttimer per set.
- Oefeningenbibliotheek met zoeken + eigen oefeningen toevoegen (ook assisted-oefeningen, waar het "gewicht" een assist is).
- Automatische PR-detectie (zwaarste gewicht, meeste reps op gewicht, geschat 1RM) met duidelijke melding.
- **Import van mijn Hevy-historie** via CSV (Hevy: Profiel > Instellingen > Export & Import Data > Export Workouts). Zie bijlage A voor de exacte structuur en aandachtspunten.
- **Vaste notitie per oefening** die elke sessie zichtbaar is: machine-instelling (bijv. stoelstand), doel-repbereik en aanwijzingen (bijv. "links eerst"). Dit gebruik ik nu in Hevy al veel.

### 4.2 Voortgang en grafieken
- **Eén voortgangstab** met alle grafieken bij elkaar: kracht per oefening, volume per week, lichaamsgewicht, omtrekken.
- Tijdsbereik kiezen (4 weken, 3 maanden, jaar, alles) en zonder harde historielimiet.
- Maand- en jaaroverzicht: aantal sessies, welke dagen ik train, verdeling per spiergroep, totaal volume, behaalde PR's.

### 4.3 Lichaamsmetingen
- Gewicht en omtrekken invullen met datum. Standaardvelden: borst, onderborst, taille, buik/navel, heupen, billen, bovenbeen L/R, bovenarm L/R (aanpasbaar).
- Grafiek per meting plus verandering t.o.v. de start.
- Gewichtsgrafiek met voortschrijdend gemiddelde (dagfluctuaties zijn ruis).
- Meetschema: elke 2 weken een meetmoment, met herinnering als ik er een mis.
- Eenmalige import van mijn bestaande metingen uit het Google Sheet "Gym dashboard".

### 4.4 Eetnotities (dagscherm)
- Per dag één scherm met **losse blokken per maaltijd**: ontbijt, lunch, snack, diner en extra/buffer.
- Elk blok heeft een vrij notitieveld (wat ik at, in gewone taal, zo uitgebreid als ik wil) en een optionele receptlink.
- Elk blok heeft ook velden voor kcal, eiwit, vet en koolhydraten. In v1 vul ik die zelf in.
- **Bovenaan het dagscherm: wat er nog over is.** Dagdoel min wat ik al gelogd heb, voor kcal en alle drie de macro's (bijv. "nog 45 g eiwit, 380 kcal"). Het dagdoel is instelbaar (nu 1800 kcal / 130 g eiwit / 60 g vet / 185 g koolhydraten).
- Kleurloze, rustige weergave: geen rood/groen-oordeel, alleen de cijfers.
- Functie "Kopieer voor coach": zet de notities van de dag of week als nette tekst klaar, zodat ik ze in mijn Claude-chat kan plakken. Ik plak de geschatte macro's terug in de velden.
- **Fase 2, optioneel:** knop "Schat macro's" per maaltijdblok, die de notitie naar de Claude API stuurt en een voorstel in de velden zet dat ik kan aanpassen en bevestigen (zie sectie 7).

### 4.5 Delen met mijn coach (Claude)
- Knop "Samenvatting kopiëren": de laatste 2-4 weken als compacte tekst (sessies, PR's, krachtverloop per hoofdoefening, gewicht/omtrekken, gemiddeld eiwit, RPE-trend). Dit vervangt handmatig data overtypen in de chat.

### 4.6 Galaxy Watch 7 en gezondheidsdata (voorstel: fase 2)
**Doel:** data van mijn Galaxy Watch 7 komt automatisch in de app, zonder overtypen.

**Hoe het loopt:** Galaxy Watch, dan Samsung Health op mijn telefoon, dan Health Connect (Android), dan de app. Health Connect is een voorziening op het Android-toestel zelf. Een gewone webapp kan het niet lezen, dus hiervoor is een Android-app of Android-wrapper nodig. Desktop krijgt de data via de synchronisatie vanaf mijn telefoon.

**Gegevens (fase 2, alleen lezen, toestemming per datatype):**
- Trainingssessies van de watch (duur, gemiddelde en maximale hartslag, calorieën), gekoppeld aan de bijbehorende workout in de app op basis van tijd.
- Slaapduur per nacht.
- Dagelijkse stappen en rusthartslag.
- Gewicht en lichaamssamenstelling, als die in Health Connect staan. Ook nodig voor de MyFitt-weegschaal: eerst nakijken of die daar naartoe schrijft.

**Gebruik:**
- Toon watch-data in de workout-samenvatting.
- Toon slaap en stappen op de voortgangstab, naast krachtverloop.
- Neem ze op in "Samenvatting kopiëren", zodat mijn coach herstel meeweegt.

**Aandachtspunten**
- Continue hartslag van de watch komt om batterijredenen niet direct in Samsung Health op de telefoon. Data kan dus vertraagd binnenkomen. Geen real-time verwachten.
- Eerst controleren in Health Connect op mijn telefoon (Samsung Health > Instellingen > Health Connect) of de gewenste datatypes er daadwerkelijk in staan, voordat de integratie wordt gebouwd.
- De app schrijft niets terug naar Health Connect.
- Een app op het horloge zelf (sets loggen vanaf de pols) valt buiten scope, zie sectie 5.

### 4.7 Mobiel en desktop
- **Mobiel:** hoofdgebruik. Snel loggen, grote tap-targets, werkt offline.
- **Desktop:** volwaardige weergave voor analyse (grafieken naast elkaar), schema's bewerken, eten en metingen invullen met toetsenbord, importeren en exporteren.
- Eén responsive codebase. Alles wat ik op mijn telefoon log staat kort daarna ook op desktop, en andersom.

## 5. Later / nice-to-have

- **Progressie-suggestie volgens mijn regel:** als ik consistent méér reps haal dan gepland, stelt de app het volgende gewicht voor (bijv. 130 kg naar 135 kg). Assisted pull-ups: minder assist als reps stijgen.
- **Weegschaal-koppeling** (MyFitt) via Health Connect, zie 4.6 en open vragen.
- **Wear OS-app op het horloge** om sets en rusttimer vanaf de pols te bedienen. Vraagt een aparte app voor het horloge en is veel extra werk, dus alleen als de rest goed draait.
- **Voortgangsfoto's** (privé, op het apparaat), met vergelijking naast elkaar.
- **Deload/herstelsignalen:** melding als RPE meerdere sessies achter elkaar hoog is of kracht daalt.
- **Wekelijks eiwit-overzicht:** aantal dagen dat ik mijn eiwitdoel haalde.
- Receptenlijst met vaste kcal/eiwit-schattingen, zodat een terugkerend gerecht met één tik is te loggen.
- Slaap/herstel-notitie per dag (handmatig).

## 6. Bewust niet

- Geen social features, volgers, feeds of challenges.
- Geen abonnement of paywall.
- Geen medische adviezen of diagnoses.
- Geen app op het horloge zelf. Horloge-data komt alleen binnen via Health Connect.
- Geen accounts voor andere gebruikers. Wel één eigen inlog, nodig voor synchronisatie tussen telefoon en desktop.

## 7. Technische richting (voorstel, Claude Code mag onderbouwd afwijken)

- **Responsive web-app (PWA) als basis:** mobiel eerst, ook volwaardig op desktop. Installeerbaar op mijn telefoon, werkt offline, één codebase, geen app-store nodig.
- **Offline-first met cloud-synchronisatie.** Omdat ik telefoon én desktop gebruik, kan data niet alleen lokaal staan. Lokaal op het apparaat (bijv. IndexedDB), zodat loggen offline werkt, met synchronisatie naar een eigen database (één gebruiker met inlog). Kies een EU-regio (gezondheidsdata) en een goedkope of gratis optie. Behoud export/import naar JSON en CSV. De cloud-kopie is ook meteen mijn back-up.
- Eenvoudige, veelgebruikte stack met goede documentatie, zodat ik er later zelf of met Claude Code makkelijk aan kan blijven bouwen.
- Oefeningenbibliotheek: een open dataset gebruiken (bijv. free-exercise-db of wger; licentie en kwaliteit eerst controleren) plus eigen oefeningen.
- Ontwerp mobile-first, met grote tap-targets. Desktop krijgt een eigen indeling (meer kolommen, grafieken naast elkaar).
- **Platform en horloge:** Android en desktopbrowser. Voor Health Connect (horloge en weegschaal) is een Android-wrapper rond dezelfde webapp nodig (bijv. Capacitor met een Health Connect-plugin) of een kleine native Android-module. Dit is fase 2, maar login, synchronisatie en een tabel voor gezondheidsdata moeten er vanaf het begin op voorbereid zijn.
- **Claude API voor macro-schatting (fase 2):** de API-key mag nooit in de frontend-code staan. Gebruik een klein serverless endpoint of proxy dat de key beheert. Kies een goedkoop model (Haiku 4.5 of Sonnet 5) en stuur alleen de maaltijdnotitie plus een korte vaste instructie mee. Dit is een aparte API-rekening en staat los van mijn Claude-abonnement.
- De API kent mijn Claude-project niet (geen projectbestanden, geen chatgeheugen). Relevante context (vegetarisch, dagdoel, standaardontbijt) hoort dus in de vaste instructie van de app.

## 8. Datamodel (grof)

- **Exercise:** naam, spiergroep(en), apparatuur, type (gewicht x reps / assisted / alleen reps / duur / afstand+duur), vaste notitie (instelling, doel-repbereik).
- **Template:** naam, dag, lijst oefeningen met doelsets, doelreps, startgewicht.
- **Workout:** datum, template, duur, notitie, sessie-RPE.
- **SetLog:** workout, oefening, volgorde, set-type (normal/warmup/dropset/failure), gewicht (kg), reps, duur (sec), afstand (km), RPE, notitie. Alle waardevelden zijn optioneel.
- **BodyMeasurement:** datum, gewicht, omtrekken (key/value zodat velden aanpasbaar zijn).
- **FoodEntry:** datum, maaltijd, omschrijving, receptlink, kcal, eiwit, vet, koolhydraten.
- **Goals:** dagdoelen voor kcal en macro's, meetschema.
- **HealthDay:** datum, slaapduur, stappen, rusthartslag, bron (fase 2).
- **WorkoutHealth:** koppeling workout en watch-sessie, met gemiddelde en maximale hartslag, calorieën en bron (fase 2).
- **User:** één gebruiker met inlog.
- Alle records krijgen een uniek id en een tijdstip van laatste wijziging, voor synchronisatie.

## 9. Succescriteria

- Een set loggen kost me minder dan 5 seconden.
- Ik zie in één scherm mijn voortgang sinds de start, zonder per oefening te klikken.
- Na 12 maanden is alle data nog te doorzoeken en te exporteren.
- Ik gebruik de app 4 weken achter elkaar in plaats van Hevy en mis niets essentieels.
- Wat ik op mijn telefoon log staat kort daarna ook op desktop.
- Slaap, stappen en trainingshartslag van mijn horloge staan zonder handwerk in de app (fase 2).

## 10. Beslissingen en open vragen

**Besloten**
- Apparaten: Android-telefoon (hoofdgebruik) en desktop, met synchronisatie.
- Koppeling met Galaxy Watch 7 gewenst, via Samsung Health en Health Connect.
- Eetnotities: per maaltijd apart blok met notitie, macro-velden en resterend dagdoel.
- Hevy-historie wordt geïmporteerd via de CSV-export. Metingen komen uit mijn Google Sheet "Gym dashboard".
- Design richting: zie sectie 3.

**Nog open**
1. **Horlogekoppeling in v1 of fase 2?** Mijn voorstel is fase 2: eerst de kernapp met loggen, voortgang, eten en synchronisatie, daarna de Android-wrapper met Health Connect. Dat houdt de eerste versie klein.
2. **MyFitt-weegschaal:** schrijft de MyFitt-app naar Samsung Health of Health Connect, of heeft hij een CSV-export? Zo niet, dan blijft gewicht handmatig.
3. **Macro-schatting in de app:** direct in fase 1, of eerst plakken via de chat en later automatiseren?
4. **Gebruikers:** blijft dit alleen voor mij, of gebruikt mijn partner hem ook? Dan moet inloggen meerdere gebruikers ondersteunen.
5. **Naam van de app** en of ik naast de lichte stijl ook een donker thema wil.

## Bijlage A: Hevy CSV-import (gebaseerd op mijn eigen export)

**Wat er in mijn bestand zit:** 127 workouts, 2348 setrijen, van 17 juni 2025 tot en met 2 september 2026 (dus ruim 14 maanden, niet beperkt). Eén rij per set, nieuwste eerst.

**Kolommen:** title, start_time, end_time, description, exercise_title, superset_id, exercise_notes, set_index, set_type, weight_kg, reps, distance_km, duration_seconds, rpe.

**Aandachtspunten voor de importer**
1. **Eenheden lezen uit de kolomnamen.** Mijn export heeft `weight_kg` en `distance_km`. Andere exports kunnen `weight_lbs` en `distance_miles` hebben. Herken beide en reken om naar kg/km.
2. **Datumformaat:** `2 Sep 2026, 17:52` (dag, Engelse maandafkorting, geen seconden, geen tijdzone). Een workout bestaat uit alle rijen met dezelfde `start_time` en `title`. Op één dag komt een keer twee workouts voor.
3. **Workout-titels zijn rommelig:** 33 verschillende titels, waaronder automatische zoals "Afternoon workout" en "Morning workout" en wisselende schema-namen (Upperbody A, Lower 1, Full body 1, Fullbody 2, ...). Titels niet gebruiken om schema's automatisch te herkennen. Toon ze in het importscherm en laat mij ze eventueel koppelen of hernoemen.
4. **Oefeningsnamen opschonen:** 73 unieke namen, met varianten en typefouten (bijv. "Squad" i.p.v. "Squat", "Smit Machine", "rdl cable", "Lat Pulldown (Cable)" naast "(Machine)", "Seated Cable Row - Bar Grip" naast "V Grip"). Voeg een importstap toe met een lijst "gevonden naam > oefening in de app" waarin ik kan samenvoegen of hernoemen.
5. **Ontbrekende waarden zijn normaal:**
   - 46 sets zonder gewicht (lichaamsgewicht: plank, push-up, knee raise, glute bridge, wall sit) en 24 zonder reps (plank, wall sit, walking lunge, een run).
   - Tijdgebonden oefeningen gebruiken `duration_seconds` (plank, wall sit); hardlopen gebruikt afstand plus duur.
   - Enkele sets hebben `duration_seconds` = 0 bij een gewone oefening (ruis, negeren).
6. **RPE is leeg** in het hele bestand: ik heb het nooit gelogd. De app moet dit als optioneel veld behandelen en er geen grafieken van maken tot er data is.
7. **Set-types:** bijna alles is `normal` (één dropset). Warm-up sets zijn dus nooit als warm-up gelogd. Niet meerekenen in volume of PR's waar `warmup` staat.
8. **Assisted pull-ups:** het "gewicht" is de assist (36 kg in juli 2025, nu 18 kg). Lager is beter. PR-logica en grafieken moeten dat omdraaien.
9. **exercise_notes** bevat mijn aantekeningen per oefening: repbereiken ("10 - 12"), machine-instellingen ("Stoel 5", "Seat 6") en aanwijzingen ("Links eerst"). Importeer de meest recente notitie per oefening als vaste oefeningsnotitie en bewaar de oudere als sessienotitie.
10. **Herhaald importeren:** het laatste record is 2 september 2026. Ik kan later een nieuwe export doen. Voorkom dubbele workouts door te ontdubbelen op `start_time` + `title` + oefening + `set_index`.
11. **Lichaamsmetingen** zitten niet in dit bestand. Ik heb ze nooit in Hevy bijgehouden, dus daar valt niets te importeren. Alleen mijn Google Sheet "Gym dashboard" wordt geïmporteerd.
12. **Niet in de export:** foto's en social-gegevens.

**Testcases voor na de import**
- Leg Press (Machine): 60 kg (jul 2025) naar 140 kg (sep 2026).
- Pull Up (Assisted): assist 36 kg naar 18 kg.
- Chest Press (Machine): 25 kg naar 34 kg.
- Totaal 127 workouts en 2348 sets moeten na import kloppen (minus eventuele bewust overgeslagen ruis-rijen).
