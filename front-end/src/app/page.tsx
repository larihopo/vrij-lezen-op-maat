export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Proof of Concept</p>
        <h1>Vrij lezen op maat</h1>
        <p>
          Ontdek boeken en teksten die passen bij jouw interesses,
          leesniveau en leesdoel.
        </p>
      </header>

      <section aria-labelledby="features-title">
        <h2 id="features-title">Wat kun je hier doen?</h2>

        <ul className="feature-list">
          <li>
            <h3>Leesprofiel</h3>
            <p>Vul je voorkeuren in voor persoonlijk leesadvies.</p>
          </li>

          <li>
            <h3>Boeken ontdekken</h3>
            <p>Bekijk de catalogus en ontdek nieuwe titels.</p>
          </li>

          <li>
            <h3>Mijn leeslijst</h3>
            <p>Bewaar boeken en houd bij wat je hebt gelezen.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
