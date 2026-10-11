# Vrij lezen op maat

## Over het project

**Vrij lezen op maat** is een proof of concept voor een webapplicatie die studenten helpt bij het vinden van passend leesmateriaal.

Studenten kunnen een persoonlijk leesprofiel invullen en op basis daarvan drie leesadviezen ontvangen. Daarnaast kunnen zij boeken uit een catalogus bekijken, een persoonlijke leeslijst beheren en aangeven welke boeken zij hebben gelezen.

Docenten kunnen gekoppelde studenten begeleiden door hun leesprofiel en leeslijst te bekijken en boeken aan hun leeslijst toe te voegen.

Het project is ontwikkeld als full-stack webapplicatie, met een afzonderlijke front-end, REST API en twee databases.

## Functionaliteiten

### Studenten

- Inloggen met een persoonlijk account.
- Een leesprofiel aanmaken of aanpassen.
- Een docent kiezen en aan het account koppelen.
- De boekencatalogus bekijken en filteren.
- Drie persoonlijke leesadviezen ontvangen.
- Boeken toevoegen aan een persoonlijke leeslijst.
- Boeken markeren als gelezen of niet gelezen.

### Docenten

- Inloggen met een docentaccount.
- Een overzicht bekijken van gekoppelde studenten met een opgeslagen leesprofiel.
- Het leesprofiel en de leeslijst van een gekoppelde student bekijken.
- Boeken toevoegen aan de leeslijst van een gekoppelde student.

### Beveiliging

De applicatie gebruikt JWT-authenticatie. De back-end controleert de rol van de ingelogde gebruiker en beperkt de toegang tot persoonlijke gegevens.

Een docent kan uitsluitend de gegevens bekijken van studenten die daadwerkelijk aan die docent gekoppeld zijn.

## Gebruikte technologieën

| Onderdeel | Technologie |
|---|---|
| Front-end | Next.js 16, React, TypeScript |
| Back-end | Node.js, Fastify, TypeScript |
| Relationele database | PostgreSQL |
| Documentdatabase | MongoDB |
| ORM | Drizzle ORM |
| Authenticatie | JSON Web Tokens (JWT) |
| API-documentatie | OpenAPI / Swagger |
| Unit tests | Vitest |
| End-to-endtests | Playwright |
| Codekwaliteit | ESLint |
| Lokale databases | Docker Compose |

## Architectuur

De applicatie bestaat uit drie hoofdonderdelen.

**Front-end**

De gebruikersinterface is gebouwd met Next.js en React. Deze verzorgt de pagina's, formulieren, navigatie en weergave van gegevens.

**Back-end**

Fastify biedt een REST API aan. De back-end handelt authenticatie, autorisatie, validatie, bedrijfslogica en databasebewerkingen af.

**Databases**

PostgreSQL bewaart gebruikers, leesprofielen, docent-studentkoppelingen en leeslijstitems.

MongoDB bewaart de catalogus met 183 leesmaterialen.

De front-end communiceert met de back-end via HTTP en JSON. De databases zijn niet rechtstreeks toegankelijk vanuit de browser.

Een uitgebreider architectuurdiagram en het relationele datamodel staan in `.docs/architectuur.md`.

## Projectstructuur

- `front-end/` — Next.js-applicatie en Playwright-tests.
- `back-end/` — Fastify REST API, services, repositories, databaseschema en unit tests.
- `.docs/` — technische documentatie, architectuur en teststrategie.
- `readme.md` — installatie- en projectinformatie.

De back-end gebruikt een gelaagde structuur met routes, services en repositories. De front-end gebruikt pagina's, herbruikbare componenten en gedeelde authenticatiestatus.

## Vereisten

Om de applicatie lokaal te draaien, zijn de volgende onderdelen nodig:

- Node.js en npm.
- Docker Desktop met Docker Compose.
- Een geldige configuratie van de back-end in `.env`.
- De benodigde PostgreSQL-tabellen, demoaccounts en MongoDB-catalogusgegevens.

## Installatie en opstarten

### 1. Dependencies installeren

Open PowerShell in de projectmap.

Installeer eerst de dependencies van de back-end:

```powershell
cd back-end
npm install
```

Installeer vervolgens de dependencies van de front-end:

```powershell
cd ../front-end
npm install
```

