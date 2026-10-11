# Onderbouwing technische keuzes

## 1. Inleiding

Voordat een webapplicatie wordt ontwikkeld, is het belangrijk om een geschikte tech-stack te kiezen. De gebruikte technologieën hebben invloed op de ontwikkelsnelheid, onderhoudbaarheid, prestaties en mogelijkheden om de applicatie later uit te breiden.

Bij deze verkenning worden de volgende uitgangspunten gehanteerd:

- De applicatie moet via een webbrowser toegankelijk zijn.
- De front-end en back-end moeten duidelijk gescheiden kunnen worden.
- De applicatie moet gegevens kunnen opslaan en ophalen.
- De code moet overzichtelijk en onderhoudbaar blijven.
- De gekozen technologieën moeten geschikt zijn voor een proof of concept.

Per technologie worden de belangrijkste voordelen, nadelen en afwegingen besproken.

## 2. Front-end: Next.js en React

### Waarom deze keuze?

Voor de front-end wordt gekozen voor Next.js, een framework dat gebruikmaakt van React. React maakt het mogelijk om gebruikersinterfaces op te bouwen uit losse componenten. Next.js voegt hier onder andere routing en een vaste projectstructuur aan toe.

### Voordelen

**1. Herbruikbare componenten**

Met React kunnen onderdelen van de gebruikersinterface als losse componenten worden ontwikkeld. Hierdoor hoeft dezelfde code niet op meerdere plekken te worden geschreven. Dit maakt de front-end overzichtelijker en eenvoudiger te onderhouden.

**2. Ingebouwde routing**

Next.js beschikt over een eigen systeem voor het aanmaken van pagina's en routes. Hierdoor is geen aparte routerbibliotheek nodig en ontstaat er een duidelijke structuur voor de navigatie binnen de applicatie.

### Nadelen

**1. Extra complexiteit**

Next.js heeft meer mogelijkheden dan een eenvoudige React-applicatie. Het onderscheid tussen servercomponenten en clientcomponenten kan de ontwikkeling ingewikkelder maken, vooral wanneer nog weinig ervaring met het framework is opgedaan.

**2. Mogelijk onnodig uitgebreid**

Voor een kleine applicatie zijn niet alle functies van Next.js noodzakelijk. Een gewone React-applicatie met een aparte router kan in sommige gevallen eenvoudiger zijn.

### Afweging

Next.js is een geschikte keuze wanneer een applicatie meerdere pagina's krijgt en een duidelijke front-endstructuur belangrijk is. De extra complexiteit wordt geaccepteerd in ruil voor de ingebouwde mogelijkheden en onderhoudbaarheid.

## 3. Back-endruntime: Node.js

### Waarom deze keuze?

Node.js maakt het mogelijk om JavaScript en TypeScript buiten de browser uit te voeren. Hierdoor kan dezelfde programmeertaal worden gebruikt voor zowel de front-end als de back-end.

### Voordelen

**1. Eén programmeertaal**

Door TypeScript aan beide kanten van de applicatie te gebruiken, hoeft er niet tussen verschillende programmeertalen te worden gewisseld. Dit maakt de ontwikkeling toegankelijker en zorgt voor meer consistentie.

**2. Geschikt voor I/O-verwerking**

Node.js is ontworpen om efficiënt om te gaan met taken zoals HTTP-verzoeken en databasecommunicatie. Dit maakt het een geschikte runtime voor een REST API.

### Nadelen

**1. Minder geschikt voor zware berekeningen**

Node.js gebruikt een eventloop. Wanneer langdurige, zware berekeningen rechtstreeks op deze eventloop worden uitgevoerd, kan dit andere verzoeken vertragen.

**2. Afhankelijkheid van externe packages**

Bij Node.js worden vaak npm-packages gebruikt voor aanvullende functionaliteiten. Deze moeten regelmatig worden bijgewerkt en kunnen onderlinge versieconflicten veroorzaken.

### Afweging

Node.js is een logische keuze voor een webapplicatie waarbij de back-end voornamelijk gegevens verwerkt en beschikbaar stelt via HTTP. Voor applicaties met veel zware berekeningen kunnen andere runtimes geschikter zijn.

## 4. Back-endframework: Fastify

### Waarom deze keuze?

Voor het ontwikkelen van de REST API wordt Fastify overwogen. Fastify is een lichtgewicht framework voor Node.js dat gericht is op prestaties en een duidelijke manier biedt om routes te definiëren.

