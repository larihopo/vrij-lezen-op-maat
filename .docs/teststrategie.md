# Teststrategie en kwaliteitsborging

## 1. Doel

Het doel van de teststrategie is om te controleren of de belangrijkste onderdelen van de applicatie *Vrij lezen op maat* correct en veilig werken.

Daarbij richt ik mij op:

- De correctheid van het matchingalgoritme voor leesadviezen.
- Het functioneren van belangrijke gebruikersstromen.
- Het bewaren van gegevens in de database.
- Authenticatie en autorisatie.
- De kwaliteit van de TypeScript-code.
- Het succesvol bouwen van de front-end en back-end.

Ik combineer hiervoor unit tests, end-to-endtests, linting en buildcontroles.

## 2. Unit tests

### Gekozen aanpak

Voor de unit tests gebruik ik **Vitest**.

Unit tests controleren afzonderlijke onderdelen van de applicatie, zonder dat hiervoor de volledige gebruikersinterface of een draaiende webserver nodig is.

De tests richten zich op het matchingalgoritme dat boeken rangschikt aan de hand van een leesprofiel.

**Bestand:** `back-end/src/services/recommendation.service.test.ts`

### Waarom dit onderdeel?

Het matchingalgoritme bevat bedrijfslogica. De uitkomst wordt bepaald door de eigenschappen van een leesprofiel en de metadata van boeken.

Door deze logica afzonderlijk te testen, kan ik controleren of de functie zich voorspelbaar gedraagt. Bovendien zijn deze tests snel uit te voeren omdat er geen echte HTTP-verzoeken of databaseverbindingen nodig zijn.

### Uitvoering

Vanuit de back-end:

```powershell
npm run test
```

**Resultaat:** 5 unit tests geslaagd.

De exacte invoer, verwachte uitkomsten en eventuele grensgevallen zijn terug te vinden in het testbestand.

## 3. End-to-endtests

### Gekozen aanpak

Voor de end-to-endtests gebruik ik **Playwright**.

Met deze tests controleer ik belangrijke gebruikersstromen vanuit de browser. Daarnaast gebruik ik Playwright om beveiligde API-endpoints rechtstreeks aan te roepen.

**Bestand:** `front-end/e2e/basic-flows.spec.ts`

### Testgevallen

| Nr. | Testscenario | Verwacht resultaat | Resultaat |
|---|---|---|---|
| 1 | Publieke catalogus openen | Een bezoeker kan de catalogus bekijken en er worden boeken getoond. | Geslaagd |
| 2 | Zonder account leesadvies openen | De bezoeker wordt doorgestuurd naar de inlogpagina. | Geslaagd |
| 3 | Inloggen als student | De student kan het leesprofiel, drie leesadviezen en de leeslijst bekijken, maar niet de docentenomgeving openen. | Geslaagd |
| 4 | Inloggen als docent | De docent kan de docentenomgeving openen, maar niet de afgeschermde studentenpagina voor leesadvies gebruiken. | Geslaagd |
| 5 | Leesstatus aanpassen | Een student kan de gelezen-status van een boek wijzigen. Na het vernieuwen van de pagina blijft de nieuwe status behouden. De oorspronkelijke status wordt daarna hersteld. | Geslaagd |
| 6 | Autorisatie van docentgegevens | Een gekoppelde docent krijgt toegang. Een niet-gekoppelde docent wordt geweigerd, ook bij een poging om een boek toe te voegen. | Geslaagd |

**Resultaat:** 6 end-to-endtests geslaagd.

### Extra beveiligingscontroles

De zesde test controleert de autorisatie rechtstreeks via de Fastify-API.

| Situatie | Verwachte HTTP-status |
|---|---|
| Gekoppelde docent bekijkt studentgegevens | `200 OK` |
| Niet-gekoppelde docent bekijkt studentgegevens | `404 Not Found` |
| Niet-gekoppelde docent probeert een boek toe te voegen | `404 Not Found` |
| Verzoek zonder JWT | `401 Unauthorized` |
| Student gebruikt een docentendpoint | `403 Forbidden` |

Deze controles zijn belangrijk omdat beveiliging niet alleen in de front-end mag plaatsvinden. Ook wanneer iemand zelf HTTP-verzoeken verstuurt, moet de back-end ongeautoriseerde toegang tegenhouden.

## 4. Persistente gegevens testen

De vijfde end-to-endtest controleert of een wijziging daadwerkelijk wordt opgeslagen.

De test doorloopt de volgende stappen:

1. Inloggen als student.
2. De persoonlijke leeslijst openen.
3. De huidige gelezen-status van een boek vastleggen.
4. De status aanpassen.
5. De pagina vernieuwen.
6. Controleren of de gewijzigde status nog steeds aanwezig is.
7. De oorspronkelijke status herstellen.