### 2. Databases starten

De applicatie gebruikt PostgreSQL en MongoDB via Docker Compose.

Open een terminal in de map met het Docker Compose-configuratiebestand en voer uit:

```powershell
docker compose up -d
```

In de lokale ontwikkelomgeving gebruiken de databases de volgende poorten:

| Database | Lokale poort |
|---|---|
| PostgreSQL | 5433 |
| MongoDB | 27018 |

### 3. Omgevingsvariabelen configureren

De back-end gebruikt omgevingsvariabelen voor onder andere de databaseverbindingen, authenticatie en demoaccounts.

Configureer het bestaande `.env`-bestand in de map `back-end`.

Voor MongoDB is de variabele `MONGODB_URL` vereist. Controleer de bestaande configuratie en broncode voor de overige vereiste variabelen.

**Belangrijk:** plaats geen echte wachtwoorden, JWT-sleutels of andere geheime waarden in Git.

### 4. Databases starten en voorbereiden

Voor de databases wordt Docker Compose gebruikt.

Het Docker Compose-bestand verwacht de volgende omgevingsvariabelen:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `MONGO_ROOT_USER`
- `MONGO_ROOT_PASSWORD`

Deze variabelen moeten beschikbaar zijn voor Docker Compose, bijvoorbeeld via een `.env`-bestand naast het Compose-bestand. De back-end heeft daarnaast een eigen configuratie nodig voor de databaseverbindingen en authenticatie.

Start vanuit de map met het Compose-bestand de databases:

`docker compose up -d`

De containers gebruiken de volgende lokale poorten:

| Database | Container | Lokale poort |
|---|---|---|
| PostgreSQL 17 | `vrijlezen-postgres` | `5433` |
| MongoDB 8.0 | `vrijlezen-mongodb` | `27018` |

De gegevens blijven bewaard in de Docker-volumes `postgres_data` en `mongo_data`.

### Database-initialisatie

Voer in de back-endmap achtereenvolgens de volgende commando's uit:

1. `npm install` — dependencies installeren.
2. `npm run db:migrate` — de bestaande PostgreSQL-migraties uitvoeren.
3. `npm run db:seed` — de demogegevens initialiseren.
4. `npm run db:import-catalog` — de boekencatalogus importeren naar MongoDB.

Voor het importeren moet het benodigde bronbestand op de locatie staan die het importscript verwacht.

Het commando `npm run db:generate` is bedoeld voor het genereren van nieuwe migraties na een wijziging in het Drizzle-schema. Dit is normaal gesproken niet nodig om bestaande migraties op een nieuwe omgeving uit te voeren.

### 5. Applicatie starten

Start de back-end vanuit `back-end`:

`npm run dev`

Start in een tweede terminal de front-end vanuit `front-end`:

`npm run dev`

De applicatie is lokaal bereikbaar via `http://localhost:3000` en de REST API via `http://localhost:3001`.

Swagger UI is beschikbaar op `http://localhost:3001/documentation/`.

## Demoaccounts

Voor het demonstreren van de verschillende gebruikersrollen zijn demoaccounts beschikbaar.

| Rol | E-mailadres |
|---|---|
| Student | `student@vrijlezen.test` |
| Docent 1 | `docent@vrijlezen.test` |
| Docent 2 | `docent2@vrijlezen.test` |

De wachtwoorden worden via de bestaande demoaccountconfiguratie ingesteld en zijn bewust niet opgenomen in deze README.

## Leesadvies

Het persoonlijke leesadvies wordt samengesteld op basis van vier eigenschappen uit het leesprofiel.

| Match | Punten |
|---|---:|
| Passend leesniveau | 4 |
| Passend genre | 3 |
| Passend onderwerp | 2 |
| Passende lengte | 1 |
| **Maximale score** | **10** |

De boeken worden gesorteerd op matchscore. Bij een gelijke score wordt de titel gebruikt als aanvullende sortering.

Dubbele titels worden verwijderd en de drie hoogst gerangschikte boeken worden teruggegeven.

Wanneer bepaalde catalogusmetadata ontbreekt, worden daarvoor geen matchpunten toegekend. Het algoritme kan dan alsnog een aanvullende ontdekkingstip geven.