### Voordelen

**1. Goede prestaties**

Fastify is ontworpen om HTTP-verzoeken efficiënt af te handelen. Hierdoor is het geschikt voor applicaties waarbij regelmatig gegevens tussen front-end en back-end worden uitgewisseld.

**2. Ondersteuning voor validatie en plugins**

Fastify biedt ondersteuning voor requestvalidatie en uitbreidingen via plugins. Functionaliteiten zoals authenticatie en API-documentatie kunnen daardoor op een gestructureerde manier worden toegevoegd.

### Nadelen

**1. Minder vooraf vastgelegde structuur**

Fastify bepaalt niet volledig hoe de applicatie moet worden opgebouwd. De ontwikkelaar moet zelf keuzes maken over de indeling van routes, services en databasecode.

**2. Extra configuratie**

Voor functionaliteiten zoals authenticatie, CORS en documentatie zijn aanvullende plugins en configuraties nodig. Dit kost tijd en vereist kennis van de werking van het framework.

### Afweging

Fastify biedt een goede balans tussen prestaties, flexibiliteit en eenvoud. Een alternatief is Express, dat een groot ecosysteem heeft, maar minder ingebouwde ondersteuning biedt voor bijvoorbeeld schemavalidatie.

## 5. Relationele database: PostgreSQL

### Waarom deze keuze?

PostgreSQL is een relationele database die gegevens opslaat in tabellen. Deze database is geschikt wanneer gegevens een vaste structuur hebben en er relaties tussen verschillende soorten gegevens bestaan.

### Voordelen

**1. Betrouwbare gegevensrelaties**

PostgreSQL ondersteunt primary keys, foreign keys en unieke constraints. Hiermee kan de database voorkomen dat bepaalde ongeldige of dubbele gegevens worden opgeslagen.

**2. Krachtige querymogelijkheden**

Met SQL kunnen gegevens worden gefilterd, gecombineerd en gesorteerd. Dankzij joins kunnen gegevens uit verschillende tabellen efficiënt worden opgevraagd.

### Nadelen

**1. Minder flexibel bij sterk wisselende gegevens**

Wanneer gegevens niet altijd dezelfde structuur hebben, kan een relationeel model ingewikkeld worden. Er zijn dan soms extra tabellen of optionele kolommen nodig.

**2. Schemawijzigingen kosten tijd**

Als de structuur van de gegevens verandert, moeten tabellen en kolommen mogelijk worden aangepast. Dit vraagt om zorgvuldig beheer van databaseschema's en migraties.

### Afweging

PostgreSQL is geschikt voor gegevens waarbij consistentie en onderlinge relaties belangrijk zijn. De duidelijke structuur is een voordeel, ook al maakt die het aanpassen van het datamodel soms minder flexibel.

## 6. Documentdatabase: MongoDB

### Waarom deze keuze?

MongoDB is een documentdatabase waarin gegevens als JSON-achtige documenten worden opgeslagen. Documenten binnen dezelfde collectie hoeven niet allemaal precies dezelfde velden te bevatten.

### Voordelen

**1. Flexibele gegevensstructuur**

MongoDB is geschikt wanneer gegevens verschillende of optionele eigenschappen kunnen hebben. Het is niet noodzakelijk om voor iedere mogelijke eigenschap vooraf een vaste kolom aan te maken.

**2. Gerelateerde gegevens in één document**

Gegevens die logisch bij elkaar horen, kunnen vaak samen worden opgeslagen. Hierdoor zijn voor bepaalde gegevens minder joins nodig dan in een relationele database.

### Nadelen

**1. Minder strikte structuur**

De flexibiliteit kan ook een nadeel zijn. Zonder goede validatie kunnen documenten onderling verschillen op manieren die niet wenselijk zijn.

**2. Relaties vragen extra aandacht**

Bij gegevens met veel onderlinge relaties kan MongoDB ingewikkelder worden. Het waarborgen van consistentie tussen verschillende documenten vereist soms aanvullende logica.

### Afweging

MongoDB is een geschikte optie voor gegevens met een flexibele structuur. Voor sterk relationele gegevens heeft PostgreSQL doorgaans de voorkeur.

Het combineren van beide databases kan nuttig zijn wanneer er duidelijk verschillende soorten gegevens zijn. Daar staat tegenover dat het beheer en de communicatie tussen databases complexer worden.