Hiermee wordt meer getest dan alleen een visuele verandering: de opgeslagen status moet na een nieuwe paginalading opnieuw worden opgehaald.

## 5. Codekwaliteit en linting

Voor zowel de front-end als de back-end gebruik ik **ESLint**.

Linting controleert de code op onder andere ongebruikte variabelen, problematische patronen en overtredingen van de ingestelde TypeScript- en React-regels.

### Front-end

```powershell
cd front-end
npm run lint
npm run build
```

**Resultaat:** linting en productiebuild geslaagd.

### Back-end

```powershell
cd back-end
npm run lint
npm run build
```

**Resultaat:** linting en TypeScript-build geslaagd.

Linting vervangt geen tests. Een applicatie kan voldoen aan de lintregels en toch functionele fouten bevatten. Daarom worden beide controles gecombineerd.

## 6. Testomgeving

De tests worden lokaal uitgevoerd met de volgende onderdelen:

- Next.js-front-end op `http://localhost:3000`.
- Fastify-back-end op `http://localhost:3001`.
- PostgreSQL in Docker.
- MongoDB in Docker.
- Demoaccounts voor één student en twee docenten.

Voor de end-to-endtests moeten de applicatie en de benodigde databases actief zijn.

De testaccounts moeten bestaan en de student moet over een leesprofiel, een leeslijstitem en een docentkoppeling beschikken.

### E2E-tests uitvoeren

Vanuit de front-endmap worden eerst de wachtwoorden als tijdelijke PowerShell-omgevingsvariabelen ingesteld:

```powershell
$env:E2E_STUDENT_PASSWORD = Read-Host "Wachtwoord student"
$env:E2E_DOCENT_PASSWORD = Read-Host "Wachtwoord docent 1"
$env:E2E_DOCENT_2_PASSWORD = Read-Host "Wachtwoord docent 2"

npm run test:e2e
```

De wachtwoorden worden niet in de testcode opgeslagen en mogen niet in Git worden vastgelegd.

## 7. Waarom meerdere soorten controles?

De verschillende controles vullen elkaar aan.

**Unit tests** controleren de correctheid van afzonderlijke functies. Ze zijn snel, maar bewijzen niet dat de volledige applicatie werkt.

**End-to-endtests** controleren belangrijke gebruikersstromen en de samenwerking tussen verschillende onderdelen. Ze zijn uitgebreider, maar doorgaans langzamer en afhankelijk van de testomgeving.

**Linting** controleert de codekwaliteit volgens vaste regels. Dit helpt om bepaalde fouten vroeg te ontdekken.

**Buildcontroles** controleren of de applicatie succesvol gecompileerd kan worden.

Door deze technieken te combineren ontstaat meer zekerheid dan wanneer slechts één testmethode zou worden gebruikt.

## 8. Beperkingen en risico's

De tests geven vertrouwen in de belangrijkste onderdelen van de applicatie, maar vormen geen volledige testdekking.

De volgende zaken worden nog niet volledig automatisch getest:

- Alle mogelijke invoer- en validatiefouten van formulieren.
- Alle catalogusfilters en pagineringscombinaties.
- Alle mogelijkheden om boeken toe te voegen aan een leeslijst.
- Alle foutscenario's bij uitval van de databases.
- Toegankelijkheid met verschillende schermlezers.
- Het gedrag in alle browsers en op alle schermformaten.
- Belasting bij grote aantallen gelijktijdige gebruikers.

Ook zijn de end-to-endtests afhankelijk van vooraf aanwezige demogegevens.

Voor een productieversie zou ik aanvullende tests toevoegen, bijvoorbeeld met een afzonderlijke testdatabase, automatische testdata-initialisatie, toegankelijkheidsscans en CI-controles.

## 9. Conclusie

De belangrijkste gebruikersstromen, het bewaren van de gelezen-status en de toegangscontrole voor docenten zijn automatisch getest.

De uitgevoerde kwaliteitscontroles hebben de volgende resultaten opgeleverd:

| Controle | Resultaat |
|---|---|
| Vitest unit tests | 5 geslaagd |
| Playwright end-to-endtests | 6 geslaagd |
| Front-end ESLint | Geslaagd |
| Back-end ESLint | Geslaagd |
| Front-end productiebuild | Geslaagd |
| Back-end TypeScript-build | Geslaagd |

Hiermee is er aantoonbaar aandacht besteed aan zowel functionele correctheid als codekwaliteit en beveiliging.

De testdekking is gericht op de belangrijkste risico's binnen de proof of concept en is niet bedoeld als volledige productiecertificering.