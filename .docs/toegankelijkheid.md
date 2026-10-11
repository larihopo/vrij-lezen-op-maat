# Toegankelijkheid en responsive design

## 1. Doel

Bij het ontwerpen en ontwikkelen van de webapplicatie is rekening gehouden met de basisprincipes van WCAG 2.1. Het doel is dat de interface begrijpelijk, overzichtelijk en zoveel mogelijk met verschillende invoermethoden te gebruiken is.

## 2. Semantische HTML

De applicatie gebruikt herkenbare HTML-elementen zoals `header`, `nav`, `main`, `form`, `label` en `button`.

De pagina's bevatten duidelijke hoofdkoppen. De algemene paginataal is ingesteld op Nederlands met `lang="nl"`.

De hoofdnavigatie heeft een beschrijvend `aria-label`.

## 3. Toetsenbordbediening

Voor links, knoppen, invoervelden en keuzelijsten zijn zichtbare focusstijlen opgenomen.

Bovenaan de applicatie staat een skiplink waarmee toetsenbordgebruikers de hoofdnavigatie kunnen overslaan en direct naar de hoofdinhoud kunnen navigeren.

Interactieve onderdelen maken gebruik van standaard HTML-elementen, zodat basisbediening met Tab, Enter en Spatie mogelijk is.

## 4. Formulieren en foutmeldingen

Invoervelden hebben zichtbare labels.

Verplichte velden gebruiken HTML-validatie waar mogelijk. Bij fouten worden begrijpelijke meldingen getoond.

Foutmeldingen gebruiken op relevante plaatsen `role="alert"`, zodat ondersteunende technologie veranderingen kan signaleren.

## 5. Laden en feedback

Bij asynchrone verzoeken toont de applicatie laadmeldingen, foutmeldingen en waar nodig knoppen om opnieuw te proberen.

In de catalogus worden skeletons gebruikt tijdens het laden. Deze decoratieve elementen zijn verborgen voor schermlezers.

Statusmeldingen worden op relevante plaatsen aangeduid met `role="status"` of `aria-live`.

## 6. Responsive design

De lay-out gebruikt flexibele CSS Grid- en Flexbox-indelingen.

Voor smallere schermen zijn mediaqueries opgenomen. Formulieren, catalogusfilters en knoppen worden op mobiele schermen aangepast.

Tekst, kaarten en invoervelden hebben flexibele afmetingen om verschillende schermbreedtes te ondersteunen.

## 7. Kleur en beweging

De interface gebruikt donkere tekst op lichte achtergronden en duidelijke focusranden.

Belangrijke meldingen bevatten tekst, zodat de betekenis niet alleen van kleur afhankelijk is.

Bij `prefers-reduced-motion: reduce` worden de skeletonanimaties uitgeschakeld.

## 8. Handmatige eindcontrole

Voor een volledige beoordeling moeten nog de volgende controles worden uitgevoerd:

- Toetsenbordnavigatie op de belangrijkste pagina's.
- Werking van de skiplink.
- Weergave op een smal mobiel scherm, bijvoorbeeld 375 pixels.
- Gebruik bij 200% browserzoom.
- Controle van tekstcontrast in alle componenten.
- Controle van formulieren en foutmeldingen met ondersteunende technologie.

De aanwezige code toont dat toegankelijkheid is meegenomen in het ontwerp. Dit document is geen verklaring dat alle WCAG 2.1-succescriteria volledig zijn getest of behaald.

## 9. Conclusie

De applicatie past verschillende basismaatregelen voor toegankelijkheid toe: semantische HTML, formulierlabels, toetsenbordfocus, skipnavigatie, laadfeedback en responsive CSS.

Voor een toekomstige productieversie zijn uitgebreidere toegankelijkheidstests en eventuele aanvullende verbeteringen nodig.