## 7. ORM: Drizzle ORM

### Waarom deze keuze?

Voor het werken met PostgreSQL vanuit TypeScript wordt Drizzle ORM overwogen. Een ORM maakt het mogelijk om databasebewerkingen via code uit te voeren en helpt om de databasestructuur met de applicatie te verbinden.

### Voordelen

**1. Typeveiligheid**

Drizzle maakt gebruik van TypeScript-types. Hierdoor kunnen bepaalde fouten, zoals verkeerd gebruikte kolommen of onjuiste gegevensvormen, al tijdens het ontwikkelen worden ontdekt.

**2. Databaseschema in code**

Tabellen en kolommen kunnen in TypeScript worden beschreven. Dit maakt de databasestructuur inzichtelijk en ondersteunt het beheren van wijzigingen via migraties.

### Nadelen

**1. Leercurve**

Het gebruik van een ORM vereist kennis van de bijbehorende syntax en werkwijze. Voor eenvoudige queries kan rechtstreeks SQL schrijven soms sneller zijn.

**2. Extra abstractielaag**

Een ORM vormt een laag tussen de applicatie en de database. Voor ingewikkelde of sterk geoptimaliseerde queries kan het alsnog nodig zijn om SQL goed te begrijpen of rechtstreeks te gebruiken.

### Afweging

Drizzle ORM is een passende keuze wanneer TypeScript en een relationele database worden gecombineerd. Het biedt typeveiligheid zonder de werking van SQL volledig te verbergen.

Een alternatief is Prisma, dat eveneens goede TypeScript-ondersteuning biedt, maar een andere manier van schema- en querybeheer gebruikt.

## 8. Ontwikkelomgeving en hosting: Docker Compose

### Waarom deze keuze?

Tijdens de ontwikkeling moet de applicatie op een voorspelbare manier kunnen worden uitgevoerd. Docker Compose is een mogelijkheid om ondersteunende services, zoals databases, lokaal in containers te draaien.

Voor een proof of concept kan in eerste instantie worden gekozen voor een lokale omgeving. Publieke hosting kan in een latere fase worden onderzocht.

### Voordelen

**1. Herhaalbare omgeving**

Met Docker Compose kunnen benodigde services via configuratie worden gestart. Dit vermindert verschillen tussen ontwikkelomgevingen en maakt het eenvoudiger om de omgeving opnieuw op te zetten.

**2. Minder handmatige installatie**

Databases en andere services hoeven niet allemaal rechtstreeks op het besturingssysteem te worden geïnstalleerd. Ze kunnen in afzonderlijke containers draaien.

### Nadelen

**1. Extra systeemvereisten**

Docker gebruikt geheugen en rekenkracht. Vooral op minder krachtige computers kan dit invloed hebben op de prestaties tijdens de ontwikkeling.

**2. Geen automatische publieke beschikbaarheid**

Een lokale Docker-omgeving is niet hetzelfde als productiehosting. Voor publieke toegang zijn aanvullende voorzieningen nodig, zoals een server, domeinnaam, HTTPS en beheer van de infrastructuur.

### Afweging

Docker Compose is een goede keuze voor een lokale ontwikkel- en demonstratieomgeving. Het maakt het eenvoudiger om benodigde services consistent uit te voeren.

Wanneer de applicatie daadwerkelijk door externe gebruikers gebruikt gaat worden, moet een aparte hostingoplossing worden gekozen. Daarbij zijn beveiliging, beschikbaarheid, back-ups en kosten belangrijke aandachtspunten.

## 9. Eindconclusie

Op basis van deze afwegingen wordt gekozen voor een tech-stack met Next.js, React, Node.js, Fastify, PostgreSQL, MongoDB en Drizzle ORM, met Docker Compose voor de lokale ontwikkelomgeving.

Deze combinatie biedt een duidelijke scheiding tussen de gebruikersinterface, de serverlogica en de gegevensopslag. Ook sluiten de gekozen technologieën goed op elkaar aan doordat TypeScript voor een groot deel van de applicatie kan worden gebruikt.

De belangrijkste nadelen zijn de extra complexiteit, de hoeveelheid configuratie en het beheer van meerdere technologieën. Daarom is het belangrijk om de architectuur overzichtelijk te houden en alleen functionaliteit toe te voegen die daadwerkelijk nodig is.