Het veld `leesdoel` wordt wel opgeslagen in het leesprofiel, maar maakt momenteel geen onderdeel uit van de scoreberekening.

## REST API en OpenAPI

De Fastify-back-end biedt REST-endpoints aan voor onder andere:

- Authenticatie en gebruikersrollen.
- Leesprofielen.
- Catalogus en filters.
- Persoonlijke leesadviezen.
- Leeslijsten en gelezen-status.
- Docentkoppelingen.
- De docentenomgeving.

Beveiligde endpoints verwachten een JWT via de HTTP-header `Authorization: Bearer <token>`.

De API-documentatie is beschikbaar via Swagger UI:

**http://localhost:3001/documentation/**

De OpenAPI-specificatie is ook beschikbaar als JSON:

**http://localhost:3001/documentation/json**

Alle 17 API-operaties hebben een gedocumenteerd succesvol responseschema.

## Testen en codekwaliteit

Er worden verschillende vormen van kwaliteitscontrole gebruikt.

### Unit tests

De unit tests zijn geschreven met Vitest en controleren de werking van het aanbevelingsalgoritme.

Voer vanuit de back-endmap uit:

```powershell
npm run test
```

**Resultaat bij de laatste controle: 5 geslaagde unit tests.**

### End-to-endtests

De end-to-endtests zijn geschreven met Playwright.

Deze controleren onder andere:

- Het openen van de openbare catalogus.
- Het afschermen van pagina's voor niet-ingelogde gebruikers.
- De belangrijkste studenten- en docentpagina's.
- Het bewaren van wijzigingen aan de gelezen-status.
- Het weigeren van ongeautoriseerde toegang tot studentgegevens.

Voor de tests zijn drie demoaccounts nodig.

Open PowerShell in `front-end` en voer uit:

```powershell
$env:E2E_STUDENT_PASSWORD = Read-Host "Wachtwoord student"
$env:E2E_DOCENT_PASSWORD = Read-Host "Wachtwoord docent 1"
$env:E2E_DOCENT_2_PASSWORD = Read-Host "Wachtwoord docent 2"

npm run test:e2e
```

De wachtwoorden gelden alleen voor de huidige PowerShell-sessie en worden niet in de broncode opgeslagen.

**Resultaat bij de laatste controle: 6 geslaagde end-to-endtests.**

### Linting

Zowel de front-end als de back-end gebruikt ESLint.

Voer in iedere projectmap uit:

```powershell
npm run lint
```

### Productiebuilds

Controleer of beide projecten succesvol compileren:

```powershell
npm run build
```

Dit commando wordt afzonderlijk uitgevoerd in `front-end` en `back-end`.

Meer informatie over de testaanpak, testgevallen en beperkingen staat in `.docs/teststrategie.md`.

## Beperkingen

Dit project is een proof of concept en geen volledig uitgerolde productieapplicatie.

De belangrijkste beperkingen zijn:

- De applicatie is ingericht voor lokaal gebruik en demonstratie.
- De catalogus bevat deels onvolledige metadata.
- Van de 183 leesmaterialen hebben 55 een toegekende genrecategorie en 4 een gecontroleerde lengtecategorie.
- Niet alle formulier- en foutscenario's worden automatisch getest.
- De applicatie bevat nog geen volledige productievoorzieningen zoals HTTPS-configuratie, automatische back-ups en monitoring.
- Het leesdoel beïnvloedt momenteel niet de berekende adviesscore.

## Documentatie

Aanvullende technische documentatie staat in de map `.docs`:

- `architectuur.md` — systeemarchitectuur, communicatie tussen componenten en ERD.
- `technische-keuzes.md` — onderbouwing van de tech-stack met voor- en nadelen.
- `teststrategie.md` — testaanpak, testgevallen, resultaten en beperkingen.

## Conclusie

*Vrij lezen op maat* demonstreert een full-stack webapplicatie waarin een Next.js-front-end, Fastify REST API, PostgreSQL en MongoDB samenwerken.

De proof of concept bevat persoonlijke leesadviezen, leeslijsten, docentbegeleiding en beveiligde toegang tot gebruikersgegevens.

Met unit tests, end-to-endtests, ESLint en OpenAPI-documentatie is daarnaast aandacht besteed aan de correctheid, onderhoudbaarheid en controleerbaarheid van het systeem.